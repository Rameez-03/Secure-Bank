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

const CardBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  background: linear-gradient(135deg, #1A0505 0%, #2D1010 45%, #1C0808 100%);
  border: 1px solid rgba(220,38,38,0.25);
  border-radius: 14px;
  padding: 16px 18px;
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 1.586;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &::before {
    content: '';
    position: absolute;
    top: -60px;
    right: -60px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -40px;
    left: -20px;
    width: 160px;
    height: 160px;
    background: radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%);
    border-radius: 50%;
  }
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const Chip = styled.div`
  width: 30px;
  height: 22px;
  background: linear-gradient(135deg, #D97706 0%, #F59E0B 40%, #B45309 100%);
  border-radius: 5px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(0,0,0,0.2);
    transform: translateY(-50%);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    bottom: 0;
    width: 1px;
    background: rgba(0,0,0,0.15);
    transform: translateX(-50%);
  }
`;

const CardBottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const BankName = styled.p`
  font-size: 10px;
  color: rgba(255,255,255,0.45);
  margin: 0 0 2px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 500;
`;

const Balance = styled.p`
  font-size: 22px;
  font-weight: 700;
  color: #FAFAFA;
  margin: 0;
  letter-spacing: -0.02em;
`;

const AccountMask = styled.p`
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  margin: 0;
  letter-spacing: 0.18em;
  font-weight: 400;
`;

const CardHolderLabel = styled.p`
  font-size: 9px;
  color: rgba(255,255,255,0.3);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const CardHolderName = styled.p`
  font-size: 11px;
  font-weight: 500;
  color: rgba(255,255,255,0.7);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
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
        toast.success('Bank connected!');
      } catch {
        toast.error('Failed to connect bank account');
        return;
      }
      // Brief delay to let Plaid finish initializing the connection before syncing
      await new Promise((r) => setTimeout(r, 1500));
      try {
        toast.info('Syncing transactions…');
        const { data } = await plaidAPI.syncTransactions(true);
        toast.success(data?.message || 'Transactions synced!');
      } catch (err) {
        toast.warn(err.response?.data?.message || 'Sync failed — click Sync to retry.');
      }
      onRefresh?.();
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
      const { data } = await plaidAPI.syncTransactions(true);
      toast.success(data?.message || 'Transactions synced!');
      onRefresh?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sync failed');
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

      <CardBody>
        {isConnected && account ? (
          <BankCard>
            <CardTop>
              <div>
                <BankName>{account.subtype?.toUpperCase() || 'CHECKING'}</BankName>
                <Balance>{formatCurrency(account.balances?.available ?? account.balances?.current ?? 0)}</Balance>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <Wifi size={15} color="rgba(220,38,38,0.7)" />
                <Chip />
              </div>
            </CardTop>
            <CardBottom>
              <AccountMask>
                {account.mask ? `•••• •••• •••• ${account.mask}` : '•••• •••• •••• 0000'}
              </AccountMask>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <CardHolderLabel>Account</CardHolderLabel>
                  <CardHolderName>{account.name}</CardHolderName>
                </div>
                <CardHolderLabel style={{ fontSize: 10, color: 'rgba(220,38,38,0.5)', fontWeight: 600, letterSpacing: '0.06em' }}>
                  SECURE BANK
                </CardHolderLabel>
              </div>
            </CardBottom>
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
      </CardBody>
    </Card>
  );
}
