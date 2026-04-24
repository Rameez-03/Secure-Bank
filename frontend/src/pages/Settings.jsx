import { useState, useContext } from 'react';
import styled from 'styled-components';
import { Check, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { userAPI, authAPI, plaidAPI } from '../services/api';
import { toast } from 'react-toastify';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Page = styled.div`
  max-width: 640px;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #FAFAFA;
  margin: 0 0 24px;
  letter-spacing: -0.02em;
`;

const Section = styled.div`
  background: #141414;
  border: 1px solid #222222;
  border-radius: 12px;
  padding: 22px;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: #FAFAFA;
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #1E1E1E;
`;

const AvatarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
`;

const Avatar = styled.div`
  width: 56px;
  height: 56px;
  background: rgba(220,38,38,0.12);
  border: 2px solid rgba(220,38,38,0.25);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: #DC2626;
`;

const AvatarInfo = styled.div``;
const AvatarName = styled.p`font-size: 15px; font-weight: 600; color: #FAFAFA; margin: 0 0 3px;`;
const AvatarEmail = styled.p`font-size: 12px; color: #52525B; margin: 0;`;

const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Row2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
`;

const BankRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: #1A1A1A;
  border: 1px solid #222;
  border-radius: 8px;
`;

const BankInfo = styled.div``;
const BankName = styled.p`font-size: 13px; font-weight: 500; color: #FAFAFA; margin: 0 0 3px;`;
const BankStatus = styled.p`font-size: 11px; color: #52525B; margin: 0;`;

const ConnectedDot = styled.span`
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #16A34A;
  margin-right: 5px;
`;

export default function Settings() {
  const { user, dispatch } = useContext(AuthContext);

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const [budget, setBudget] = useState(String(user?.budget || ''));
  const [savingBudget, setSavingBudget] = useState(false);

  const [syncing, setSyncing] = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SB';

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.name || !profile.email) return toast.error('Name and email are required');
    try {
      setSavingProfile(true);
      await userAPI.updateProfile(user.id, { name: profile.name, email: profile.email });
      dispatch({ type: 'UPDATE_USER', payload: { ...user, ...profile } });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleBudgetSave = async (e) => {
    e.preventDefault();
    const val = parseFloat(budget);
    if (isNaN(val) || val < 0) return toast.error('Enter a valid budget amount');
    try {
      setSavingBudget(true);
      await userAPI.updateBudget(user.id, val);
      dispatch({ type: 'UPDATE_USER', payload: { ...user, budget: val } });
      toast.success('Budget updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingBudget(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.newPass) return toast.error('Fill in all password fields');
    if (passwords.newPass.length < 6) return toast.error('Password must be at least 6 characters');
    if (passwords.newPass !== passwords.confirm) return toast.error('Passwords do not match');
    try {
      setSavingPw(true);
      toast.info('Password change coming soon — backend endpoint needed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingPw(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await plaidAPI.syncTransactions();
      toast.success('Transactions synced from bank');
    } catch {
      toast.error('Sync failed — make sure your bank is connected');
    } finally {
      setSyncing(false);
    }
  };

  const handleUnlink = async () => {
    if (!window.confirm('Disconnect your bank account? Your imported transactions will remain.')) return;
    try {
      setUnlinking(true);
      await plaidAPI.unlinkBank();
      toast.success('Bank account disconnected');
    } catch {
      toast.error('Failed to disconnect');
    } finally {
      setUnlinking(false);
    }
  };

  return (
    <Page>
      <Title>Settings</Title>

      {/* Profile */}
      <Section>
        <SectionTitle>Profile</SectionTitle>
        <AvatarRow>
          <Avatar>{initials}</Avatar>
          <AvatarInfo>
            <AvatarName>{user?.name}</AvatarName>
            <AvatarEmail>{user?.email}</AvatarEmail>
          </AvatarInfo>
        </AvatarRow>
        <form onSubmit={handleProfileSave}>
          <FormGrid>
            <Row2>
              <Input
                label="Full Name"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
              />
              <Input
                label="Email Address"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </Row2>
            <div>
              <Button type="submit" size="sm" disabled={savingProfile}>
                <Check size={13} /> {savingProfile ? 'Saving…' : 'Save Profile'}
              </Button>
            </div>
          </FormGrid>
        </form>
      </Section>

      {/* Budget */}
      <Section>
        <SectionTitle>Monthly Budget</SectionTitle>
        <form onSubmit={handleBudgetSave}>
          <FormGrid>
            <Input
              label="Budget (£)"
              type="number"
              step="0.01"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 1000"
            />
            <div>
              <Button type="submit" size="sm" disabled={savingBudget}>
                <Check size={13} /> {savingBudget ? 'Saving…' : 'Update Budget'}
              </Button>
            </div>
          </FormGrid>
        </form>
      </Section>

      {/* Security */}
      <Section>
        <SectionTitle>Security</SectionTitle>
        <form onSubmit={handlePasswordSave}>
          <FormGrid>
            <Input
              label="Current Password"
              type={showPw ? 'text' : 'password'}
              value={passwords.current}
              onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              placeholder="Current password"
              icon={showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              onIconClick={() => setShowPw((v) => !v)}
            />
            <Row2>
              <Input
                label="New Password"
                type={showPw ? 'text' : 'password'}
                value={passwords.newPass}
                onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
                placeholder="New password"
              />
              <Input
                label="Confirm New Password"
                type={showPw ? 'text' : 'password'}
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="Confirm password"
              />
            </Row2>
            <div>
              <Button type="submit" size="sm" disabled={savingPw}>
                <Check size={13} /> {savingPw ? 'Saving…' : 'Change Password'}
              </Button>
            </div>
          </FormGrid>
        </form>
      </Section>

      {/* Bank Connection */}
      <Section>
        <SectionTitle>Bank Connection</SectionTitle>
        <FormGrid>
          <BankRow>
            <BankInfo>
              <BankName>Plaid Bank Link</BankName>
              <BankStatus><ConnectedDot />Sandbox mode enabled</BankStatus>
            </BankInfo>
            <Button size="sm" variant="outline" onClick={handleSync} disabled={syncing}>
              {syncing ? 'Syncing…' : 'Sync Transactions'}
            </Button>
          </BankRow>
          <div>
            <Button size="sm" variant="danger" onClick={handleUnlink} disabled={unlinking}>
              {unlinking ? 'Disconnecting…' : 'Disconnect Bank Account'}
            </Button>
          </div>
        </FormGrid>
      </Section>
    </Page>
  );
}
