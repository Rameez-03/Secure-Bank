import { useMemo } from 'react';
import styled from 'styled-components';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const Card = styled.div`
  background: #141414;
  border: 1px solid #222222;
  border-radius: 12px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  margin-bottom: 4px;
`;

const Title = styled.h3`
  font-size: 13px;
  font-weight: 600;
  color: #FAFAFA;
  margin: 0 0 3px;
`;

const Sub = styled.p`
  font-size: 11px;
  color: #52525B;
  margin: 0 0 18px;
`;

const LegendRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 14px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #71717A;
`;

const LegendDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const TooltipBox = styled.div`
  background: #1C1C1C;
  border: 1px solid #2A2A2A;
  border-radius: 8px;
  padding: 10px 14px;
`;

const TooltipLabel = styled.p`
  color: #71717A;
  font-size: 11px;
  margin: 0 0 6px;
`;

const TooltipValue = styled.p`
  color: ${({ $color }) => $color};
  font-size: 12px;
  font-weight: 600;
  margin: 2px 0;
`;

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <TooltipBox>
      <TooltipLabel>Day {label}</TooltipLabel>
      {payload.map((p) => (
        <TooltipValue key={p.dataKey} $color={p.color}>
          £{(p.value || 0).toFixed(2)} — {p.dataKey === 'thisMonth' ? 'This month' : 'Last month'}
        </TooltipValue>
      ))}
    </TooltipBox>
  );
}

function buildChartData(transactions) {
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  const lm = cm === 1 ? 12 : cm - 1;
  const ly = cm === 1 ? cy - 1 : cy;

  const dThis = new Date(cy, cm, 0).getDate();
  const dLast = new Date(ly, lm, 0).getDate();
  const maxDays = Math.max(dThis, dLast);

  return Array.from({ length: maxDays }, (_, i) => {
    const day = i + 1;
    const entry = { day };

    if (day <= dThis) {
      entry.thisMonth = transactions.reduce((s, tx) => {
        const d = new Date(tx.date);
        return d.getFullYear() === cy && d.getMonth() + 1 === cm && d.getDate() === day
          ? s + Math.abs(tx.amount)
          : s;
      }, 0);
    }

    if (day <= dLast) {
      entry.lastMonth = transactions.reduce((s, tx) => {
        const d = new Date(tx.date);
        return d.getFullYear() === ly && d.getMonth() + 1 === lm && d.getDate() === day
          ? s + Math.abs(tx.amount)
          : s;
      }, 0);
    }

    return entry;
  });
}

export default function SpendingChart({ transactions = [] }) {
  const data = useMemo(() => buildChartData(transactions), [transactions]);

  return (
    <Card>
      <Header>
        <Title>Spending this month</Title>
        <Sub>vs last month</Sub>
      </Header>
      <LegendRow>
        <LegendItem><LegendDot $color="#DC2626" /> This month</LegendItem>
        <LegendItem><LegendDot $color="#3F3F46" /> Last month</LegendItem>
      </LegendRow>
      <div style={{ flex: 1, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="transparent"
            tick={{ fill: '#3F3F46', fontSize: 10 }}
            interval={4}
            tickLine={false}
          />
          <YAxis
            stroke="transparent"
            tick={{ fill: '#3F3F46', fontSize: 10 }}
            tickFormatter={(v) => `£${v}`}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2A2A2A' }} />
          <Line
            type="monotone"
            dataKey="lastMonth"
            stroke="#3F3F46"
            strokeWidth={1.5}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="thisMonth"
            stroke="#DC2626"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </Card>
  );
}
