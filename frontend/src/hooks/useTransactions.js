import { useState, useEffect, useCallback } from 'react';
import { transactionAPI } from '../services/api';
import { toast } from 'react-toastify';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await transactionAPI.getAll();
      const txData =
      Array.isArray(data.data) ? data.data :
      Array.isArray(data.data?.transactions) ? data.data.transactions :
      Array.isArray(data.transactions) ? data.transactions :
      [];
      setTransactions(txData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (txData) => {
    const { data } = await transactionAPI.create(txData);
    setTransactions((prev) => [data.data.transaction, ...prev]);
    toast.success('Transaction added');
    return data.data;
  };

  const removeTransaction = async (id) => {
    await transactionAPI.delete(id);
    setTransactions((prev) => prev.filter((tx) => tx._id !== id));
    toast.success('Transaction deleted');
  };

  const updateTransaction = async (id, txData) => {
    const { data } = await transactionAPI.update(id, txData);
    setTransactions((prev) =>
      prev.map((tx) => (tx._id === id ? data.data : tx))
    );
    toast.success('Transaction updated');
    return data.data;
  };

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    addTransaction,
    removeTransaction,
    updateTransaction,
  };
};
