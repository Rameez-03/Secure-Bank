import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Check, Eye, EyeOff, Download, Lock, Unlock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { userAPI, authAPI, plaidAPI, setAccessToken } from '../services/api';
import { isStrongPassword } from '../utils/validators';
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
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [togglingRestriction, setTogglingRestriction] = useState(false);
  const [isRestricted, setIsRestricted] = useState(user?.isRestricted || false);

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
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      return toast.error('Fill in all password fields');
    }
    if (!isStrongPassword(passwords.newPass)) {
      return toast.error('New password must be 12+ characters with uppercase, lowercase, number, and special character');
    }
    if (passwords.newPass !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.current === passwords.newPass) return toast.error('New password must differ from your current password');
    try {
      setSavingPw(true);
      await authAPI.changePassword({ currentPassword: passwords.current, newPassword: passwords.newPass });
      setPasswords({ current: '', newPass: '', confirm: '' });
      toast.success('Password updated successfully');
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

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'This will permanently delete your account and all your data. This cannot be undone.\n\nType OK to confirm.'
    );
    if (!confirmed) return;
    try {
      setDeletingAccount(true);
      await userAPI.deleteAccount(user.id);
      setAccessToken(null);
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const { data } = await userAPI.exportData(user.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `securebank-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch {
      toast.error('Export failed — please try again');
    } finally {
      setExporting(false);
    }
  };

  const handleToggleRestriction = async () => {
    const action = isRestricted ? 'lift the restriction on' : 'restrict processing on';
    if (!window.confirm(`Are you sure you want to ${action} your account?`)) return;
    try {
      setTogglingRestriction(true);
      const { data } = await userAPI.toggleRestriction(user.id);
      setIsRestricted(data.data.isRestricted);
      toast.success(data.data.isRestricted ? 'Processing restricted — no new data will be processed' : 'Restriction lifted');
    } catch {
      toast.error('Failed to update restriction status');
    } finally {
      setTogglingRestriction(false);
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
      {/* Privacy & Data */}
      <Section>
        <SectionTitle>Privacy &amp; Data</SectionTitle>
        <FormGrid>
          <div style={{ fontSize: 13, color: '#71717A', lineHeight: 1.6 }}>
            Export a copy of all your personal data in JSON format (Articles 15 &amp; 20 UK GDPR). View our{' '}
            <Link to="/privacy-policy" style={{ color: '#DC2626', textDecoration: 'none' }}>Privacy Policy</Link>.
          </div>
          <div>
            <Button size="sm" variant="outline" onClick={handleExport} disabled={exporting}>
              <Download size={13} /> {exporting ? 'Exporting…' : 'Export My Data'}
            </Button>
          </div>
          <BankRow>
            <BankInfo>
              <BankName>Restrict Processing</BankName>
              <BankStatus>
                {isRestricted
                  ? <><ConnectedDot style={{ background: '#DC2626' }} />Active — new data processing is paused</>
                  : <><ConnectedDot />Processing is active</>}
              </BankStatus>
            </BankInfo>
            <Button size="sm" variant={isRestricted ? 'outline' : 'danger'} onClick={handleToggleRestriction} disabled={togglingRestriction}>
              {togglingRestriction ? 'Updating…' : isRestricted ? <><Unlock size={13} /> Lift Restriction</> : <><Lock size={13} /> Restrict Processing</>}
            </Button>
          </BankRow>
          <div style={{ fontSize: 12, color: '#3F3F46', lineHeight: 1.6 }}>
            Restricting processing pauses new transaction creation and bank sync while keeping your account and data intact (Article 18 UK GDPR).
          </div>
        </FormGrid>
      </Section>

      {/* Danger Zone */}
      <Section style={{ borderColor: 'rgba(220,38,38,0.3)' }}>
        <SectionTitle style={{ color: '#DC2626', borderBottomColor: 'rgba(220,38,38,0.2)' }}>
          Danger Zone
        </SectionTitle>
        <FormGrid>
          <div style={{ fontSize: 13, color: '#71717A', lineHeight: 1.6 }}>
            Permanently deletes your account, all transactions, and disconnects your bank. This action cannot be undone.
          </div>
          <div>
            <Button size="sm" variant="danger" onClick={handleDeleteAccount} disabled={deletingAccount}>
              {deletingAccount ? 'Deleting…' : 'Delete Account'}
            </Button>
          </div>
        </FormGrid>
      </Section>
    </Page>
  );
}
