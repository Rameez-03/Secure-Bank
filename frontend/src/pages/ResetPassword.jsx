import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { isEmpty, isStrongPassword } from '../utils/validators';

const GlobalAuthStyle = createGlobalStyle`
  body { background: #0A0A0A; margin: 0; }
`;

const Page = styled.div`
  min-height: 100vh;
  background: #0A0A0A;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const Card = styled.div`
  width: 100%;
  max-width: 400px;
  background: #111111;
  border: 1px solid #1E1E1E;
  border-radius: 16px;
  padding: 36px 32px;
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
`;

const LogoIcon = styled.div`
  width: 38px;
  height: 38px;
  background: #DC2626;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BrandName = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #FAFAFA;
  letter-spacing: -0.02em;
`;

const Heading = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #FAFAFA;
  margin: 0 0 6px;
  letter-spacing: -0.02em;
`;

const Sub = styled.p`
  font-size: 13px;
  color: #52525B;
  margin: 0 0 28px;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FieldWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: #A1A1AA;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const InputWrap = styled.div`
  position: relative;
`;

const StyledInput = styled.input`
  width: 100%;
  background: #141414;
  border: 1px solid #222222;
  border-radius: 8px;
  padding: 11px 40px 11px 14px;
  color: #FAFAFA;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
  &::placeholder { color: #3F3F46; }
  &:focus { border-color: #DC2626; }
  &:disabled { opacity: 0.5; }
`;

const ToggleBtn = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #52525B;
  display: flex;
  padding: 0;
  &:hover { color: #A1A1AA; }
`;

const HintList = styled.ul`
  margin: 4px 0 0;
  padding-left: 16px;
  font-size: 11px;
  color: #52525B;
  line-height: 1.8;
  list-style: disc;
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 12px;
  background: #DC2626;
  border: none;
  border-radius: 9px;
  color: #FAFAFA;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  margin-top: 4px;
  &:hover:not(:disabled) { background: #B91C1C; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ErrorBox = styled.div`
  background: rgba(220,38,38,0.08);
  border: 1px solid rgba(220,38,38,0.25);
  border-radius: 10px;
  padding: 16px;
  font-size: 13px;
  color: #FCA5A5;
  line-height: 1.6;
  text-align: center;
`;

const Footer = styled.p`
  text-align: center;
  font-size: 13px;
  color: #52525B;
  margin: 18px 0 0;
`;

const FooterLink = styled(Link)`
  color: #DC2626;
  text-decoration: none;
  font-weight: 500;
  &:hover { text-decoration: underline; }
`;

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEmpty(form.password)) return toast.error('Please enter a new password');
    if (!isStrongPassword(form.password)) {
      return toast.error('Password must be 12+ characters with uppercase, lowercase, number, and special character');
    }
    if (form.password !== form.confirm) return toast.error('Passwords do not match');

    try {
      setLoading(true);
      await authAPI.resetPassword(token, form.password);
      toast.success('Password reset! Please sign in with your new password.');
      navigate('/signin');
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (err.response?.status === 400 && msg.toLowerCase().includes('invalid')) {
        setInvalid(true);
      } else {
        toast.error(msg || 'Reset failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <GlobalAuthStyle />
      <Card>
        <LogoRow>
          <LogoIcon><Shield size={20} color="#FAFAFA" strokeWidth={2.5} /></LogoIcon>
          <BrandName>SecureBank</BrandName>
        </LogoRow>

        <Heading>Set new password</Heading>
        <Sub>Choose a strong password for your account.</Sub>

        {invalid ? (
          <>
            <ErrorBox>
              This reset link is invalid or has expired. Reset links are only valid for 1 hour.
            </ErrorBox>
            <Footer>
              <FooterLink to="/forgot-password">Request a new link</FooterLink>
            </Footer>
          </>
        ) : (
          <Form onSubmit={handleSubmit}>
            <FieldWrap>
              <Label>New Password</Label>
              <InputWrap>
                <StyledInput
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 12 characters"
                  value={form.password}
                  onChange={set('password')}
                  disabled={loading}
                  autoComplete="new-password"
                  autoFocus
                />
                <ToggleBtn type="button" onClick={() => setShowPw((v) => !v)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </ToggleBtn>
              </InputWrap>
              <HintList>
                <li>At least 12 characters</li>
                <li>Uppercase and lowercase letters</li>
                <li>At least one number and one special character</li>
              </HintList>
            </FieldWrap>

            <FieldWrap>
              <Label>Confirm Password</Label>
              <StyledInput
                type={showPw ? 'text' : 'password'}
                placeholder="Repeat new password"
                value={form.confirm}
                onChange={set('confirm')}
                disabled={loading}
                autoComplete="new-password"
              />
            </FieldWrap>

            <SubmitBtn type="submit" disabled={loading}>
              {loading ? 'Updating…' : 'Reset Password'}
            </SubmitBtn>
          </Form>
        )}

        <Footer>
          <FooterLink to="/signin">Back to sign in</FooterLink>
        </Footer>
      </Card>
    </Page>
  );
}
