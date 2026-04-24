import { useState, useMemo } from 'react';
import styled from 'styled-components';
import {
  Plus, Search, Trash2, Car, Coffee, ShoppingBag, Heart, Zap, Home,
  Music, MoreHorizontal, ArrowDownLeft, X, Check,
} from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency, formatDate } from '../utils/validators';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

/* ── Layout ── */
const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #FAFAFA;
  margin: 0;
  letter-spacing: -0.02em;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const SearchWrap = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 320px;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #52525B;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  background: #141414;
  border: 1px solid #222222;
  border-radius: 8px;
  padding: 9px 12px 9px 36px;
  color: #FAFAFA;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  &::placeholder { color: #52525B; }
  &:focus { border-color: #DC2626; }
`;

const Select = styled.select`
  background: #141414;
  border: 1px solid #222222;
  border-radius: 8px;
  padding: 9px 14px;
  color: #A1A1AA;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  &:focus { border-color: #DC2626; }
  option { background: #1A1A1A; }
`;

/* ── Table ── */
const TableWrap = styled.div`
  background: #141414;
  border: 1px solid #222222;
  border-radius: 12px;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 600;
  color: #52525B;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid #1E1E1E;
  background: #111111;
`;

const Tr = styled.tr`
  border-bottom: 1px solid #1A1A1A;
  transition: background 0.1s;
  &:hover { background: #1A1A1A; }
  &:last-child { border-bottom: none; }
`;

const Td = styled.td`
  padding: 12px 16px;
  font-size: 13px;
  color: #A1A1AA;
  vertical-align: middle;
`;

const CategoryIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const TxName = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #FAFAFA;
`;

const CategoryBadge = styled.span`
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 500;
  background: #1C1C1C;
  color: #71717A;
  border: 1px solid #222;
`;

const AmountCell = styled.span`
  font-weight: 600;
  color: ${({ $positive }) => ($positive ? '#16A34A' : '#A1A1AA')};
`;

const ManualBadge = styled.span`
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(37,99,235,0.10);
  color: #3B82F6;
  border: 1px solid rgba(37,99,235,0.2);
`;

const ActionBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #52525B;
  transition: all 0.15s;
  &:hover { background: rgba(220,38,38,0.10); border-color: rgba(220,38,38,0.2); color: #DC2626; }
`;

const Empty = styled.div`
  padding: 60px;
  text-align: center;
  color: #52525B;
  font-size: 14px;
`;

const Count = styled.p`
  font-size: 12px;
  color: #52525B;
  margin: 0 0 16px;
`;

/* ── Modal ── */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
`;

const Modal = styled.div`
  background: #141414;
  border: 1px solid #222222;
  border-radius: 14px;
  padding: 24px;
  width: 100%;
  max-width: 420px;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #FAFAFA;
  margin: 0;
`;

const CloseBtn = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #222;
  background: #1A1A1A;
  color: #71717A;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover { border-color: #3F3F46; color: #FAFAFA; }
`;

const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const StyledSelect = styled.select`
  width: 100%;
  background: #141414;
  border: 1px solid #222222;
  border-radius: 8px;
  padding: 10px 14px;
  color: #FAFAFA;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  &:focus { border-color: #DC2626; }
  option { background: #1A1A1A; }
`;

const CATEGORIES = [
  'Food and Drink', 'Travel', 'Shopping', 'Entertainment',
  'Healthcare', 'Utilities', 'Rent', 'Income', 'Other',
];

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

function getCatStyle(cat) {
  return categoryMap[(cat || '').toLowerCase()] ||
    { icon: MoreHorizontal, bg: 'rgba(220,38,38,0.10)', color: '#DC2626' };
}

const EMPTY_FORM = {
  description: '',
  amount: '',
  category: 'Other',
  date: new Date().toISOString().split('T')[0],
};

export default function Transactions() {
  const { transactions, loading, addTransaction, removeTransaction } = useTransactions();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((tx) => tx.description.toLowerCase().includes(q));
    }
    if (catFilter) {
      list = list.filter((tx) => tx.category.toLowerCase() === catFilter.toLowerCase());
    }
    return list;
  }, [transactions, search, catFilter]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    try {
      setSaving(true);
      await addTransaction({
        description: form.description,
        amount: parseFloat(form.amount),
        category: form.category,
        date: form.date,
        isManual: true,
      });
      setForm(EMPTY_FORM);
      setShowModal(false);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fill />;

  return (
    <div>
      <Header>
        <Title>Transactions</Title>
        <Button onClick={() => setShowModal(true)} size="sm">
          <Plus size={14} /> Add Transaction
        </Button>
      </Header>

      <FilterBar>
        <SearchWrap>
          <SearchIcon size={14} />
          <SearchInput
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchWrap>
        <Select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </FilterBar>

      <Count>{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</Count>

      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th>Description</Th>
              <Th>Category</Th>
              <Th>Date</Th>
              <Th>Amount</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <Empty>No transactions found</Empty>
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const { icon: Icon, bg, color } = getCatStyle(tx.category);
                const isPositive = tx.amount > 0;
                return (
                  <Tr key={tx._id}>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CategoryIcon $bg={bg} $color={color}>
                          <Icon size={14} strokeWidth={1.8} />
                        </CategoryIcon>
                        <div>
                          <TxName>{tx.description}</TxName>
                          {tx.isManual && <><br /><ManualBadge>manual</ManualBadge></>}
                        </div>
                      </div>
                    </Td>
                    <Td><CategoryBadge>{tx.category}</CategoryBadge></Td>
                    <Td>{formatDate(tx.date)}</Td>
                    <Td>
                      <AmountCell $positive={isPositive}>
                        {isPositive ? '+' : ''}{formatCurrency(tx.amount, !isPositive)}
                      </AmountCell>
                    </Td>
                    <Td>
                      {tx.isManual && (
                        <ActionBtn onClick={() => removeTransaction(tx._id)} title="Delete">
                          <Trash2 size={14} />
                        </ActionBtn>
                      )}
                    </Td>
                  </Tr>
                );
              })
            )}
          </tbody>
        </Table>
      </TableWrap>

      {showModal && (
        <Overlay onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <Modal>
            <ModalHeader>
              <ModalTitle>Add Transaction</ModalTitle>
              <CloseBtn onClick={() => setShowModal(false)}><X size={14} /></CloseBtn>
            </ModalHeader>
            <form onSubmit={handleAdd}>
              <FormGrid>
                <Input
                  label="Description"
                  placeholder="e.g. Tesco, Uber…"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  required
                />
                <Input
                  label="Amount (negative = expense)"
                  type="number"
                  step="0.01"
                  placeholder="e.g. -15.00 or 500.00"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  required
                />
                <div>
                  <div style={{ fontSize: '12px', color: '#A1A1AA', marginBottom: '6px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</div>
                  <StyledSelect
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </StyledSelect>
                </div>
                <Input
                  label="Date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
                <Button type="submit" disabled={saving} fullWidth>
                  <Check size={14} /> {saving ? 'Saving…' : 'Add Transaction'}
                </Button>
              </FormGrid>
            </form>
          </Modal>
        </Overlay>
      )}
    </div>
  );
}
