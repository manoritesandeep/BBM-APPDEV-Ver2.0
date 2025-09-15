import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
  increment,
} from "@react-native-firebase/firestore";
import { db } from "./firebaseConfig";

class BBMBucksService {
  // Reward tiers configuration
  static REWARD_TIERS = {
    STANDARD: {
      minAmount: 0,
      maxAmount: 24999,
      percentage: 1.0,
      name: "Standard",
    },
    PREMIUM: {
      minAmount: 25000,
      maxAmount: 49999,
      percentage: 1.5,
      name: "Premium",
    },
    ELITE: {
      minAmount: 50000,
      maxAmount: Infinity,
      percentage: 2.0,
      name: "Elite",
    },
  };

  // Business rules
  static MINIMUM_REDEMPTION = 50; // 50 BBM Bucks = ₹0.50
  static EXPIRY_MONTHS = 12;
  static CONVERSION_RATE = 100; // 100 BBM Bucks = ₹1

  // Excluded categories (can be expanded)
  static EXCLUDED_CATEGORIES = [
    "gift-cards",
    "warranties",
    "installation-services",
  ];

  /**
   * Generate unique transaction ID
   * @returns {string} Unique transaction ID
   */
  static generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `txn_${timestamp}_${random}`;
  }

  /**
   * Calculate reward based on order amount
   * @param {number} orderAmount - Order amount in rupees
   * @param {string[]} categories - Array of product categories in order
   * @returns {object} Reward calculation details
   */
  static calculateReward(orderAmount, categories = []) {
    // Ensure categories is an array
    if (!Array.isArray(categories)) {
      console.warn("Categories parameter is not an array:", categories);
      categories = [];
    }

    // Check if order contains excluded categories
    const hasExcludedCategory = categories.some((category) =>
      this.EXCLUDED_CATEGORIES.includes(category.toLowerCase())
    );

    if (hasExcludedCategory) {
      return {
        bbmBucks: 0,
        percentage: 0,
        discountValue: 0,
        tier: "EXCLUDED",
        reason: "Order contains excluded categories",
      };
    }

    // Find appropriate tier
    const tier = Object.values(this.REWARD_TIERS).find(
      (tier) => orderAmount >= tier.minAmount && orderAmount <= tier.maxAmount
    );

    // Calculate the reward amount in rupees first, then convert to BBM Bucks
    const rewardAmountInRupees = orderAmount * (tier.percentage / 100);
    const rewardAmount = Math.floor(
      rewardAmountInRupees * this.CONVERSION_RATE
    );

    const result = {
      bbmBucks: rewardAmount,
      percentage: tier.percentage,
      discountValue: rewardAmount / this.CONVERSION_RATE,
      tier: tier.name,
      conversionRate: this.CONVERSION_RATE,
    };

    return result;
  }

  /**
   * Award BBM Bucks to user after successful order
   * @param {string} userId - User ID
   * @param {string} orderId - Order ID
   * @param {number} orderAmount - Order amount
   * @param {string[]} categories - Product categories
   * @returns {object} Reward details
   */
  static async awardBBMBucks(userId, orderId, orderAmount, categories = []) {
    try {
      const reward = this.calculateReward(orderAmount, categories);

      if (reward.bbmBucks === 0) {
        console.log(
          `No BBM Bucks awarded for order ${orderId}: ${
            reward.reason || "Order amount too low"
          }`
        );
        return reward;
      }

      const batch = writeBatch(db);
      const now = new Date();
      const expiryDate = new Date(
        now.getTime() + this.EXPIRY_MONTHS * 30 * 24 * 60 * 60 * 1000
      );

      // Add transaction record - Create unique transaction document for each order
      const transactionRef = doc(collection(db, "bbm_bucks_transactions"));
      const transactionData = {
        transactionId: this.generateTransactionId(),
        userId,
        orderId,
        type: "EARNED",
        amount: reward.bbmBucks,
        orderValue: orderAmount,
        rewardPercentage: reward.percentage,
        tier: reward.tier,
        description: `Earned ${reward.bbmBucks} BBM Bucks from order #${orderId}`,
        createdAt: serverTimestamp(),
        expiryDate: expiryDate,
        status: "ACTIVE",
        categories: categories,
      };

      // console.log("🔍 DEBUG: Creating new transaction with unique ID:", transactionRef.id);
      // console.log("🔍 DEBUG: Transaction data:", JSON.stringify(transactionData, null, 2));

      batch.set(transactionRef, transactionData);

      // Update or create user balance
      const balanceRef = doc(db, "user_bbm_balance", userId);
      // console.log("🔍 DEBUG: Balance document path: user_bbm_balance/" + userId);

      const balanceDoc = await getDoc(balanceRef);
      // console.log("🔍 DEBUG: Balance document exists:", balanceDoc.exists());

      if (balanceDoc.exists()) {
        // Update existing balance
        const updateData = {
          totalEarned: increment(reward.bbmBucks),
          currentBalance: increment(reward.bbmBucks),
          lifetimeBalance: increment(reward.bbmBucks),
          lastUpdated: serverTimestamp(),
          lastEarnedAmount: reward.bbmBucks,
          lastEarnedDate: serverTimestamp(),
        };

        // console.log("🔍 DEBUG: Updating existing balance with:", JSON.stringify(updateData, null, 2));
        batch.update(balanceRef, updateData);
      } else {
        // Create new balance record
        const newBalanceData = {
          userId,
          totalEarned: reward.bbmBucks,
          totalRedeemed: 0,
          currentBalance: reward.bbmBucks,
          lifetimeBalance: reward.bbmBucks,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
          lastEarnedAmount: reward.bbmBucks,
          lastEarnedDate: serverTimestamp(),
          tier: "STANDARD", // Single string value, not array
        };

        // console.log("🔍 DEBUG: Creating new balance record with:", JSON.stringify(newBalanceData, null, 2));
        batch.set(balanceRef, newBalanceData);
      }

      // console.log("🔍 DEBUG: Committing batch write...");
      await batch.commit();
      // console.log("🔍 DEBUG: Batch write completed successfully");

      console.log(
        `✅ Awarded ${reward.bbmBucks} BBM Bucks to user ${userId} for order ${orderId}`
      );
      return reward;
    } catch (error) {
      console.error("Error awarding BBM Bucks:", error);
      throw new Error("Failed to award BBM Bucks");
    }
  }

  /**
   * Redeem BBM Bucks for discount
   * @param {string} userId - User ID
   * @param {number} redeemAmount - BBM Bucks to redeem
   * @param {string} orderId - Order ID
   * @returns {number} Discount value in rupees
   */
  static async redeemBBMBucks(userId, redeemAmount, orderId) {
    try {
      // Validate minimum redemption
      if (redeemAmount < this.MINIMUM_REDEMPTION) {
        throw new Error(
          `Minimum redemption is ${this.MINIMUM_REDEMPTION} BBM Bucks (₹${
            this.MINIMUM_REDEMPTION / this.CONVERSION_RATE
          })`
        );
      }

      const userBalance = await this.getUserBalance(userId);

      if (!userBalance || userBalance.currentBalance < redeemAmount) {
        throw new Error("Insufficient BBM Bucks balance");
      }

      const batch = writeBatch(db);
      const discountValue = redeemAmount / this.CONVERSION_RATE;

      // Add redemption transaction
      const transactionRef = doc(collection(db, "bbm_bucks_transactions"));
      batch.set(transactionRef, {
        transactionId: this.generateTransactionId(),
        userId,
        orderId,
        type: "REDEEMED",
        amount: -redeemAmount,
        discountValue: discountValue,
        description: `Redeemed ${redeemAmount} BBM Bucks for ₹${discountValue.toFixed(
          2
        )} discount on order #${orderId}`,
        createdAt: serverTimestamp(),
        status: "USED",
      });

      // Update balance
      const balanceRef = doc(db, "user_bbm_balance", userId);
      batch.update(balanceRef, {
        totalRedeemed: increment(redeemAmount),
        currentBalance: increment(-redeemAmount),
        lastUpdated: serverTimestamp(),
        lastRedeemedAmount: redeemAmount,
        lastRedeemedDate: serverTimestamp(),
      });

      await batch.commit();

      console.log(
        `✅ Redeemed ${redeemAmount} BBM Bucks (₹${discountValue}) for user ${userId}`
      );
      return discountValue;
    } catch (error) {
      console.error("Error redeeming BBM Bucks:", error);
      throw error;
    }
  }

  /**
   * Get user's BBM Bucks balance
   * @param {string} userId - User ID
   * @returns {object|null} User balance data
   */
  static async getUserBalance(userId) {
    try {
      // console.log("🔍 DEBUG: Fetching user balance for userId:", userId);

      const balanceRef = doc(db, "user_bbm_balance", userId);
      const balanceDoc = await getDoc(balanceRef);

      // console.log("🔍 DEBUG: Balance document exists:", balanceDoc.exists());

      if (balanceDoc.exists()) {
        const data = balanceDoc.data();
        // console.log("🔍 DEBUG: Balance document data:", JSON.stringify(data, null, 2));

        // Fix tier field if it's an array
        const fixedData = {
          ...data,
          tier: Array.isArray(data.tier) ? data.tier[0] : data.tier,
          discountValue: (data.currentBalance / this.CONVERSION_RATE).toFixed(
            2
          ),
        };

        return fixedData;
      } else {
        // console.log("🔍 DEBUG: No balance document found for user:", userId);
        return {
          currentBalance: 0,
          totalEarned: 0,
          totalRedeemed: 0,
          lifetimeBalance: 0,
          discountValue: "0.00",
        };
      }
    } catch (error) {
      console.error("Error fetching user balance:", error);
      return null;
    }
  }

  /**
   * Get user's transaction history
   * @param {string} userId - User ID
   * @param {number} limitCount - Number of transactions to fetch
   * @returns {array} Transaction history
   */
  static async getTransactionHistory(userId, limitCount = 10) {
    try {
      // console.log("🔍 DEBUG: Fetching transaction history for userId:", userId);
      // console.log("🔍 DEBUG: Limit count:", limitCount);

      const transactionsRef = collection(db, "bbm_bucks_transactions");
      // console.log("🔍 DEBUG: Collection reference created for bbm_bucks_transactions");

      // Query transactions by userId (each transaction has unique document ID)
      try {
        const q = query(
          transactionsRef,
          where("userId", "==", userId),
          orderBy("createdAt", "desc"),
          limit(limitCount)
        );

        // console.log("🔍 DEBUG: Executing compound query with orderBy");
        const querySnapshot = await getDocs(q);
        // console.log("🔍 DEBUG: Query successful, found", querySnapshot.docs.length, "documents");

        const transactions = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // console.log("🔍 DEBUG: Transaction data:", JSON.stringify(transactions, null, 2));
        return transactions;
      } catch (indexError) {
        console.warn(
          "Compound index not available, using simple query:",
          indexError.message
        );

        // Fallback: Simple query without orderBy
        const simpleQuery = query(
          transactionsRef,
          where("userId", "==", userId),
          limit(limitCount)
        );

        // console.log("🔍 DEBUG: Executing simple query without orderBy");
        const querySnapshot = await getDocs(simpleQuery);
        // console.log("🔍 DEBUG: Simple query successful, found", querySnapshot.docs.length, "documents");

        const transactions = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // console.log("🔍 DEBUG: Transaction data (simple query):", JSON.stringify(transactions, null, 2));

        // Sort manually on client side
        return transactions.sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return bDate - aDate;
        });
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      return [];
    }
  }

  /**
   * Get expiring BBM Bucks (for marketing/notifications)
   * @param {string} userId - User ID
   * @param {number} daysUntilExpiry - Days before expiry to check
   * @returns {array} Expiring transactions
   */
  static async getExpiringBBMBucks(userId, daysUntilExpiry = 30) {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry);

      const transactionsRef = collection(db, "bbm_bucks_transactions");
      const q = query(
        transactionsRef,
        where("userId", "==", userId),
        where("type", "==", "EARNED"),
        where("status", "==", "ACTIVE"),
        where("expiryDate", "<=", expiryDate),
        orderBy("expiryDate", "asc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching expiring BBM Bucks:", error);
      return [];
    }
  }

  /**
   * Expire old BBM Bucks (admin function)
   * @param {string} userId - User ID (optional, if not provided expires for all users)
   */
  static async expireOldBBMBucks(userId = null) {
    try {
      const now = new Date();
      const transactionsRef = collection(db, "bbm_bucks_transactions");

      let q = query(
        transactionsRef,
        where("type", "==", "EARNED"),
        where("status", "==", "ACTIVE"),
        where("expiryDate", "<=", now)
      );

      if (userId) {
        q = query(q, where("userId", "==", userId));
      }

      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      let totalExpired = 0;

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        totalExpired += data.amount;

        // Mark transaction as expired
        batch.update(doc.ref, {
          status: "EXPIRED",
          expiredAt: serverTimestamp(),
        });

        // Update user balance
        const balanceRef = doc(db, "user_bbm_balance", data.userId);
        batch.update(balanceRef, {
          currentBalance: increment(-data.amount),
          lastUpdated: serverTimestamp(),
        });
      });

      if (querySnapshot.docs.length > 0) {
        await batch.commit();
        console.log(
          `✅ Expired ${totalExpired} BBM Bucks from ${querySnapshot.docs.length} transactions`
        );
      }

      return { expiredTransactions: querySnapshot.docs.length, totalExpired };
    } catch (error) {
      console.error("Error expiring BBM Bucks:", error);
      throw error;
    }
  }

  /**
   * Validate if BBM Bucks can be used for this order
   * @param {number} orderAmount - Order amount
   * @param {string[]} categories - Product categories
   * @returns {boolean} Can use BBM Bucks
   */
  static canUseBBMBucks(orderAmount, categories = []) {
    const hasExcludedCategory = categories.some((category) =>
      this.EXCLUDED_CATEGORIES.includes(category.toLowerCase())
    );

    return !hasExcludedCategory && orderAmount > 0;
  }

  /**
   * Calculate maximum BBM Bucks that can be redeemed for an order
   * @param {number} currentBalance - User's current BBM Bucks balance
   * @param {number} orderAmount - Order amount
   * @returns {number} Maximum redeemable amount
   */
  static getMaxRedeemableAmount(currentBalance, orderAmount) {
    // Limit redemption to 50% of order value or current balance, whichever is lower
    const maxFromOrder = Math.floor(orderAmount * 0.5 * this.CONVERSION_RATE);
    const maxFromBalance =
      Math.floor(currentBalance / this.MINIMUM_REDEMPTION) *
      this.MINIMUM_REDEMPTION;

    return Math.min(maxFromOrder, maxFromBalance, currentBalance);
  }

  /**
   * DEBUG: Explore collection structure to understand your setup
   * @param {string} userId - User ID to explore
   */
  static async debugCollectionStructure(userId) {
    // Commented out for production - debug method
    /*
    console.log("🔍 DEBUG: === EXPLORING COLLECTION STRUCTURE ===");

    try {
      // Check user_bbm_balance collection
      console.log("🔍 DEBUG: Checking user_bbm_balance collection...");
      const balanceRef = doc(db, "user_bbm_balance", userId);
      const balanceDoc = await getDoc(balanceRef);

      if (balanceDoc.exists()) {
        console.log("🔍 DEBUG: user_bbm_balance document structure:");
        console.log(JSON.stringify(balanceDoc.data(), null, 2));
      } else {
        console.log("🔍 DEBUG: No user_bbm_balance document found for user:", userId);
      }

      // Check bbm_bucks_transactions collection
      console.log("🔍 DEBUG: Checking bbm_bucks_transactions collection...");

      // Try flat structure first
      const transactionsRef = collection(db, "bbm_bucks_transactions");
      const allTransactionsQuery = query(transactionsRef, limit(5));
      const allTransactionsSnapshot = await getDocs(allTransactionsQuery);

      console.log("🔍 DEBUG: Found", allTransactionsSnapshot.docs.length, "documents in bbm_bucks_transactions");
      allTransactionsSnapshot.docs.forEach((doc, index) => {
        console.log(`🔍 DEBUG: Transaction ${index + 1} (ID: ${doc.id}):`, JSON.stringify(doc.data(), null, 2));
      });

      // Also check if there's a nested structure like bbm_bucks_transaction/userId
      console.log("🔍 DEBUG: Checking for nested structure bbm_bucks_transaction...");
      try {
        const nestedRef = doc(db, "bbm_bucks_transaction", userId);
        const nestedDoc = await getDoc(nestedRef);

        if (nestedDoc.exists()) {
          console.log("🔍 DEBUG: Found nested document at bbm_bucks_transaction/" + userId + ":");
          console.log(JSON.stringify(nestedDoc.data(), null, 2));
        } else {
          console.log("🔍 DEBUG: No nested document found at bbm_bucks_transaction/" + userId);
        }
      } catch (nestedError) {
        console.log("🔍 DEBUG: Error checking nested structure:", nestedError.message);
      }
    } catch (error) {
      console.error("🔍 DEBUG: Error exploring collection structure:", error);
    }

    console.log("🔍 DEBUG: === COLLECTION EXPLORATION COMPLETE ===");
    */
    return null;
  }

  /**
   * Get user's pending redemptions
   * @param {string} userId - User ID
   * @returns {array} Pending redemptions
   */
  static async getPendingRedemptions(userId) {
    try {
      const transactionsRef = collection(db, "bbm_bucks_transactions");

      // Try with compound query first, fallback to simple query if index doesn't exist
      try {
        const q = query(
          transactionsRef,
          where("userId", "==", userId),
          where("type", "==", "redemption"),
          where("status", "==", "pending"),
          where("expiryDate", ">", Timestamp.now())
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (indexError) {
        console.warn(
          "Compound index not available, using simple query:",
          indexError.message
        );

        // Fallback: Simple query and filter client-side
        const simpleQuery = query(
          transactionsRef,
          where("userId", "==", userId)
        );

        const querySnapshot = await getDocs(simpleQuery);
        const allTransactions = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter manually on client side
        const now = new Date();
        return allTransactions.filter(
          (transaction) =>
            transaction.type === "redemption" &&
            transaction.status === "pending" &&
            transaction.expiryDate &&
            (transaction.expiryDate.toDate?.() ||
              new Date(transaction.expiryDate)) > now
        );
      }
    } catch (error) {
      console.error("Error fetching pending redemptions:", error);
      return [];
    }
  }
}

export default BBMBucksService;
