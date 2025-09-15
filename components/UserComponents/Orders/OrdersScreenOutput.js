import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import { View, StyleSheet } from "react-native";
import OrderList from "./OrderList";
import { AuthContext } from "../../../store/auth-context";
import { fetchUserOrders } from "../../../util/ordersApi";
import { Colors } from "../../../constants/styles";

function OrdersScreenOutput({ navigation, route }) {
  const { userId, isAuthenticated } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const lastRefreshTimeRef = useRef(0);

  const loadOrders = useCallback(
    async (forceRefresh = false) => {
      if (!isAuthenticated || !userId) {
        setOrders([]);
        return;
      }

      // Prevent excessive calls - only refresh if more than 30 seconds since last refresh
      const now = Date.now();
      if (!forceRefresh && now - lastRefreshTimeRef.current < 30000) {
        // console.log("OrdersScreenOutput - Skipping refresh, too recent");
        return;
      }

      setLoading(true);
      try {
        const data = await fetchUserOrders(userId);
        setOrders(data);
        lastRefreshTimeRef.current = now;
        // console.log("OrdersScreenOutput - Orders refreshed successfully");
      } catch (error) {
        console.log("OrdersScreenOutput - error loading orders:", error);
        setOrders([]);
      }
      setLoading(false);
    },
    [isAuthenticated, userId]
  );

  // Load orders only on initial mount and when auth state changes
  useEffect(() => {
    loadOrders(true); // Force refresh on mount
  }, [loadOrders]);

  // Only refresh when explicitly requested via navigation params
  useEffect(() => {
    if (route?.params?.refresh) {
      // console.log("OrdersScreenOutput - Refreshing orders due to navigation param");
      loadOrders(true); // Force refresh when explicitly requested
    }
  }, [route?.params?.refresh, loadOrders]);

  function handleOrderPress(order) {
    navigation.navigate("OrderDetailsScreen", { order });
  }

  return (
    <View style={styles.container}>
      <OrderList
        orders={orders}
        loading={loading}
        onReload={() => loadOrders(true)} // Force refresh on manual pull-to-refresh
        onOrderPress={handleOrderPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary100,
    padding: 16,
  },
});

export default OrdersScreenOutput;
