import { useContext, useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AddressContext } from "../../store/address-context";
import { Colors } from "../../constants/styles";
import AddressesModal from "../UserComponents/Address/AddressesModal";
import { useI18n } from "../../store/i18n-context";

function DeliveryAddressSection() {
  const { t } = useI18n();
  const { addresses, defaultAddressId } = useContext(AddressContext);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);

  const defaultAddress = addresses?.find(
    (addr) => addr.id === defaultAddressId
  );

  function handleAddressPress() {
    setIsAddressModalVisible(true);
  }

  function handleModalClose() {
    setIsAddressModalVisible(false);
  }

  if (!defaultAddress) {
    return <View style={styles.hiddenContainer} />;
  }

  return (
    <>
      <Pressable
        style={styles.deliverySection}
        onPress={handleAddressPress}
        android_ripple={{ color: "#E3F2FD" }}
      >
        <View style={styles.deliveryContent}>
          <View style={styles.deliveryHeader}>
            <Ionicons name="location" size={16} color="#C20F0F" />
            <Text style={styles.deliveryText}>
              {t("search.deliveringTo")} - ({defaultAddress.label}) -{" "}
              {defaultAddress.city} {defaultAddress.zipCode}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color="#757575" />
        </View>
      </Pressable>

      <AddressesModal
        visible={isAddressModalVisible}
        onClose={handleModalClose}
      />
    </>
  );
}

export default DeliveryAddressSection;

const styles = StyleSheet.create({
  hiddenContainer: {
    height: 0,
    width: 0,
  },
  deliverySection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: -2,
    marginTop: -2,
    marginBottom: 4,
    borderRadius: 0,
    // Platform-specific shadows
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  deliveryContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 6,
    minHeight: 32, // Ensure minimum touch target
  },
  deliveryHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  deliveryText: {
    fontSize: 14,
    color: "#4F4F4F",
    marginLeft: 8,
    fontWeight: "500",
    flex: 1,
  },
});
