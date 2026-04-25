import styled from 'styled-components';
import { TrendingUp, TrendingDown } from 'lucide-react';

const Card = styled.div`
  background: #141414;
  border: 1px solid #222222;
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Label = styled.span`
  font-size: 12px;
  color: #71717A;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const IconWrap = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${({ $color }) => $color || 'rgba(220,38,38,0.10)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $iconColor }) => $iconColor || '#DC2626'};
`;

const Amount = styled.p`
  font-size: 22px;
  font-weight: 700;
  color: #FAFAFA;
  margin: 0;
  letter-spacing: -0.02em;
`;

const Change = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  color: ${({ $positive }) => ($positive ? '#16A34A' : '#DC2626')};
`;

export default function StatCard({ label, value, icon: Icon, iconBg, iconColor, change, changePositive }) {
  return (
    <Card>
      <Top>
        <Label>{label}</Label>
        {Icon && (
          <IconWrap $color={iconBg} $iconColor={iconColor}>
            <Icon size={15} strokeWidth={2} />
          </IconWrap>
        )}
      </Top>
      <Amount>{value}</Amount>
      {change !== undefined && (
        <Change $positive={changePositive}>
          {changePositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {change}
        </Change>
      )}
    </Card>
  );
}
