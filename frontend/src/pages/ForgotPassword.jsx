import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { isEmail, isEmpty } from '../utils/validators';

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

const StyledInput = styled.input`
  width: 100%;
  background: #141414;
  border: 1px solid #222222;
  border-radius: 8px;
  padding: 11px 14px;
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

const SuccessBox = styled.div`
  background: rgba(22,163,74,0.08);
  border: 1px solid rgba(22,163,74,0.25);
  border-radius: 10px;
  padding: 16px;
  font-size: 13px;
  color: #4ADE80;
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

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEmpty(email)) return toast.error('Please enter your email address');
    if (!isEmail(email)) return toast.error('Enter a valid email address');

    try {
      setLoading(true);
      await authAPI.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch {
      // Always show success to prevent user enumeration
      setSent(true);
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

        <Heading>Forgot password?</Heading>
        <Sub>Enter the email address on your account and we'll send you a reset link.</Sub>

        {sent ? (
          <>
            <SuccessBox>
              If an account exists with that email, you'll receive reset instructions shortly.
              Check your inbox (and spam folder).
            </SuccessBox>
            <Footer>
              <FooterLink to="/signin">Back to sign in</FooterLink>
            </Footer>
          </>
        ) : (
          <Form onSubmit={handleSubmit}>
            <FieldWrap>
              <Label>Email</Label>
              <StyledInput
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                autoFocus
              />
            </FieldWrap>
            <SubmitBtn type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </SubmitBtn>
          </Form>
        )}

        {!sent && (
          <Footer>
            Remember your password? <FooterLink to="/signin">Sign in</FooterLink>
          </Footer>
        )}
      </Card>
    </Page>
  );
}
