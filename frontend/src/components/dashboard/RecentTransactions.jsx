import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  Car, Coffee, ShoppingBag, Heart, Zap, Home, Music, MoreHorizontal, ArrowDownLeft,
} from 'lucide-react';
import { formatCurrency, formatShortDate } from '../../utils/validators';

const Card = styled.div`
  background: #141414;
  border: 1px solid #222222;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 16px 18px 12px;
  border-bottom: 1px solid #1A1A1A;
`;

const Title = styled.h3`
  font-size: 13px;
  font-weight: 600;
  color: #FAFAFA;
  margin: 0;
`;

const List = styled.div`
  flex: 1;
  overflow-y: auto;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
`;

const TxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-bottom: 1px solid #1A1A1A;
  transition: background 0.1s;
  &:hover { background: #1A1A1A; }
  &:last-child { border-bottom: none; }
`;

const CategoryIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: ${({ $bg }) => $bg || 'rgba(220,38,38,0.10)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ $color }) => $color || '#DC2626'};
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
`;

const Desc = styled.p`
  font-size: 12px;
  font-weight: 500;
  color: #FAFAFA;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Cat = styled.p`
  font-size: 11px;
  color: #52525B;
  margin: 0;
`;

const Amount = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ $positive }) => ($positive ? '#16A34A' : '#A1A1AA')};
  flex-shrink: 0;
`;

const Footer = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-top: 1px solid #1A1A1A;
  font-size: 12px;
  color: #DC2626;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.1s;
  &:hover { background: rgba(220,38,38,0.05); }
`;

const Empty = styled.div`
  padding: 32px 18px;
  text-align: center;
  color: #52525B;
  font-size: 13px;
`;

const categoryMap = {
  travel: { icon: Car, bg: 'rgba(37,99,235,0.10)', color: '#3B82F6' },
  'food and drink': { icon: Coffee, bg: 'rgba(217,119,6,0.10)', color: '#D97706' },
  food: { icon: Coffee, bg: 'rgba(217,119,6,0.10)', color: '#D97706' },
  shopping: { icon: ShoppingBag, bg: 'rgba(16,185,129,0.10)', color: '#10B981' },
  shops: { icon: ShoppingBag, bg: 'rgba(16,185,129,0.10)', color: '#10B981' },
  healthcare: { icon: Heart, bg: 'rgba(239,68,68,0.10)', color: '#EF4444' },
  utilities: { icon: Zap, bg: 'rgba(234,179,8,0.10)', color: '#EAB308' },
  rent: { icon: Home, bg: 'rgba(139,92,246,0.10)', color: '#8B5CF6' },
  entertainment: { icon: Music, bg: 'rgba(236,72,153,0.10)', color: '#EC4899' },
  income: { icon: ArrowDownLeft, bg: 'rgba(22,163,74,0.10)', color: '#16A34A' },
};

function getCategoryStyle(category) {
  const key = (category || '').toLowerCase();
  return categoryMap[key] || { icon: MoreHorizontal, bg: 'rgba(220,38,38,0.10)', color: '#DC2626' };
}

export default function RecentTransactions({ transactions = [] }) {
  const recent = transactions.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <Title>Recent Transactions</Title>
      </CardHeader>
      <List>
        {recent.length === 0 ? (
          <Empty>No transactions yet</Empty>
        ) : (
          recent.map((tx) => {
            const { icon: Icon, bg, color } = getCategoryStyle(tx.category);
            const isPositive = tx.amount > 0;
            return (
              <TxRow key={tx._id}>
                <CategoryIcon $bg={bg} $color={color}>
                  <Icon size={15} strokeWidth={1.8} />
                </CategoryIcon>
                <Info>
                  <Desc>{tx.description}</Desc>
                  <Cat>{tx.category}</Cat>
                </Info>
                <Amount $positive={isPositive}>
                  {isPositive ? '+' : ''}{formatCurrency(tx.amount, !isPositive)}
                </Amount>
              </TxRow>
            );
          })
        )}
      </List>
      <Footer to="/transactions">See all transactions →</Footer>
    </Card>
  );
}
