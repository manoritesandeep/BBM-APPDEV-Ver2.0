import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import Button from "../UI/Button";
import { Colors } from "../../constants/styles";
import { typography, spacing, scaleSize } from "../../constants/responsive";

function GuestOrderModal({
  visible,
  onClose,
  onSubmit,
  guestData,
  onUpdateGuestData,
}) {
  const {
    name,
    email,
    phone,
    address: { line1 = "", line2 = "", city = "", state = "", zip = "" } = {},
    deliveryInstructions = "",
  } = guestData;

  const updateAddress = (field, value) => {
    onUpdateGuestData({
      ...guestData,
      address: {
        ...guestData.address,
        [field]: value,
      },
    });
  };

  const updateDeliveryInstructions = (value) => {
    onUpdateGuestData({
      ...guestData,
      deliveryInstructions: value,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Enter Delivery Details</Text>

            {/* Contact Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <TextInput
                placeholder="Full Name"
                value={name}
                onChangeText={(text) =>
                  onUpdateGuestData({ ...guestData, name: text })
                }
                style={styles.input}
              />
              <TextInput
                placeholder="Email Address"
                value={email}
                onChangeText={(text) =>
                  onUpdateGuestData({ ...guestData, email: text })
                }
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                placeholder="Phone Number"
                value={phone}
                onChangeText={(text) =>
                  onUpdateGuestData({ ...guestData, phone: text })
                }
                style={styles.input}
                keyboardType="phone-pad"
              />
            </View>

            {/* Delivery Address Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              <TextInput
                placeholder="Street Address Line 1"
                value={line1}
                onChangeText={(text) => updateAddress("line1", text)}
                style={styles.input}
              />
              <TextInput
                placeholder="Street Address Line 2 (Optional)"
                value={line2}
                onChangeText={(text) => updateAddress("line2", text)}
                style={styles.input}
              />
              <View style={styles.addressRow}>
                <TextInput
                  placeholder="City"
                  value={city}
                  onChangeText={(text) => updateAddress("city", text)}
                  style={[styles.input, styles.addressRowInput]}
                />
                <TextInput
                  placeholder="State"
                  value={state}
                  onChangeText={(text) => updateAddress("state", text)}
                  style={[styles.input, styles.addressRowInput]}
                />
              </View>
              <TextInput
                placeholder="ZIP/Postal Code"
                value={zip}
                onChangeText={(text) => updateAddress("zip", text)}
                style={styles.input}
                keyboardType="numeric"
              />
            </View>

            {/* Delivery Instructions Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Instructions</Text>
              <TextInput
                placeholder="Special delivery instructions (Optional)&#10;e.g., Leave at door, Ring bell, etc."
                value={deliveryInstructions}
                onChangeText={updateDeliveryInstructions}
                style={[styles.input, styles.deliveryInstructionsInput]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <Button
              onPress={onSubmit}
              style={styles.modalButton}
              textStyle={styles.modalButtonText}
            >
              Place Order
            </Button>
            <Button
              onPress={onClose}
              mode="outlined"
              style={styles.modalButton}
            >
              Cancel
            </Button>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default GuestOrderModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(12),
    padding: spacing.xl,
    width: "95%",
    maxWidth: scaleSize(450),
    maxHeight: "90%",
  },
  modalTitle: {
    ...typography.heading,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.subheading,
    fontWeight: "600",
    color: Colors.primary600,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: scaleSize(8),
    padding: spacing.md,
    marginVertical: spacing.xs,
    ...typography.body,
    backgroundColor: Colors.white,
  },
  addressRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  addressRowInput: {
    flex: 1,
  },
  deliveryInstructionsInput: {
    height: scaleSize(80),
    paddingTop: spacing.md,
  },
  modalButton: {
    marginVertical: spacing.xs,
  },
  modalButtonText: {
    color: Colors.gray900,
    fontWeight: "600",
  },
});
