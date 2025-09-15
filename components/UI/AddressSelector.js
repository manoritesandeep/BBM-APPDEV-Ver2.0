import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";
import { AddressContext } from "../../store/address-context";
import Button from "../UI/Button";
import OutlinedButton from "../UI/OutlinedButton";
import { useToast } from "../UI/ToastProvider";
import { useTheme } from "../../store/theme-context";

function AddressSelector({
  selectedAddress,
  onAddressSelect,
  visible,
  onClose,
}) {
  const { colors } = useTheme();
  const addressCtx = useContext(AddressContext);
  const { showToast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    label: "Home", // Default label
  });

  const handleAddAddress = async () => {
    if (
      !newAddress.name ||
      !newAddress.line1 ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.zip
    ) {
      showToast("Please fill all required fields", "error");
      return;
    }

    try {
      await addressCtx.addAddress(newAddress);
      setShowAddForm(false);
      setNewAddress({
        name: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        zip: "",
        label: "Home",
      });
      showToast("Address added successfully!", "success");
    } catch (error) {
      showToast("Failed to add address", "error");
    }
  };

  const formatAddress = (address) => {
    return `${address.line1}${address.line2 ? ", " + address.line2 : ""}, ${
      address.city
    }, ${address.state} ${address.zip}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      statusBarTranslucent={false}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Delivery Address</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.gray700} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Existing Addresses */}
          {addressCtx.addresses.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Your Addresses</Text>
              {addressCtx.addresses.map((address) => (
                <Pressable
                  key={address.id}
                  style={[
                    styles.addressCard,
                    selectedAddress?.id === address.id && styles.selectedCard,
                  ]}
                  onPress={() => {
                    onAddressSelect(address);
                    onClose();
                  }}
                >
                  <View style={styles.addressHeader}>
                    <Text style={styles.addressLabel}>{address.label}</Text>
                    {selectedAddress?.id === address.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={Colors.primary500}
                      />
                    )}
                  </View>
                  <Text style={styles.addressName}>{address.name}</Text>
                  <Text style={styles.addressText}>
                    {formatAddress(address)}
                  </Text>
                </Pressable>
              ))}
            </>
          )}

          {/* Add New Address Section */}
          {!showAddForm ? (
            <Pressable
              style={styles.addAddressButton}
              onPress={() => setShowAddForm(true)}
            >
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={Colors.primary500}
              />
              <Text style={styles.addAddressText}>Add New Address</Text>
            </Pressable>
          ) : (
            <View style={styles.addForm}>
              <Text style={styles.sectionTitle}>Add New Address</Text>

              <TextInput
                placeholder="Address Label (Home, Office, etc.)"
                value={newAddress.label}
                onChangeText={(text) =>
                  setNewAddress((prev) => ({ ...prev, label: text }))
                }
                style={styles.input}
                placeholderTextColor={colors.textSecondary}
              />

              <TextInput
                placeholder="Full Name *"
                value={newAddress.name}
                onChangeText={(text) =>
                  setNewAddress((prev) => ({ ...prev, name: text }))
                }
                style={styles.input}
                placeholderTextColor={colors.textSecondary}
              />

              <TextInput
                placeholder="Address Line 1 *"
                value={newAddress.line1}
                onChangeText={(text) =>
                  setNewAddress((prev) => ({ ...prev, line1: text }))
                }
                style={styles.input}
                multiline
                placeholderTextColor={colors.textSecondary}
              />

              <TextInput
                placeholder="Address Line 2 (Optional)"
                value={newAddress.line2}
                onChangeText={(text) =>
                  setNewAddress((prev) => ({ ...prev, line2: text }))
                }
                style={styles.input}
                placeholderTextColor={colors.textSecondary}
              />

              <View style={styles.row}>
                <TextInput
                  placeholder="City *"
                  value={newAddress.city}
                  onChangeText={(text) =>
                    setNewAddress((prev) => ({ ...prev, city: text }))
                  }
                  style={[styles.input, styles.halfInput]}
                  placeholderTextColor={colors.textSecondary}
                />
                <TextInput
                  placeholder="State *"
                  value={newAddress.state}
                  onChangeText={(text) =>
                    setNewAddress((prev) => ({ ...prev, state: text }))
                  }
                  style={[styles.input, styles.halfInput]}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <TextInput
                placeholder="PIN Code *"
                value={newAddress.zip}
                onChangeText={(text) =>
                  setNewAddress((prev) => ({ ...prev, zip: text }))
                }
                style={styles.input}
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />

              <View style={styles.buttonRow}>
                <OutlinedButton onPress={() => setShowAddForm(false)}>
                  Cancel
                </OutlinedButton>
                <Button mode="filled" onPress={handleAddAddress}>
                  Add Address
                </Button>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary700,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.primary50,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary700,
    marginBottom: 12,
    marginTop: 8,
  },
  addressCard: {
    backgroundColor: Colors.primary50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCard: {
    borderColor: Colors.primary500,
    backgroundColor: Colors.primary100,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary500,
    textTransform: "uppercase",
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary700,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: Colors.gray600,
    lineHeight: 20,
  },
  addAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: Colors.primary50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary200,
    borderStyle: "dashed",
    marginTop: 8,
  },
  addAddressText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.primary500,
    fontWeight: "600",
  },
  addForm: {
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
});

export default AddressSelector;
