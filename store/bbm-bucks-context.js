import React, { createContext, useState, useContext, useEffect } from "react";
import BBMBucksService from "../util/bbmBucksService";
import { AuthContext } from "./auth-context";

export const BBMBucksContext = createContext({
  balance: null,
  loading: false,
  error: null,
  transactions: [],
  refreshBalance: () => {},
  redeemBBMBucks: () => {},
  getTransactionHistory: () => {},
  canRedeem: false,
  maxRedeemable: 0,
});

function BBMBucksContextProvider({ children }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const { userId, isAuthenticated } = useContext(AuthContext);

  // Auto-refresh balance when user logs in
  useEffect(() => {
    if (isAuthenticated && userId) {
      refreshBalance();
    } else {
      // Clear data when user logs out
      setBalance(null);
      setTransactions([]);
      setError(null);
    }
  }, [isAuthenticated, userId]);

  const refreshBalance = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const userBalance = await BBMBucksService.getUserBalance(userId);
      setBalance(userBalance);
    } catch (err) {
      console.error("Error refreshing BBM Bucks balance:", err);
      setError("Failed to load BBM Bucks balance");
    } finally {
      setLoading(false);
    }
  };

  const redeemBBMBucks = async (amount, orderId) => {
    if (!userId) throw new Error("User not authenticated");

    setLoading(true);
    setError(null);

    try {
      const discountValue = await BBMBucksService.redeemBBMBucks(
        userId,
        amount,
        orderId
      );

      // Refresh balance after redemption
      await refreshBalance();

      return discountValue;
    } catch (err) {
      console.error("Error redeeming BBM Bucks:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTransactionHistory = async (limit = 10) => {
    if (!userId) return;

    try {
      const history = await BBMBucksService.getTransactionHistory(
        userId,
        limit
      );
      setTransactions(history);
      return history;
    } catch (err) {
      console.error("Error fetching transaction history:", err);
      setError("Failed to load transaction history");
      return [];
    }
  };

  const awardBBMBucks = async (orderId, orderAmount, categories = []) => {
    if (!userId) return null;

    try {
      const reward = await BBMBucksService.awardBBMBucks(
        userId,
        orderId,
        orderAmount,
        categories
      );

      // Refresh balance after awarding
      await refreshBalance();

      return reward;
    } catch (err) {
      console.error("Error awarding BBM Bucks:", err);
      return null;
    }
  };

  const getMaxRedeemable = (orderAmount) => {
    if (!balance) return 0;
    return BBMBucksService.getMaxRedeemableAmount(
      balance.currentBalance,
      orderAmount
    );
  };

  const canRedeem =
    balance && balance.currentBalance >= BBMBucksService.MINIMUM_REDEMPTION;

  const contextValue = {
    balance,
    loading,
    error,
    transactions,
    refreshBalance,
    redeemBBMBucks,
    getTransactionHistory,
    awardBBMBucks,
    canRedeem,
    getMaxRedeemable,
    minimumRedemption: BBMBucksService.MINIMUM_REDEMPTION,
    conversionRate: BBMBucksService.CONVERSION_RATE,
  };

  return (
    <BBMBucksContext.Provider value={contextValue}>
      {children}
    </BBMBucksContext.Provider>
  );
}

export default BBMBucksContextProvider;
