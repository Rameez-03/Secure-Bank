import { useMemo } from 'react';
import styled from 'styled-components';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency } from '../utils/validators';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: #141414;
  border: 1px solid #222222;
  border-radius: 12px;
  padding: 16px 18px;
`;

const StatLabel = styled.p`
  font-size: 11px;
  color: #52525B;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
  margin: 0 0 8px;
`;

const StatValue = styled.p`
  font-size: 20px;
  font-weight: 700;
  color: #FAFAFA;
  margin: 0;
  letter-spacing: -0.02em;
`;

const Card = styled.div`
  background: #141414;
  border: 1px solid #222222;
  border-radius: 12px;
  padding: 20px;
`;

const CardTitle = styled.h3`
  font-size: 13px;
  font-weight: 600;
  color: #FAFAFA;
  margin: 0 0 18px;
`;

const Legend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LegendLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #A1A1AA;
`;

const LegendDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const LegendAmount = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #FAFAFA;
`;

const TopList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TopItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #1A1A1A;
  border-radius: 8px;
`;

const TopName = styled.span`
  font-size: 13px;
  color: #FAFAFA;
  font-weight: 500;
`;

const TopAmount = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #DC2626;
`;

const TooltipBox = styled.div`
  background: #1C1C1C;
  border: 1px solid #2A2A2A;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12px;
  color: #FAFAFA;
`;

const COLORS = ['#DC2626', '#D97706', '#2563EB', '#16A34A', '#8B5CF6', '#EC4899', '#0891B2', '#65A30D'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <TooltipBox>
      <p style={{ color: '#71717A', margin: '0 0 4px' }}>{label}</p>
      <p style={{ margin: 0, fontWeight: 600 }}>£{(payload[0].value || 0).toFixed(2)}</p>
    </TooltipBox>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <TooltipBox>
      <p style={{ margin: '0 0 4px', color: '#A1A1AA' }}>{payload[0].name}</p>
      <p style={{ margin: 0, fontWeight: 600 }}>{formatCurrency(payload[0].value, true)}</p>
    </TooltipBox>
  );
}

export default function Analytics() {
  const { transactions, loading } = useTransactions();

  const { stats, categoryData, monthlyData, topMerchants } = useMemo(() => {
    const now = new Date();
    const cy = now.getFullYear();
    const cm = now.getMonth() + 1;

    const thisMonth = transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getFullYear() === cy && d.getMonth() + 1 === cm;
    });

    const totalSpent = transactions.reduce((s, tx) => tx.amount < 0 ? s + Math.abs(tx.amount) : s, 0);
    const monthlySpent = thisMonth.reduce((s, tx) => tx.amount < 0 ? s + Math.abs(tx.amount) : s, 0);

    const monthCount = new Set(
      transactions.map((tx) => {
        const d = new Date(tx.date);
        return `${d.getFullYear()}-${d.getMonth()}`;
      })
    ).size || 1;

    const avgMonthly = totalSpent / monthCount;

    const categoryTotals = {};
    transactions.forEach((tx) => {
      if (tx.amount < 0) {
        const cat = tx.category || 'Other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(tx.amount);
      }
    });

    const categoryData = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const topCategory = categoryData[0]?.name || '—';

    const monthlyTotals = {};
    transactions.forEach((tx) => {
      if (tx.amount < 0) {
        const d = new Date(tx.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyTotals[key] = (monthlyTotals[key] || 0) + Math.abs(tx.amount);
      }
    });

    const monthlyData = Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, value]) => {
        const [, m] = key.split('-');
        return { month: MONTHS_SHORT[parseInt(m, 10) - 1], value };
      });

    const merchantTotals = {};
    transactions.forEach((tx) => {
      if (tx.amount < 0) {
        merchantTotals[tx.description] = (merchantTotals[tx.description] || 0) + Math.abs(tx.amount);
      }
    });

    const topMerchants = Object.entries(merchantTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, total]) => ({ name, total }));

    return {
      stats: { totalSpent, monthlySpent, avgMonthly, topCategory },
      categoryData,
      monthlyData,
      topMerchants,
    };
  }, [transactions]);

  if (loading) return <LoadingSpinner fill />;

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#FAFAFA', marginBottom: '20px', letterSpacing: '-0.02em' }}>Analytics</h1>

      <StatsRow>
        {[
          { label: 'Total Spent (all time)', value: formatCurrency(stats.totalSpent, true) },
          { label: 'This Month', value: formatCurrency(stats.monthlySpent, true) },
          { label: 'Avg Per Month', value: formatCurrency(stats.avgMonthly, true) },
          { label: 'Top Category', value: stats.topCategory },
        ].map(({ label, value }) => (
          <StatCard key={label}>
            <StatLabel>{label}</StatLabel>
            <StatValue>{value}</StatValue>
          </StatCard>
        ))}
      </StatsRow>

      <Grid2>
        <Card>
          <CardTitle>Spending by Category</CardTitle>
          {categoryData.length === 0 ? (
            <p style={{ color: '#52525B', fontSize: '13px' }}>No spending data yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <Legend>
                {categoryData.slice(0, 6).map((item, i) => (
                  <LegendItem key={item.name}>
                    <LegendLeft>
                      <LegendDot $color={COLORS[i % COLORS.length]} />
                      {item.name}
                    </LegendLeft>
                    <LegendAmount>{formatCurrency(item.value, true)}</LegendAmount>
                  </LegendItem>
                ))}
              </Legend>
            </>
          )}
        </Card>

        <Card>
          <CardTitle>Monthly Spending Trend</CardTitle>
          {monthlyData.length === 0 ? (
            <p style={{ color: '#52525B', fontSize: '13px' }}>No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
                <XAxis dataKey="month" stroke="transparent" tick={{ fill: '#3F3F46', fontSize: 10 }} tickLine={false} />
                <YAxis stroke="transparent" tick={{ fill: '#3F3F46', fontSize: 10 }} tickFormatter={(v) => `£${v}`} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="value" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </Grid2>

      <Card>
        <CardTitle>Top Merchants</CardTitle>
        {topMerchants.length === 0 ? (
          <p style={{ color: '#52525B', fontSize: '13px' }}>No data yet</p>
        ) : (
          <TopList>
            {topMerchants.map(({ name, total }) => (
              <TopItem key={name}>
                <TopName>{name}</TopName>
                <TopAmount>{formatCurrency(total, true)}</TopAmount>
              </TopItem>
            ))}
          </TopList>
        )}
      </Card>
    </div>
  );
}
