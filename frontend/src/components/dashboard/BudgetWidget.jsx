import { useState } from 'react';
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
  height: 6px;
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

const Stats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #52525B;
`;

const StatusMsg = styled.p`
  font-size: 12px;
  color: ${({ $bad }) => ($bad ? '#DC2626' : '#71717A')};
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

function getBudgetMessage(budget, spent, daysLeft) {
  if (budget === 0) return { text: 'No budget set. Add one to track spending.', bad: false };
  const pct = (spent / budget) * 100;
  const over = spent - budget;
  if (pct >= 100) return { text: `You've gone over budget by ${formatCurrency(over, true)}.`, bad: true };
  const remaining = budget - spent;
  const pctLeft = Math.round(100 - pct);
  return {
    text: `${pctLeft}% of budget remaining · ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left this month.`,
    bad: false,
  };
}

export default function BudgetWidget({ budget = 0, monthlySpending = 0, onUpdateBudget }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const now = new Date();
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
  const pct = budget > 0 ? (monthlySpending / budget) * 100 : 0;
  const { text, bad } = getBudgetMessage(budget, monthlySpending, daysLeft);

  const handleSave = async () => {
    const val = parseFloat(draft);
    if (!isNaN(val) && val >= 0) {
      await onUpdateBudget?.(val);
    }
    setEditing(false);
  };

  return (
    <Card>
      <Row>
        <Title>Budget</Title>
        {!editing && (
          <EditBtn onClick={() => { setDraft(String(budget)); setEditing(true); }}>
            <Pencil size={11} /> Change
          </EditBtn>
        )}
      </Row>

      {editing ? (
        <EditRow>
          <EditInput
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Enter budget (£)"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
          />
          <IconBtn $confirm onClick={handleSave}><Check size={13} /></IconBtn>
          <IconBtn onClick={() => setEditing(false)}><X size={13} /></IconBtn>
        </EditRow>
      ) : (
        <>
          <ProgressBar>
            <ProgressFill $pct={pct} />
          </ProgressBar>
          <Stats>
            <span>Spent: {formatCurrency(monthlySpending, true)}</span>
            <span>Budget: {budget > 0 ? formatCurrency(budget, true) : '—'}</span>
          </Stats>
          <StatusMsg $bad={bad}>{text}</StatusMsg>
        </>
      )}
    </Card>
  );
}
