import { useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Clipboard from "@react-native-clipboard/clipboard";
import { AuthContext } from "../store/auth-context";
import { fetchOrderByNumber, fetchUserOrders } from "../util/ordersApi";
import { useToast } from "../components/UI/ToastProvider";

export function useOrderTracking() {
  const { userId, isAuthenticated } = useContext(AuthContext);
  const { showToast } = useToast();

  // Form state
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Order tracking state
  const [order, setOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Recent orders for authenticated users
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingRecentOrders, setLoadingRecentOrders] = useState(false);
  const [recentOrdersExpanded, setRecentOrdersExpanded] = useState(false);

  // Saved form data
  const [savedEmails, setSavedEmails] = useState([]);

  // Copy functionality
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(null);

  // Load saved data and recent orders on component mount
  useEffect(() => {
    loadSavedData();
    if (isAuthenticated && userId) {
      loadRecentOrders();
    }
  }, [isAuthenticated, userId]);

  async function loadSavedData() {
    try {
      const saved = await AsyncStorage.getItem("trackOrderEmails");
      if (saved) {
        setSavedEmails(JSON.parse(saved));
      }
    } catch (error) {
      console.log("Error loading saved data:", error);
    }
  }

  async function loadRecentOrders() {
    if (!userId) return;

    setLoadingRecentOrders(true);
    try {
      const orders = await fetchUserOrders(userId);
      // Get last 3 orders, sorted by creation date
      const sortedOrders = orders.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB - dateA;
      });
      setRecentOrders(sortedOrders.slice(0, 3));
    } catch (error) {
      console.log("Error loading recent orders:", error);
    }
    setLoadingRecentOrders(false);
  }

  async function saveEmail(email) {
    try {
      const updated = [email, ...savedEmails.filter((e) => e !== email)].slice(
        0,
        3
      );
      setSavedEmails(updated);
      await AsyncStorage.setItem("trackOrderEmails", JSON.stringify(updated));
    } catch (error) {
      console.log("Error saving email:", error);
    }
  }

  async function trackOrder() {
    if (!orderNumber.trim() || !email.trim()) {
      showToast("Please enter both order number and email", "warning");
      return false;
    }

    setLoading(true);
    try {
      const found = await fetchOrderByNumber(orderNumber.trim(), email.trim());
      if (!found) {
        showToast("Order not found. Please check your details.", "error");
        return false;
      }

      // Save email for future use
      await saveEmail(email.trim());

      setOrder(found);
      setShowDetails(true);
      showToast("Order found!", "success");
      return true;
    } catch (error) {
      showToast("Something went wrong. Please try again.", "error");
      return false;
    } finally {
      setLoading(false);
    }
  }

  function selectRecentOrder(recentOrder) {
    setOrder(recentOrder);
    setShowDetails(true);
  }

  function quickFillEmail(emailToFill) {
    setEmail(emailToFill);
  }

  async function handleCopyOrderNumber(orderNumber) {
    try {
      await Clipboard.setString(orderNumber);
      setCopiedOrderNumber(orderNumber);
      showToast("Order number copied!", "success");
      setTimeout(() => setCopiedOrderNumber(null), 2000);
    } catch (error) {
      showToast("Failed to copy order number", "error");
      console.error("Error copying order number:", error);
    }
  }

  function toggleRecentOrders() {
    setRecentOrdersExpanded(!recentOrdersExpanded);
  }

  function clearForm() {
    setOrderNumber("");
    setEmail("");
  }

  function closeOrderDetails() {
    setShowDetails(false);
  }

  function refreshRecentOrders() {
    if (isAuthenticated && userId) {
      loadRecentOrders();
    }
  }

  return {
    // Form state
    orderNumber,
    setOrderNumber,
    email,
    setEmail,
    loading,

    // Order state
    order,
    showDetails,

    // Recent orders
    recentOrders,
    loadingRecentOrders,
    recentOrdersExpanded,

    // Saved data
    savedEmails,

    // Copy functionality
    copiedOrderNumber,

    // Actions
    trackOrder,
    selectRecentOrder,
    quickFillEmail,
    handleCopyOrderNumber,
    toggleRecentOrders,
    clearForm,
    closeOrderDetails,
    refreshRecentOrders,

    // Auth state
    isAuthenticated,
  };
}
