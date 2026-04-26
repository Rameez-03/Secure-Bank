import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { isEmpty, isEmail, isLength, isMatch, isStrongPassword } from '../utils/validators';

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
  max-width: 420px;
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

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
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

const TermsNote = styled.p`
  font-size: 11px;
  color: #3F3F46;
  text-align: center;
  margin: 8px 0 0;
  line-height: 1.5;
`;

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEmpty(form.name) || isEmpty(form.email) || isEmpty(form.password))
      return toast.error('Please fill in all fields');
    if (!isEmail(form.email)) return toast.error('Enter a valid email address');
    if (isLength(form.password, 12)) return toast.error('Password must be at least 12 characters');
    if (!isStrongPassword(form.password)) return toast.error('Password must include uppercase, lowercase, a number, and a special character');
    if (!isMatch(form.password, form.confirm)) return toast.error('Passwords do not match');

    try {
      setLoading(true);
      const { data } = await authAPI.register({ name: form.name, email: form.email, password: form.password });
      if (data.success) {
        const { user, accessToken } = data.data;
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: 'REGISTER_SUCCESS', payload: { user, accessToken } });
        toast.success('Account created! Welcome.');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
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

        <Heading>Create account</Heading>
        <Sub>Start managing your finances securely</Sub>

        <Form onSubmit={handleSubmit}>
          <FieldWrap>
            <Label>Full Name</Label>
            <StyledInput
              type="text"
              placeholder="John Smith"
              value={form.name}
              onChange={set('name')}
              disabled={loading}
              autoComplete="name"
            />
          </FieldWrap>

          <FieldWrap>
            <Label>Email</Label>
            <StyledInput
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              disabled={loading}
              autoComplete="email"
            />
          </FieldWrap>

          <Grid2>
            <FieldWrap>
              <Label>Password</Label>
              <InputWrap>
                <StyledInput
                  $hasIcon
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 12 characters"
                  value={form.password}
                  onChange={set('password')}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <ToggleBtn type="button" onClick={() => setShowPw((v) => !v)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </ToggleBtn>
              </InputWrap>
            </FieldWrap>

            <FieldWrap>
              <Label>Confirm</Label>
              <StyledInput
                type={showPw ? 'text' : 'password'}
                placeholder="Repeat password"
                value={form.confirm}
                onChange={set('confirm')}
                disabled={loading}
                autoComplete="new-password"
              />
            </FieldWrap>
          </Grid2>

          <SubmitBtn type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </SubmitBtn>
          <TermsNote>
            By signing up you agree to our Terms of Service and Privacy Policy.
          </TermsNote>
        </Form>

        <Footer>
          Already have an account? <FooterLink to="/signin">Sign in</FooterLink>
        </Footer>
      </Card>
    </Page>
  );
}
