import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { usePlaidLink } from 'react-plaid-link';
import { CreditCard, RefreshCw, Unlink, Wifi } from 'lucide-react';
import { plaidAPI } from '../../services/api';
import { formatCurrency } from '../../utils/validators';
import { toast } from 'react-toastify';

const Card = styled.div`
  background: #141414;
  border: 1px solid #222222;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h3`
  font-size: 13px;
  font-weight: 600;
  color: #FAFAFA;
  margin: 0;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 6px;
`;

const Btn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  background: ${({ $danger }) => ($danger ? 'rgba(220,38,38,0.10)' : '#1A1A1A')};
  border: 1px solid ${({ $danger }) => ($danger ? 'rgba(220,38,38,0.25)' : '#222')};
  color: ${({ $danger }) => ($danger ? '#DC2626' : '#71717A')};
  &:hover { border-color: ${({ $danger }) => ($danger ? '#DC2626' : '#3F3F46')}; color: ${({ $danger }) => ($danger ? '#DC2626' : '#FAFAFA')}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const BankCard = styled.div`
  background: linear-gradient(135deg, #1A0A0A 0%, #2D1515 50%, #1A0A0A 100%);
  border: 1px solid rgba(220,38,38,0.2);
  border-radius: 10px;
  padding: 16px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -30px;
    right: -30px;
    width: 100px;
    height: 100px;
    background: rgba(220,38,38,0.08);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -20px;
    right: 20px;
    width: 70px;
    height: 70px;
    background: rgba(220,38,38,0.05);
    border-radius: 50%;
  }
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const BankName = styled.p`
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const Balance = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: #FAFAFA;
  margin: 0;
  letter-spacing: -0.02em;
`;

const AccountMask = styled.p`
  font-size: 12px;
  color: rgba(255,255,255,0.4);
  margin: 0;
  letter-spacing: 0.12em;
`;

const spin = keyframes`to { transform: rotate(360deg); }`;
const SpinIcon = styled(RefreshCw)`
  animation: ${({ $spinning }) => ($spinning ? spin : 'none')} 0.8s linear infinite;
`;

const EmptyCard = styled.div`
  border: 1.5px dashed #2A2A2A;
  border-radius: 10px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #1A1A1A;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3F3F46;
`;

const EmptyTitle = styled.p`
  font-size: 13px;
  font-weight: 500;
  color: #A1A1AA;
  margin: 0;
`;

const EmptySub = styled.p`
  font-size: 11px;
  color: #52525B;
  margin: 0;
`;

const ConnectBtn = styled.button`
  margin-top: 4px;
  padding: 8px 20px;
  background: #DC2626;
  border: none;
  border-radius: 8px;
  color: #FAFAFA;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  &:hover { background: #B91C1C; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export default function BankCardWidget({ bankInfo, isConnected, onRefresh }) {
  const [linkToken, setLinkToken] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [fetchingToken, setFetchingToken] = useState(false);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken) => {
      try {
        await plaidAPI.exchangePublicToken(publicToken);
        toast.success('Bank account connected!');
        onRefresh?.();
      } catch {
        toast.error('Failed to connect bank account');
      }
    },
  });

  useEffect(() => {
    if (ready && linkToken) open();
  }, [ready, linkToken, open]);

  const handleConnect = useCallback(async () => {
    try {
      setFetchingToken(true);
      const { data } = await plaidAPI.createLinkToken();
      setLinkToken(data.data.link_token);
    } catch {
      toast.error('Failed to initialize bank connection');
    } finally {
      setFetchingToken(false);
    }
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      await plaidAPI.syncTransactions();
      toast.success('Transactions synced!');
      onRefresh?.();
    } catch {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleUnlink = async () => {
    if (!window.confirm('Disconnect your bank account?')) return;
    try {
      setUnlinking(true);
      await plaidAPI.unlinkBank();
      toast.success('Bank account disconnected');
      onRefresh?.();
    } catch {
      toast.error('Failed to disconnect');
    } finally {
      setUnlinking(false);
    }
  };

  const account = bankInfo?.accounts?.[0];

  return (
    <Card>
      <Row>
        <Title>Bank Card</Title>
        {isConnected && (
          <ActionRow>
            <Btn onClick={handleSync} disabled={syncing}>
              <SpinIcon size={11} $spinning={syncing ? 1 : 0} />
              {syncing ? 'Syncing…' : 'Sync'}
            </Btn>
            <Btn $danger onClick={handleUnlink} disabled={unlinking}>
              <Unlink size={11} />
              {unlinking ? '…' : 'Unlink'}
            </Btn>
          </ActionRow>
        )}
      </Row>

      {isConnected && account ? (
        <BankCard>
          <CardTop>
            <div>
              <BankName>{account.name}</BankName>
              <Balance>{formatCurrency(account.balances?.available ?? account.balances?.current ?? 0)}</Balance>
            </div>
            <Wifi size={16} color="rgba(220,38,38,0.6)" />
          </CardTop>
          <AccountMask>
            {account.mask ? `•••• •••• •••• ${account.mask}` : account.official_name || 'Connected'}
          </AccountMask>
        </BankCard>
      ) : (
        <EmptyCard>
          <EmptyIcon>
            <CreditCard size={20} strokeWidth={1.5} />
          </EmptyIcon>
          <EmptyTitle>No Card Available</EmptyTitle>
          <EmptySub>Connect a bank account to see your balance</EmptySub>
          <ConnectBtn onClick={handleConnect} disabled={fetchingToken}>
            {fetchingToken ? 'Loading…' : 'Connect Card'}
          </ConnectBtn>
        </EmptyCard>
      )}
    </Card>
  );
}
