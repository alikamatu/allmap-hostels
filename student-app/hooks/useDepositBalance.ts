import { useState, useEffect } from 'react';
import { depositService, DepositBalance } from '../service/depositService';

export function useDepositBalance() {
  const [balance, setBalance] = useState<DepositBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const balanceData = await depositService.getDepositBalance();
      setBalance(balanceData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const refreshBalance = () => {
    fetchBalance();
  };

  return {
    balance,
    loading,
    error,
    refreshBalance,
  };
}