import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Card = styled.div`
  background: #141414;
  border: 1px solid #222222;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h3`
  font-size: 13px;
  font-weight: 600;
  color: #FAFAFA;
  margin: 0;
`;

const YearBadge = styled.span`
  font-size: 12px;
  color: #52525B;
  font-weight: 500;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const MonthCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const MonthLabel = styled.span`
  font-size: 11px;
  color: #52525B;
  font-weight: 500;
`;

const Dot = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ $hasData, $color }) => ($hasData ? $color : 'transparent')};
  border: 1.5px solid ${({ $hasData, $color }) => ($hasData ? $color : '#2A2A2A')};
  transition: all 0.2s ease;
  cursor: ${({ $hasData }) => ($hasData ? 'default' : 'default')};
  title: ${({ $title }) => $title};
`;

const NavRow = styled.div`
  display: flex;
  gap: 8px;
`;

const NavBtn = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 7px 0;
  background: #1A1A1A;
  border: 1px solid #222222;
  border-radius: 8px;
  color: #71717A;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  &:hover:not(:disabled) { border-color: #3F3F46; color: #FAFAFA; }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getDotColor(ratio) {
  if (ratio === 0) return null;
  if (ratio < 0.35) return '#16A34A';
  if (ratio < 0.70) return '#D97706';
  return '#DC2626';
}

export default function MonthlySpending({ transactions = [] }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const monthlyData = useMemo(() => {
    const totals = MONTHS.map((month, idx) =>
      transactions.reduce((sum, tx) => {
        const d = new Date(tx.date);
        return d.getFullYear() === year && d.getMonth() === idx
          ? sum + Math.abs(tx.amount)
          : sum;
      }, 0)
    );
    const max = Math.max(...totals, 1);
    return totals.map((total, idx) => ({
      month: MONTHS[idx],
      total,
      ratio: total / max,
    }));
  }, [transactions, year]);

  return (
    <Card>
      <CardHeader>
        <Title>Monthly Spending</Title>
        <YearBadge>{year}</YearBadge>
      </CardHeader>

      <Grid>
        {monthlyData.map(({ month, total, ratio }) => {
          const color = getDotColor(ratio);
          return (
            <MonthCell key={month} title={total > 0 ? `£${total.toFixed(0)}` : 'No data'}>
              <MonthLabel>{month}</MonthLabel>
              <Dot $hasData={total > 0} $color={color} />
            </MonthCell>
          );
        })}
      </Grid>

      <NavRow>
        <NavBtn onClick={() => setYear((y) => y - 1)}>
          <ChevronLeft size={12} /> Previous
        </NavBtn>
        <NavBtn onClick={() => setYear((y) => y + 1)} disabled={year >= currentYear}>
          Next <ChevronRight size={12} />
        </NavBtn>
      </NavRow>
    </Card>
  );
}
