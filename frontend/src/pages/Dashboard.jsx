import { useContext, useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { Wallet, TrendingDown, TrendingUp, PiggyBank } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { plaidAPI, userAPI } from '../services/api';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency } from '../utils/validators';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatCard from '../components/dashboard/StatCard';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import SpendingChart from '../components/dashboard/SpendingChart';
import MonthlySpending from '../components/dashboard/MonthlySpending';
import BudgetWidget from '../components/dashboard/BudgetWidget';
import HealthScoreWidget from '../components/dashboard/HealthScoreWidget';
import BankCardWidget from '../components/dashboard/BankCardWidget';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 10px;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr 240px;
  grid-template-rows: 350px;
  gap: 10px;
  margin-bottom: 10px;
`;

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 300px;
  gap: 10px;
`;

export default function Dashboard() {
  const { user, dispatch } = useContext(AuthContext);
  const { transactions, loading: txLoading, refetch } = useTransactions();

  const [bankInfo, setBankInfo] = useState(null);
  const [bankConnected, setBankConnected] = useState(false);
  const [bankLoading, setBankLoading] = useState(true);
  const [healthKey, setHealthKey] = useState(0);

  const fetchBankInfo = async () => {
    try {
      setBankLoading(true);
      const { data } = await plaidAPI.getBalance();
      setBankInfo(data.data);
      setBankConnected(true);
    } catch {
      setBankConnected(false);
      setBankInfo(null);
    } finally {
      setBankLoading(false);
    }
  };

  useEffect(() => { fetchBankInfo(); }, []);

  const handleRefresh = () => {
    refetch();
    fetchBankInfo();
    setHealthKey((k) => k + 1);
  };

  const handleUpdateBudget = async (budget) => {
    try {
      await userAPI.updateBudget(user.id, budget);
      dispatch({ type: 'UPDATE_USER', payload: { ...user, budget } });
    } catch (err) {
      console.error('Budget update failed', err);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const cy = now.getFullYear();
    const cm = now.getMonth() + 1;

    const thisMonthTx = transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getFullYear() === cy && d.getMonth() + 1 === cm;
    });

    const spending = thisMonthTx.reduce(
      (s, tx) => (tx.amount < 0 ? s + Math.abs(tx.amount) : s), 0
    );
    const income = thisMonthTx.reduce(
      (s, tx) => (tx.amount > 0 ? s + tx.amount : s), 0
    );

    const balance = bankConnected
      ? bankInfo?.accounts?.[0]?.balances?.available ??
        bankInfo?.accounts?.[0]?.balances?.current ??
        0
      : 0;

    const budget = user?.budget ?? 0;
    const budgetRemaining = budget > 0 ? Math.max(budget - spending, 0) : 0;

    return { spending, income, balance, budget, budgetRemaining };
  }, [transactions, bankInfo, bankConnected, user]);

  if (txLoading && bankLoading) return <LoadingSpinner fill />;

  return (
    <div>
      <StatsGrid>
        <StatCard
          label="Total Balance"
          value={formatCurrency(stats.balance)}
          icon={Wallet}
          iconBg="rgba(220,38,38,0.10)"
          iconColor="#DC2626"
        />
        <StatCard
          label="Monthly Spending"
          value={formatCurrency(stats.spending, true)}
          icon={TrendingDown}
          iconBg="rgba(220,38,38,0.10)"
          iconColor="#DC2626"
        />
        <StatCard
          label="Monthly Income"
          value={formatCurrency(stats.income, true)}
          icon={TrendingUp}
          iconBg="rgba(22,163,74,0.10)"
          iconColor="#16A34A"
        />
        <StatCard
          label="Budget Remaining"
          value={stats.budget > 0 ? formatCurrency(stats.budgetRemaining, true) : '—'}
          icon={PiggyBank}
          iconBg="rgba(37,99,235,0.10)"
          iconColor="#3B82F6"
        />
      </StatsGrid>

      <MainGrid>
        <RecentTransactions transactions={transactions} />
        <SpendingChart transactions={transactions} />
        <MonthlySpending transactions={transactions} />
      </MainGrid>

      <BottomGrid>
        <BudgetWidget
          budget={stats.budget}
          monthlySpending={stats.spending}
          transactions={transactions}
          onUpdateBudget={handleUpdateBudget}
        />
        <HealthScoreWidget refreshKey={healthKey} />
        <BankCardWidget
          bankInfo={bankInfo}
          isConnected={bankConnected}
          onRefresh={handleRefresh}
        />
      </BottomGrid>
    </div>
  );
}
