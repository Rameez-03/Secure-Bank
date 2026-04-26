import { Link } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import {
  Shield, ArrowRight, Lock, Zap, BarChart2,
  TrendingUp, TrendingDown, PiggyBank, Wallet,
  CheckCircle2, ChevronRight,
} from 'lucide-react';

/* ─────────────── Keyframes ─────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const floatY = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
`;

const shimmer = keyframes`
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const glow = keyframes`
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
`;

const barGrow = keyframes`
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
`;

const lineIn = keyframes`
  from { stroke-dashoffset: 500; }
  to   { stroke-dashoffset: 0; }
`;

const delayedFade = (delay) => css`
  animation: ${fadeUp} 0.8s ${delay} cubic-bezier(0.22, 1, 0.36, 1) both;
`;

/* ─────────────── Page Shell ─────────────── */
const Page = styled.div`
  min-height: 100vh;
  background: #080808;
  color: #FAFAFA;
  font-family: 'Inter', -apple-system, sans-serif;
  overflow-x: hidden;
  scroll-behavior: smooth;
`;

const Glow = styled.div`
  position: fixed;
  top: -280px;
  left: 50%;
  transform: translateX(-50%);
  width: 1100px;
  height: 700px;
  background: radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.14) 0%, transparent 65%);
  pointer-events: none;
  z-index: 0;
`;

const GlowSecondary = styled.div`
  position: fixed;
  bottom: 10%;
  right: -200px;
  width: 600px;
  height: 600px;
  background: radial-gradient(ellipse at center, rgba(220,38,38,0.05) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
  animation: ${glow} 6s ease-in-out infinite;
`;

/* ─────────────── Navigation ─────────────── */
const Nav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 56px;
  height: 62px;
  background: rgba(8,8,8,0.88);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.04);
`;

const NavLogo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
`;

const LogoBox = styled.div`
  width: 32px;
  height: 32px;
  background: #DC2626;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoText = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #FAFAFA;
  letter-spacing: -0.03em;
`;

const NavCenter = styled.div`
  display: flex;
  align-items: center;
  gap: 36px;
  @media (max-width: 768px) { display: none; }
`;

const NavLink = styled.a`
  font-size: 13px;
  font-weight: 450;
  color: #71717A;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s;
  &:hover { color: #D4D4D8; }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const NavSignIn = styled(Link)`
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #A1A1AA;
  text-decoration: none;
  border-radius: 7px;
  transition: color 0.15s;
  &:hover { color: #FAFAFA; }
`;

const NavCTA = styled(Link)`
  padding: 8px 18px;
  background: #DC2626;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #FAFAFA;
  text-decoration: none;
  transition: background 0.15s;
  &:hover { background: #B91C1C; }
`;

/* ─────────────── Hero ─────────────── */
const Hero = styled.section`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 88px 24px 60px;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px 5px 10px;
  background: rgba(220,38,38,0.07);
  border: 1px solid rgba(220,38,38,0.18);
  border-radius: 99px;
  font-size: 12px;
  font-weight: 500;
  color: #EF4444;
  margin-bottom: 28px;
  ${delayedFade('0s')}
`;

const BadgeDot = styled.span`
  width: 6px;
  height: 6px;
  background: #DC2626;
  border-radius: 50%;
  animation: ${glow} 2s ease-in-out infinite;
`;

const H1 = styled.h1`
  font-size: clamp(42px, 6vw, 72px);
  font-weight: 800;
  color: #FAFAFA;
  margin: 0 0 22px;
  line-height: 1.06;
  letter-spacing: -0.045em;
  max-width: 820px;
  ${delayedFade('0.1s')}

  em {
    font-style: normal;
    background: linear-gradient(135deg, #DC2626 0%, #F87171 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const HeroSub = styled.p`
  font-size: clamp(15px, 1.8vw, 17px);
  color: #71717A;
  line-height: 1.7;
  margin: 0 0 38px;
  max-width: 540px;
  font-weight: 400;
  ${delayedFade('0.2s')}
`;

const CTAGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  ${delayedFade('0.3s')}
`;

const CTAPrimary = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 28px;
  background: #DC2626;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #FAFAFA;
  text-decoration: none;
  transition: background 0.15s, transform 0.2s;
  &:hover { background: #B91C1C; transform: translateY(-2px); }
  &:active { transform: translateY(0); }
`;

const CTAGhost = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 13px 22px;
  border: 1px solid #1E1E1E;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #A1A1AA;
  text-decoration: none;
  transition: border-color 0.15s, color 0.15s, transform 0.2s;
  &:hover { border-color: #3F3F46; color: #FAFAFA; transform: translateY(-2px); }
`;

const TrustStrip = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  margin-top: 36px;
  flex-wrap: wrap;
  ${delayedFade('0.4s')}
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 500;
  color: #3F3F46;
  svg { color: #52525B; }
`;

/* ─────────────── Dashboard Mockup ─────────────── */
const MockupWrap = styled.div`
  position: relative;
  z-index: 1;
  padding: 0 48px 80px;
  display: flex;
  justify-content: center;
  animation: ${fadeIn} 0.8s 0.5s both;
`;

const MockupFrame = styled.div`
  width: 100%;
  max-width: 1040px;
  background: #0F0F0F;
  border: 1px solid #1E1E1E;
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.03),
    0 40px 100px rgba(0,0,0,0.6),
    0 0 80px rgba(220,38,38,0.04);
  animation: ${floatY} 7s ease-in-out infinite;
`;

const MockupChrome = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #0A0A0A;
  border-bottom: 1px solid #1A1A1A;
`;

const ChromeDots = styled.div`
  display: flex;
  gap: 6px;
`;

const Dot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $c }) => $c};
  opacity: 0.8;
`;

const ChromeBar = styled.div`
  flex: 1;
  max-width: 260px;
  margin: 0 auto;
  height: 22px;
  background: #141414;
  border: 1px solid #1E1E1E;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ChromeURL = styled.span`
  font-size: 10px;
  color: #3F3F46;
  font-family: monospace;
`;

const MockupBody = styled.div`
  display: flex;
  height: 420px;
`;

const MockSidebar = styled.div`
  width: 180px;
  flex-shrink: 0;
  background: #0D0D0D;
  border-right: 1px solid #161616;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SideLogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px 16px;
  border-bottom: 1px solid #161616;
  margin-bottom: 8px;
`;

const SideLogoBox = styled.div`
  width: 24px;
  height: 24px;
  background: #DC2626;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SideLogoTxt = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #FAFAFA;
  letter-spacing: -0.02em;
`;

const SideItem = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 16px;
  font-size: 11px;
  font-weight: 500;
  color: ${({ $active }) => ($active ? '#FAFAFA' : '#3F3F46')};
  background: ${({ $active }) => ($active ? 'rgba(220,38,38,0.08)' : 'transparent')};
  border-left: 2px solid ${({ $active }) => ($active ? '#DC2626' : 'transparent')};
  cursor: default;
`;

const SideDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? '#DC2626' : '#2A2A2A')};
`;

const MockMain = styled.div`
  flex: 1;
  padding: 20px 22px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const MockHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MockTitle = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #FAFAFA;
  letter-spacing: -0.02em;
`;

const MockBalance = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #FAFAFA;
  letter-spacing: -0.02em;
`;

const MockStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`;

const MockStatCard = styled.div`
  background: #141414;
  border: 1px solid #1E1E1E;
  border-radius: 8px;
  padding: 10px 12px;
`;

const MockStatLabel = styled.p`
  font-size: 9px;
  font-weight: 600;
  color: #3F3F46;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 5px;
`;

const MockStatVal = styled.p`
  font-size: 13px;
  font-weight: 700;
  color: ${({ $color }) => $color || '#FAFAFA'};
  margin: 0;
  letter-spacing: -0.02em;
`;

const MockGridRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 180px;
  gap: 10px;
  flex: 1;
  min-height: 0;
`;

const MockChartCard = styled.div`
  background: #141414;
  border: 1px solid #1E1E1E;
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
`;

const MockChartTitle = styled.p`
  font-size: 10px;
  font-weight: 600;
  color: #A1A1AA;
  margin: 0 0 10px;
`;

const MockChart = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 5px;
`;

const MockBar = styled.div`
  flex: 1;
  background: ${({ $active }) => ($active ? '#DC2626' : '#1E1E1E')};
  border-radius: 4px 4px 0 0;
  height: ${({ $h }) => $h};
  transform-origin: bottom;
  animation: ${barGrow} 0.8s ${({ $delay }) => $delay} cubic-bezier(0.22, 1, 0.36, 1) both;
  opacity: ${({ $active }) => ($active ? 1 : 0.6)};
`;

const MockLineCard = styled.div`
  background: #141414;
  border: 1px solid #1E1E1E;
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
`;

const MockTxList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  flex: 1;
  overflow: hidden;
`;

const MockTx = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 9px;
  background: #1A1A1A;
  border-radius: 6px;
`;

const MockTxLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MockTxIcon = styled.div`
  width: 24px;
  height: 24px;
  background: ${({ $bg }) => $bg};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
`;

const MockTxName = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: #A1A1AA;
`;

const MockTxAmt = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${({ $neg }) => ($neg ? '#EF4444' : '#16A34A')};
`;

/* ─────────────── Feature Strip ─────────────── */
const Features = styled.section`
  position: relative;
  z-index: 1;
  padding: 90px 56px;
  border-top: 1px solid #111111;
`;

const SectionEyebrow = styled.p`
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: #DC2626;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin: 0 0 14px;
`;

const SectionH2 = styled.h2`
  text-align: center;
  font-size: clamp(26px, 3.5vw, 40px);
  font-weight: 700;
  color: #FAFAFA;
  margin: 0 auto 56px;
  letter-spacing: -0.03em;
  max-width: 600px;
  line-height: 1.15;
`;

const FeatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  max-width: 1040px;
  margin: 0 auto;

  @media (max-width: 860px) { grid-template-columns: 1fr; }
`;

const FeatCard = styled.div`
  background: #0D0D0D;
  border: 1px solid #161616;
  border-radius: 14px;
  padding: 28px 26px;
  transition: border-color 0.2s, transform 0.2s;
  cursor: default;

  &:hover {
    border-color: rgba(220,38,38,0.22);
    transform: translateY(-3px);
  }
`;

const FeatIcon = styled.div`
  width: 42px;
  height: 42px;
  background: rgba(220,38,38,0.07);
  border: 1px solid rgba(220,38,38,0.12);
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #DC2626;
  margin-bottom: 18px;
`;

const FeatTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #FAFAFA;
  margin: 0 0 10px;
  letter-spacing: -0.02em;
`;

const FeatDesc = styled.p`
  font-size: 13px;
  color: #52525B;
  line-height: 1.65;
  margin: 0;
`;

const FeatChecks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const FeatCheck = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #52525B;

  svg { color: #16A34A; flex-shrink: 0; }
`;

/* ─────────────── CTA Banner ─────────────── */
const CTABanner = styled.section`
  position: relative;
  z-index: 1;
  padding: 80px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-top: 1px solid #111111;
`;

const BannerH2 = styled.h2`
  font-size: clamp(28px, 4vw, 46px);
  font-weight: 800;
  color: #FAFAFA;
  margin: 0 0 18px;
  letter-spacing: -0.04em;
  line-height: 1.1;
  max-width: 560px;
`;

const BannerSub = styled.p`
  font-size: 15px;
  color: #52525B;
  margin: 0 0 34px;
  max-width: 400px;
  line-height: 1.6;
`;

/* ─────────────── Footer ─────────────── */
const Footer = styled.footer`
  position: relative;
  z-index: 1;
  padding: 24px 56px;
  border-top: 1px solid #0F0F0F;
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media (max-width: 640px) { flex-direction: column; gap: 14px; padding: 24px; }
`;

const FooterLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FooterText = styled.p`
  font-size: 12px;
  color: #2A2A2A;
  margin: 0;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 24px;
`;

const FooterLink = styled(Link)`
  font-size: 12px;
  color: #2A2A2A;
  text-decoration: none;
  transition: color 0.15s;
  &:hover { color: #52525B; }
`;

/* ─────────────── Component ─────────────── */
export default function Landing() {
  const bars = [
    { h: '45%', active: false, delay: '0.55s' },
    { h: '60%', active: false, delay: '0.6s' },
    { h: '40%', active: false, delay: '0.65s' },
    { h: '70%', active: false, delay: '0.7s' },
    { h: '55%', active: false, delay: '0.75s' },
    { h: '80%', active: true, delay: '0.8s' },
    { h: '65%', active: false, delay: '0.85s' },
    { h: '90%', active: false, delay: '0.9s' },
    { h: '72%', active: false, delay: '0.95s' },
    { h: '58%', active: false, delay: '1.0s' },
    { h: '85%', active: true, delay: '1.05s' },
    { h: '68%', active: false, delay: '1.1s' },
  ];

  return (
    <Page>
      <Glow />
      <GlowSecondary />

      {/* ── Nav ── */}
      <Nav>
        <NavLogo to="/">
          <LogoBox><Shield size={16} color="#FAFAFA" strokeWidth={2.5} /></LogoBox>
          <LogoText>SecureBank</LogoText>
        </NavLogo>
        <NavCenter>
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#security">Security</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          <NavLink href="#features">About</NavLink>
        </NavCenter>
        <NavRight>
          <NavSignIn to="/signin">Login</NavSignIn>
          <NavCTA to="/signup">Get Started</NavCTA>
        </NavRight>
      </Nav>

      {/* ── Hero ── */}
      <Hero>
        <Badge>
          <BadgeDot />
          Bank-grade security · Plaid certified
        </Badge>

        <H1>
          Centralised control<br />
          for <em>smarter finances</em>
        </H1>

        <HeroSub>
          One secure dashboard to manage your accounts, track every penny,
          set budgets, and understand your spending — powered by real-time
          Plaid data.
        </HeroSub>

        <CTAGroup>
          <CTAPrimary to="/signup">
            Get started free <ArrowRight size={15} strokeWidth={2.5} />
          </CTAPrimary>
          <CTAGhost to="/signin">
            Sign in <ChevronRight size={14} />
          </CTAGhost>
        </CTAGroup>

        <TrustStrip>
          <TrustItem><Lock size={12} />256-bit encryption</TrustItem>
          <TrustItem><Shield size={12} />Bank-grade security</TrustItem>
          <TrustItem><Zap size={12} />Real-time sync</TrustItem>
          <TrustItem><CheckCircle2 size={12} />No data sold</TrustItem>
        </TrustStrip>
      </Hero>

      {/* ── Dashboard Mockup ── */}
      <MockupWrap id="security">
        <MockupFrame>
          {/* Browser chrome */}
          <MockupChrome>
            <ChromeDots>
              <Dot $c="#EF4444" />
              <Dot $c="#F59E0B" />
              <Dot $c="#22C55E" />
            </ChromeDots>
            <ChromeBar>
              <ChromeURL>securebank.app/dashboard</ChromeURL>
            </ChromeBar>
          </MockupChrome>

          <MockupBody>
            {/* Sidebar */}
            <MockSidebar>
              <SideLogoRow>
                <SideLogoBox>
                  <Shield size={12} color="#FAFAFA" strokeWidth={2.5} />
                </SideLogoBox>
                <SideLogoTxt>SecureBank</SideLogoTxt>
              </SideLogoRow>
              {[
                { label: 'Overview', active: true },
                { label: 'Transactions', active: false },
                { label: 'Analytics', active: false },
                { label: 'Budget', active: false },
                { label: 'Settings', active: false },
              ].map(({ label, active }) => (
                <SideItem key={label} $active={active}>
                  <SideDot $active={active} />
                  {label}
                </SideItem>
              ))}
            </MockSidebar>

            {/* Main content */}
            <MockMain>
              <MockHeader>
                <MockTitle>Overview</MockTitle>
                <MockBalance>£5,237.34</MockBalance>
              </MockHeader>

              <MockStatsGrid>
                {[
                  { label: 'Total Balance', val: '£5,237.34', color: '#FAFAFA' },
                  { label: 'Monthly Spending', val: '−£1,842.50', color: '#EF4444' },
                  { label: 'Monthly Income', val: '+£2,252.00', color: '#16A34A' },
                  { label: 'Budget Remaining', val: '£657.50', color: '#3B82F6' },
                ].map(({ label, val, color }) => (
                  <MockStatCard key={label}>
                    <MockStatLabel>{label}</MockStatLabel>
                    <MockStatVal $color={color}>{val}</MockStatVal>
                  </MockStatCard>
                ))}
              </MockStatsGrid>

              <MockGridRow>
                <MockChartCard>
                  <MockChartTitle>Spending this month vs last month</MockChartTitle>
                  <MockChart>
                    {bars.map((b, i) => (
                      <MockBar key={i} $h={b.h} $active={b.active} $delay={b.delay} />
                    ))}
                  </MockChart>
                </MockChartCard>

                <MockLineCard>
                  <MockChartTitle>Recent Transactions</MockChartTitle>
                  <MockTxList>
                    {[
                      { icon: '🛒', name: 'Tesco', amt: '−£42.80', neg: true, bg: 'rgba(217,119,6,0.15)' },
                      { icon: '⚡', name: 'British Gas', amt: '−£89.00', neg: true, bg: 'rgba(234,179,8,0.12)' },
                      { icon: '💳', name: 'Salary', amt: '+£2,252', neg: false, bg: 'rgba(22,163,74,0.12)' },
                      { icon: '🚇', name: 'Transport', amt: '−£28.40', neg: true, bg: 'rgba(37,99,235,0.12)' },
                      { icon: '🏠', name: 'Rent', amt: '−£950.00', neg: true, bg: 'rgba(139,92,246,0.12)' },
                    ].map(({ icon, name, amt, neg, bg }) => (
                      <MockTx key={name}>
                        <MockTxLeft>
                          <MockTxIcon $bg={bg}>{icon}</MockTxIcon>
                          <MockTxName>{name}</MockTxName>
                        </MockTxLeft>
                        <MockTxAmt $neg={neg}>{amt}</MockTxAmt>
                      </MockTx>
                    ))}
                  </MockTxList>
                </MockLineCard>
              </MockGridRow>
            </MockMain>
          </MockupBody>
        </MockupFrame>
      </MockupWrap>

      {/* ── Features ── */}
      <Features id="features">
        <SectionEyebrow>Why SecureBank</SectionEyebrow>
        <SectionH2>Everything you need to own your money</SectionH2>

        <FeatGrid>
          <FeatCard>
            <FeatIcon><BarChart2 size={20} strokeWidth={1.8} /></FeatIcon>
            <FeatTitle>Real-time analytics</FeatTitle>
            <FeatDesc>
              Understand exactly where your money goes with live charts,
              category breakdowns, and month-over-month comparisons.
            </FeatDesc>
            <FeatChecks>
              <FeatCheck><CheckCircle2 size={13} />Spending by category</FeatCheck>
              <FeatCheck><CheckCircle2 size={13} />Monthly trend charts</FeatCheck>
              <FeatCheck><CheckCircle2 size={13} />Top merchant insights</FeatCheck>
            </FeatChecks>
          </FeatCard>

          <FeatCard>
            <FeatIcon><PiggyBank size={20} strokeWidth={1.8} /></FeatIcon>
            <FeatTitle>Budget & streak tracking</FeatTitle>
            <FeatDesc>
              Set monthly budgets, track how much you have left, and build
              spending streaks that reward consistent financial discipline.
            </FeatDesc>
            <FeatChecks>
              <FeatCheck><CheckCircle2 size={13} />Custom monthly budgets</FeatCheck>
              <FeatCheck><CheckCircle2 size={13} />Remaining budget at a glance</FeatCheck>
              <FeatCheck><CheckCircle2 size={13} />Daily streak gamification</FeatCheck>
            </FeatChecks>
          </FeatCard>

          <FeatCard>
            <FeatIcon><Lock size={20} strokeWidth={1.8} /></FeatIcon>
            <FeatTitle>Security by design</FeatTitle>
            <FeatDesc>
              JWT authentication with refresh tokens, encrypted credentials,
              and Plaid's bank-grade connection — your data never touches
              unsafe infrastructure.
            </FeatDesc>
            <FeatChecks>
              <FeatCheck><CheckCircle2 size={13} />JWT + refresh token rotation</FeatCheck>
              <FeatCheck><CheckCircle2 size={13} />Plaid-certified bank link</FeatCheck>
              <FeatCheck><CheckCircle2 size={13} />256-bit encrypted storage</FeatCheck>
            </FeatChecks>
          </FeatCard>
        </FeatGrid>
      </Features>

      {/* ── CTA Banner ── */}
      <CTABanner id="pricing">
        <BannerH2>Start taking control today</BannerH2>
        <BannerSub>
          Join SecureBank and get a single, secure view of your finances
          in under two minutes.
        </BannerSub>
        <CTAGroup>
          <CTAPrimary to="/signup">
            Create free account <ArrowRight size={15} />
          </CTAPrimary>
          <CTAGhost to="/signin">
            Already have an account <ChevronRight size={14} />
          </CTAGhost>
        </CTAGroup>
      </CTABanner>

      {/* ── Footer ── */}
      <Footer>
        <FooterLeft>
          <LogoBox style={{ width: 24, height: 24, borderRadius: 6 }}>
            <Shield size={12} color="#FAFAFA" strokeWidth={2.5} />
          </LogoBox>
          <FooterText>© 2026 SecureBank. All rights reserved.</FooterText>
        </FooterLeft>
        <FooterLinks>
          <FooterLink to="/signin">Sign in</FooterLink>
          <FooterLink to="/signup">Sign up</FooterLink>
        </FooterLinks>
      </Footer>
    </Page>
  );
}
