// Order tracking for guests
import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import { fetchOrderByNumber } from "../util/ordersApi";
import OrderDetailsModal from "./UserComponents/Orders/OrderDetailsModal";
import OrderTrackingBar from "./UserComponents/Orders/OrderTrackingBar";
import { Colors } from "../constants/styles";
import { useToast } from "./UI/ToastProvider";
import { useTheme } from "../store/theme-context";

function TrackOrderModal({ visible, onClose }) {
  const { colors } = useTheme();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleTrack() {
    if (!orderNumber || !email) {
      showToast("Please enter both order number and email", "warning");
      return;
    }
    setLoading(true);
    try {
      const found = await fetchOrderByNumber(orderNumber, email);
      if (!found) {
        showToast("Order not found", "error");
        setLoading(false);
        return;
      }
      setOrder(found);
      setShowDetails(true);
    } catch (e) {
      showToast("Something went wrong", "error");
    }
    setLoading(false);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.headerContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>🔎</Text>
            </View>
            <Text style={styles.title}>Track Your Order</Text>
          </View>
          <Text style={styles.subtitle}>
            Enter your order number and email to view your order status.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Order Number"
            value={orderNumber}
            onChangeText={setOrderNumber}
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
            accessibilityLabel="Order Number"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor={colors.textSecondary}
            accessibilityLabel="Email"
            autoCapitalize="none"
          />
          <Pressable
            style={[
              styles.button,
              styles.trackButton,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleTrack}
            disabled={loading}
            accessibilityLabel="Track Order"
          >
            {loading ? (
              <Text style={styles.buttonText}>Tracking...</Text>
            ) : (
              <Text style={styles.buttonText}>Track</Text>
            )}
          </Pressable>
          <Pressable
            style={[styles.button, styles.closeButton]}
            onPress={onClose}
            accessibilityLabel="Close Modal"
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
        <OrderDetailsModal
          visible={showDetails}
          order={order}
          onClose={() => setShowDetails(false)}
          onOrderUpdated={() => {}}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "center",
  },
  iconCircle: {
    backgroundColor: Colors.secondary500,
    borderRadius: 24,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  icon: {
    fontSize: 22,
    color: "#fff",
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    color: Colors.secondary500,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 0,
    backgroundColor: "#f5f5f7",
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  trackButton: {
    backgroundColor: Colors.secondary500,
    shadowColor: Colors.secondary500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  closeButton: {
    backgroundColor: "#e0e0e0",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  closeButtonText: {
    color: Colors.secondary500,
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});

export default TrackOrderModal;
