import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Pencil, Check, X } from 'lucide-react';
import { formatCurrency } from '../../utils/validators';

const Card = styled.div`
  background: #141414;
  border: 1px solid #222222;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Row = styled.div`
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

const EditBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: rgba(220,38,38,0.10);
  border: 1px solid rgba(220,38,38,0.20);
  border-radius: 6px;
  color: #DC2626;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: rgba(220,38,38,0.16); }
`;

const ProgressBar = styled.div`
  height: 5px;
  background: #1E1E1E;
  border-radius: 99px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 99px;
  width: ${({ $pct }) => Math.min($pct, 100)}%;
  background: ${({ $pct }) =>
    $pct >= 100 ? '#DC2626' : $pct >= 80 ? '#D97706' : '#16A34A'};
  transition: width 0.4s ease;
`;

const SpentRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #52525B;
`;

const AllowanceBox = styled.div`
  background: #1A1A1A;
  border: 1px solid #222;
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AllowanceLabel = styled.div`
  font-size: 11px;
  color: #52525B;
`;

const AllowanceValue = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${({ $warn }) => ($warn ? '#D97706' : '#FAFAFA')};
`;

const AllowanceSub = styled.div`
  font-size: 10px;
  color: #3F3F46;
  margin-top: 1px;
`;

const DividerLabel = styled.p`
  font-size: 11px;
  font-weight: 600;
  color: #3F3F46;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const CatList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CatRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CatName = styled.span`
  font-size: 11px;
  color: #A1A1AA;
  text-transform: capitalize;
`;

const CatAmount = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #71717A;
`;

const CatBar = styled.div`
  height: 3px;
  background: #1E1E1E;
  border-radius: 99px;
  overflow: hidden;
`;

const CatBarFill = styled.div`
  height: 100%;
  border-radius: 99px;
  width: ${({ $pct }) => Math.min($pct, 100)}%;
  background: ${({ $rank }) =>
    $rank === 0 ? '#DC2626' : $rank === 1 ? '#D97706' : '#3B82F6'};
  transition: width 0.5s ease;
`;

const NoBudget = styled.p`
  font-size: 12px;
  color: #52525B;
  margin: 0;
  line-height: 1.5;
`;

const EditRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const EditInput = styled.input`
  flex: 1;
  background: #1A1A1A;
  border: 1px solid #DC2626;
  border-radius: 6px;
  padding: 6px 10px;
  color: #FAFAFA;
  font-size: 13px;
  font-family: inherit;
  outline: none;
`;

const IconBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid ${({ $confirm }) => ($confirm ? 'rgba(22,163,74,0.3)' : '#222')};
  background: ${({ $confirm }) => ($confirm ? 'rgba(22,163,74,0.10)' : '#1A1A1A')};
  color: ${({ $confirm }) => ($confirm ? '#16A34A' : '#71717A')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover { border-color: currentColor; }
`;

function getTopCategories(transactions) {
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;

  const monthExpenses = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d.getFullYear() === cy && d.getMonth() + 1 === cm && tx.amount < 0;
  });

  const catMap = {};
  for (const tx of monthExpenses) {
    const cat = (tx.category || 'Other').toLowerCase();
    catMap[cat] = (catMap[cat] || 0) + Math.abs(tx.amount);
  }

  const total = Object.values(catMap).reduce((s, v) => s + v, 0);

  return {
    total,
    top: Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, amount]) => ({
        cat,
        amount,
        pct: total > 0 ? (amount / total) * 100 : 0,
      })),
  };
}

export default function BudgetWidget({ budget = 0, monthlySpending = 0, transactions = [], onUpdateBudget }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const now = new Date();
  const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = totalDays - now.getDate();
  const pct = budget > 0 ? (monthlySpending / budget) * 100 : 0;
  const remaining = budget > 0 ? Math.max(budget - monthlySpending, 0) : 0;
  const dailyAllowance = budget > 0 && daysLeft > 0 ? remaining / daysLeft : 0;
  const overBudget = budget > 0 && monthlySpending > budget;

  const { total: catTotal, top: topCats } = useMemo(
    () => getTopCategories(transactions),
    [transactions]
  );

  const handleSave = async () => {
    const val = parseFloat(draft);
    if (!isNaN(val) && val >= 0) await onUpdateBudget?.(val);
    setEditing(false);
  };

  return (
    <Card>
      <Row>
        <Title>Budget</Title>
        {!editing && (
          <EditBtn onClick={() => { setDraft(String(budget)); setEditing(true); }}>
            <Pencil size={11} /> {budget > 0 ? 'Change' : 'Set Budget'}
          </EditBtn>
        )}
      </Row>

      {editing ? (
        <EditRow>
          <EditInput
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Enter monthly budget (£)"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
          <IconBtn $confirm onClick={handleSave}><Check size={13} /></IconBtn>
          <IconBtn onClick={() => setEditing(false)}><X size={13} /></IconBtn>
        </EditRow>
      ) : budget === 0 ? (
        <NoBudget>No budget set. Click &quot;Set Budget&quot; to start tracking your monthly spending.</NoBudget>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <ProgressBar>
              <ProgressFill $pct={pct} />
            </ProgressBar>
            <SpentRow>
              <span>Spent: {formatCurrency(monthlySpending, true)}</span>
              <span>{daysLeft}d left · Budget: {formatCurrency(budget, true)}</span>
            </SpentRow>
          </div>

          <AllowanceBox>
            <div>
              <AllowanceLabel>Daily allowance</AllowanceLabel>
              <AllowanceSub>{daysLeft} days remaining</AllowanceSub>
            </div>
            <div style={{ textAlign: 'right' }}>
              <AllowanceValue $warn={overBudget}>
                {overBudget ? '—' : formatCurrency(dailyAllowance, true)}
              </AllowanceValue>
              {overBudget && (
                <AllowanceSub style={{ color: '#DC2626' }}>Over budget</AllowanceSub>
              )}
            </div>
          </AllowanceBox>

          {topCats.length > 0 && (
            <>
              <DividerLabel>Top spending</DividerLabel>
              <CatList>
                {topCats.map((c, i) => (
                  <CatRow key={c.cat}>
                    <CatHeader>
                      <CatName>{c.cat}</CatName>
                      <CatAmount>{formatCurrency(c.amount, true)}</CatAmount>
                    </CatHeader>
                    <CatBar>
                      <CatBarFill $pct={c.pct} $rank={i} />
                    </CatBar>
                  </CatRow>
                ))}
              </CatList>
            </>
          )}
        </>
      )}
    </Card>
  );
}
