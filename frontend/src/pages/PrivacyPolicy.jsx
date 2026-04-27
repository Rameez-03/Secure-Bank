import { Link } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { Shield, ArrowLeft } from 'lucide-react';

const GlobalStyle = createGlobalStyle`
  body { background: #0A0A0A; margin: 0; }
`;

const Page = styled.div`
  min-height: 100vh;
  background: #0A0A0A;
  padding: 40px 20px 80px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const Inner = styled.div`
  max-width: 720px;
  margin: 0 auto;
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 40px;
`;

const LogoIcon = styled.div`
  width: 34px;
  height: 34px;
  background: #DC2626;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BrandName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #FAFAFA;
  letter-spacing: -0.02em;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #52525B;
  text-decoration: none;
  margin-bottom: 32px;
  &:hover { color: #A1A1AA; }
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 700;
  color: #FAFAFA;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
`;

const LastUpdated = styled.p`
  font-size: 12px;
  color: #52525B;
  margin: 0 0 40px;
`;

const Section = styled.section`
  margin-bottom: 36px;
`;

const SectionTitle = styled.h2`
  font-size: 15px;
  font-weight: 600;
  color: #FAFAFA;
  margin: 0 0 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #1E1E1E;
`;

const P = styled.p`
  font-size: 14px;
  color: #A1A1AA;
  line-height: 1.75;
  margin: 0 0 12px;
`;

const UL = styled.ul`
  margin: 0 0 12px;
  padding-left: 20px;
  font-size: 14px;
  color: #A1A1AA;
  line-height: 1.75;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: #A1A1AA;
  margin-bottom: 12px;
`;

const Th = styled.th`
  text-align: left;
  padding: 10px 12px;
  background: #141414;
  border: 1px solid #222;
  color: #FAFAFA;
  font-weight: 600;
  font-size: 12px;
`;

const Td = styled.td`
  padding: 10px 12px;
  border: 1px solid #222;
  vertical-align: top;
  line-height: 1.6;
`;

const Highlight = styled.span`
  color: #FAFAFA;
  font-weight: 500;
`;

const ExternalLink = styled.a`
  color: #DC2626;
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

export default function PrivacyPolicy() {
  return (
    <Page>
      <GlobalStyle />
      <Inner>
        <LogoRow>
          <LogoIcon><Shield size={18} color="#FAFAFA" strokeWidth={2.5} /></LogoIcon>
          <BrandName>SecureBank</BrandName>
        </LogoRow>

        <BackLink to="/signin"><ArrowLeft size={14} /> Back</BackLink>

        <Title>Privacy Policy</Title>
        <LastUpdated>Last updated: 26 April 2026 &nbsp;·&nbsp; Version 1.0</LastUpdated>

        <Section>
          <SectionTitle>1. Who We Are</SectionTitle>
          <P>
            SecureBank is a personal finance management application. The data controller responsible for your personal
            data is the developer of this application, based in the United Kingdom.
          </P>
          <P>
            For any privacy-related queries or to exercise your rights, contact us at:{' '}
            <ExternalLink href="mailto:privacy@securebank.app">privacy@securebank.app</ExternalLink>
          </P>
        </Section>

        <Section>
          <SectionTitle>2. What Data We Collect</SectionTitle>
          <Table>
            <thead>
              <tr>
                <Th>Data</Th>
                <Th>Why We Collect It</Th>
                <Th>Lawful Basis</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td><Highlight>Full name</Highlight></Td>
                <Td>Display in the application; identify your account</Td>
                <Td>Contract (Art. 6(1)(b))</Td>
              </tr>
              <tr>
                <Td><Highlight>Email address</Highlight></Td>
                <Td>Account login; password reset communications</Td>
                <Td>Contract (Art. 6(1)(b))</Td>
              </tr>
              <tr>
                <Td><Highlight>Password</Highlight> (hashed)</Td>
                <Td>Account authentication. Your password is hashed using bcrypt — the original is never stored</Td>
                <Td>Contract (Art. 6(1)(b))</Td>
              </tr>
              <tr>
                <Td><Highlight>Financial transaction records</Highlight></Td>
                <Td>Personal finance tracking, spending analytics, and health score calculation</Td>
                <Td>Contract (Art. 6(1)(b))</Td>
              </tr>
              <tr>
                <Td><Highlight>Monthly budget</Highlight></Td>
                <Td>Budget vs spending comparison</Td>
                <Td>Contract (Art. 6(1)(b))</Td>
              </tr>
              <tr>
                <Td><Highlight>Bank account data</Highlight> (via Plaid)</Td>
                <Td>Automatically import transactions from your linked bank account. This is optional — you can use the app without linking a bank</Td>
                <Td>Consent (Art. 6(1)(a)) — you must explicitly connect your bank</Td>
              </tr>
            </tbody>
          </Table>
        </Section>

        <Section>
          <SectionTitle>3. How We Use Your Data</SectionTitle>
          <P>We use your personal data only for the purposes described in the table above. Specifically, we do not:</P>
          <UL>
            <li>Sell your data to any third party</li>
            <li>Use your data for advertising or marketing profiling</li>
            <li>Share your data with any third party except as described in Section 4</li>
            <li>Make automated decisions that have legal or similarly significant effects on you (see Section 7 for information about the health score)</li>
          </UL>
        </Section>

        <Section>
          <SectionTitle>4. Who We Share Your Data With</SectionTitle>
          <Table>
            <thead>
              <tr>
                <Th>Recipient</Th>
                <Th>What They Receive</Th>
                <Th>Why</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td><Highlight>Plaid Inc.</Highlight> (data processor)</Td>
                <Td>A public token you generate via the Plaid Link widget, which is exchanged for a bank access token stored encrypted on our servers</Td>
                <Td>To import your bank transactions automatically. Plaid is certified to SOC 2 Type II and PCI DSS Level 1. Only applies if you choose to link a bank account</Td>
              </tr>
              <tr>
                <Td><Highlight>SMTP email provider</Highlight> (data processor)</Td>
                <Td>Your email address, when you request a password reset</Td>
                <Td>To deliver password reset emails. Only used when you request a reset</Td>
              </tr>
            </tbody>
          </Table>
          <P>All third parties acting as data processors are bound by Data Processing Agreements and are only permitted to process your data on our documented instructions.</P>
        </Section>

        <Section>
          <SectionTitle>5. Cookies</SectionTitle>
          <P>
            We use <Highlight>one strictly necessary cookie</Highlight> named <Highlight>rt</Highlight>. This cookie
            stores your session refresh token in an httpOnly format, meaning it is not accessible to JavaScript and
            cannot be read by third-party scripts. It is required for the application to function — without it, you
            would be logged out on every page load.
          </P>
          <P>
            No analytics, advertising, or tracking cookies are used. No third-party scripts or pixels are loaded.
            Because we use only a strictly necessary cookie, no cookie consent banner is legally required under PECR 2003.
          </P>
        </Section>

        <Section>
          <SectionTitle>6. How Long We Keep Your Data</SectionTitle>
          <Table>
            <thead>
              <tr>
                <Th>Data</Th>
                <Th>Retention Period</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td>Account data (name, email, password hash)</Td>
                <Td>Until you delete your account</Td>
              </tr>
              <tr>
                <Td>Transaction records</Td>
                <Td>Until you delete your account or delete the individual transaction</Td>
              </tr>
              <tr>
                <Td>Plaid bank access token</Td>
                <Td>Until you disconnect your bank account or delete your account</Td>
              </tr>
              <tr>
                <Td>Password reset tokens</Td>
                <Td>1 hour from generation (automatic expiry)</Td>
              </tr>
              <tr>
                <Td>Session (refresh token cookie)</Td>
                <Td>7 days from last login (automatic expiry)</Td>
              </tr>
              <tr>
                <Td>Inactive accounts</Td>
                <Td>Accounts with no login activity for 24 months will receive a warning email, followed by deletion after 30 days if no action is taken</Td>
              </tr>
            </tbody>
          </Table>
        </Section>

        <Section>
          <SectionTitle>7. Automated Decision-Making</SectionTitle>
          <P>
            SecureBank calculates a <Highlight>Financial Health Score</Highlight> for your account. This score is
            computed automatically from your transaction history using the following factors:
          </P>
          <UL>
            <li>Spending consistency relative to your monthly budget</li>
            <li>Transaction frequency and regularity</li>
            <li>Proportion of income vs expenditure transactions</li>
            <li>Spending trends over the last 90 days</li>
          </UL>
          <P>
            This score is <Highlight>informational only</Highlight>. It does not constitute a credit decision,
            financial advice, or any legally significant automated decision as defined by Article 22 UK GDPR.
            It cannot be used by any third party and has no effect beyond your personal dashboard display.
          </P>
        </Section>

        <Section>
          <SectionTitle>8. Your Rights</SectionTitle>
          <P>Under UK GDPR you have the following rights regarding your personal data:</P>
          <Table>
            <thead>
              <tr>
                <Th>Right</Th>
                <Th>What It Means</Th>
                <Th>How to Exercise It</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td><Highlight>Access</Highlight> (Art. 15)</Td>
                <Td>Receive a copy of all personal data we hold about you</Td>
                <Td>Settings → Privacy → Export My Data</Td>
              </tr>
              <tr>
                <Td><Highlight>Rectification</Highlight> (Art. 16)</Td>
                <Td>Correct inaccurate personal data</Td>
                <Td>Settings → Profile</Td>
              </tr>
              <tr>
                <Td><Highlight>Erasure</Highlight> (Art. 17)</Td>
                <Td>Delete your account and all associated data</Td>
                <Td>Settings → Danger Zone → Delete Account</Td>
              </tr>
              <tr>
                <Td><Highlight>Restriction</Highlight> (Art. 18)</Td>
                <Td>Pause active data processing while keeping your account</Td>
                <Td>Settings → Privacy → Restrict Processing</Td>
              </tr>
              <tr>
                <Td><Highlight>Portability</Highlight> (Art. 20)</Td>
                <Td>Receive your data in a structured, machine-readable format</Td>
                <Td>Settings → Privacy → Export My Data (JSON format)</Td>
              </tr>
              <tr>
                <Td><Highlight>Object</Highlight> (Art. 21)</Td>
                <Td>Object to our processing of your data</Td>
                <Td>Email <ExternalLink href="mailto:privacy@securebank.app">privacy@securebank.app</ExternalLink></Td>
              </tr>
            </tbody>
          </Table>
          <P>
            We will respond to all rights requests within <Highlight>one calendar month</Highlight> as required by
            Article 12(3) UK GDPR.
          </P>
        </Section>

        <Section>
          <SectionTitle>9. Data Security</SectionTitle>
          <P>We take the security of your personal data seriously. Measures in place include:</P>
          <UL>
            <li>Passwords hashed using bcrypt with 12 rounds — the original password is never stored</li>
            <li>Bank access tokens encrypted at rest using AES-256-GCM</li>
            <li>Session tokens stored in httpOnly cookies inaccessible to JavaScript</li>
            <li>Rate limiting on all authentication endpoints to prevent brute-force attacks</li>
            <li>All sensitive fields excluded from API responses by default</li>
            <li>HTTPS enforced in production</li>
          </UL>
          <P>
            Full technical security documentation is maintained internally. In the event of a personal data breach
            that poses a risk to your rights and freedoms, we will notify the ICO within 72 hours and inform affected
            users without undue delay.
          </P>
        </Section>

        <Section>
          <SectionTitle>10. How to Complain</SectionTitle>
          <P>
            If you are unhappy with how we have handled your personal data, you have the right to lodge a complaint
            with the UK's supervisory authority:
          </P>
          <P>
            <Highlight>Information Commissioner's Office (ICO)</Highlight><br />
            Website: <ExternalLink href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</ExternalLink><br />
            Helpline: 0303 123 1113
          </P>
          <P>
            We would, however, appreciate the opportunity to address your concerns before you contact the ICO.
            Please email us first at{' '}
            <ExternalLink href="mailto:privacy@securebank.app">privacy@securebank.app</ExternalLink>.
          </P>
        </Section>

        <Section>
          <SectionTitle>11. Changes to This Policy</SectionTitle>
          <P>
            We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date
            at the top of this page. Significant changes will be communicated via email to registered users.
          </P>
        </Section>
      </Inner>
    </Page>
  );
}
