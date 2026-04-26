import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { isEmpty, isEmail } from '../utils/validators';

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
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  padding: 11px 14px;
  padding-right: ${({ $hasIcon }) => ($hasIcon ? '40px' : '14px')};
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

export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEmpty(email) || isEmpty(password)) return toast.error('Please fill in all fields');
    if (!isEmail(email)) return toast.error('Enter a valid email address');

    try {
      setLoading(true);
      const { data } = await authAPI.login({ email, password });
      if (data.success) {
        const { user, accessToken } = data.data;
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, accessToken } });
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
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

        <Heading>Welcome back</Heading>
        <Sub>Sign in to your account</Sub>

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
            />
          </FieldWrap>

          <FieldWrap>
            <Label>Password</Label>
            <InputWrap>
              <StyledInput
                $hasIcon
                type={showPw ? 'text' : 'password'}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
              <ToggleBtn type="button" onClick={() => setShowPw((v) => !v)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </ToggleBtn>
            </InputWrap>
          </FieldWrap>

          <SubmitBtn type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </SubmitBtn>
        </Form>

        <Footer>
          Don't have an account? <FooterLink to="/signup">Sign up</FooterLink>
        </Footer>
      </Card>
    </Page>
  );
}
