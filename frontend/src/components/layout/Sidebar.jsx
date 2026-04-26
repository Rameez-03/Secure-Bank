import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart2,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = styled.aside`
  width: 240px;
  min-height: 100vh;
  background: #0D0D0D;
  border-right: 1px solid #1A1A1A;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
`;

const LogoSection = styled.div`
  padding: 20px 20px 18px;
  border-bottom: 1px solid #1A1A1A;
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
`;

const LogoIcon = styled.div`
  width: 34px;
  height: 34px;
  background: #DC2626;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const LogoText = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #FAFAFA;
  letter-spacing: -0.02em;
`;

const NavSection = styled.div`
  padding: 12px 10px 0;
  flex: 1;
`;

const SectionLabel = styled.p`
  font-size: 10px;
  font-weight: 600;
  color: #3F3F46;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0 10px;
  margin: 14px 0 6px;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  color: ${({ $active }) => ($active ? '#FAFAFA' : '#71717A')};
  background: ${({ $active }) => ($active ? '#1C1C1C' : 'transparent')};
  text-decoration: none;
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? '500' : '400')};
  transition: all 0.15s ease;
  border-left: 2px solid ${({ $active }) => ($active ? '#DC2626' : 'transparent')};
  margin-bottom: 2px;

  svg {
    color: ${({ $active }) => ($active ? '#DC2626' : '#52525B')};
    flex-shrink: 0;
  }

  &:hover {
    color: #FAFAFA;
    background: #161616;
    svg { color: #A1A1AA; }
  }
`;

const BottomSection = styled.div`
  padding: 12px 10px 16px;
  border-top: 1px solid #1A1A1A;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 4px;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  background: #1C1C1C;
  border: 1px solid #2A2A2A;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #DC2626;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  overflow: hidden;
`;

const UserName = styled.p`
  font-size: 13px;
  font-weight: 500;
  color: #FAFAFA;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
`;

const UserEmail = styled.p`
  font-size: 11px;
  color: #52525B;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
`;

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  color: #71717A;
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.15s ease;
  width: 100%;
  font-family: inherit;

  &:hover {
    color: #DC2626;
    background: rgba(220, 38, 38, 0.08);
    svg { color: #DC2626; }
  }

  svg { color: #52525B; flex-shrink: 0; }
`;

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function SidebarComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, dispatch } = useContext(AuthContext);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/signin');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SB';

  return (
    <Sidebar>
      <LogoSection>
        <LogoLink to="/dashboard">
          <LogoIcon>
            <Shield size={18} color="#FAFAFA" strokeWidth={2.5} />
          </LogoIcon>
          <LogoText>SecureBank</LogoText>
        </LogoLink>
      </LogoSection>

      <NavSection>
        <SectionLabel>Menu</SectionLabel>
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavItem
            key={path}
            to={path}
            $active={location.pathname === path}
          >
            <Icon size={16} strokeWidth={1.8} />
            {label}
          </NavItem>
        ))}
      </NavSection>

      <BottomSection>
        <UserCard>
          <Avatar>{initials}</Avatar>
          <UserInfo>
            <UserName>{user?.name || 'User'}</UserName>
            <UserEmail>{user?.email || ''}</UserEmail>
          </UserInfo>
        </UserCard>
        <LogoutBtn onClick={handleLogout}>
          <LogOut size={16} strokeWidth={1.8} />
          Logout
        </LogoutBtn>
      </BottomSection>
    </Sidebar>
  );
}
