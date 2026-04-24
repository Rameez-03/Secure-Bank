import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Bell } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Bar = styled.header`
  height: 64px;
  background: #0A0A0A;
  border-bottom: 1px solid #1A1A1A;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  position: sticky;
  top: 0;
  z-index: 50;
`;

const PageTitle = styled.h1`
  font-size: 16px;
  font-weight: 600;
  color: #FAFAFA;
  margin: 0;
  letter-spacing: -0.01em;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconBtn = styled.button`
  width: 36px;
  height: 36px;
  background: #141414;
  border: 1px solid #222222;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #71717A;
  transition: all 0.15s ease;
  &:hover { border-color: #3F3F46; color: #FAFAFA; }
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  background: rgba(220, 38, 38, 0.12);
  border: 1px solid rgba(220, 38, 38, 0.25);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #DC2626;
  cursor: pointer;
`;

const routeTitles = {
  '/dashboard': 'Overview',
  '/transactions': 'Transactions',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function Header() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'SecureBank';

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SB';

  return (
    <Bar>
      <PageTitle>{title}</PageTitle>
      <Right>
        <IconBtn aria-label="Notifications">
          <Bell size={16} strokeWidth={1.8} />
        </IconBtn>
        <Avatar>{initials}</Avatar>
      </Right>
    </Bar>
  );
}
