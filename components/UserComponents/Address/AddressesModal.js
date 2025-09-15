import { useContext, useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AddressForm from "./AddressForm";
import { AddressContext } from "../../../store/address-context";
// import IconButton from "../../UI/IconButton";
import LocationPreview from "./LocationPreview";
import { Colors } from "../../../constants/styles";
// import { SafeAreaWrapper } from "../../UI/SafeAreaWrapper";
import { useToast } from "../../UI/ToastProvider";
import { scaleSize, scaleFont, spacing } from "../../../constants/responsive";
import { useI18n } from "../../../store/i18n-context";
// import { useI18n } from "../../../hooks/useI18n";

function AddressesModal({ visible, onClose }) {
  const { t } = useI18n();
  const {
    addresses,
    defaultAddressId,
    isLoading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refreshAddresses,
  } = useContext(AddressContext);

  const [editingAddress, setEditingAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(
    addresses?.find((a) => a.id === defaultAddressId) || null
  );
  const { showToast } = useToast();

  // useEffect to update selectedAddress when addresses or defaultAddressId change:
  useEffect(() => {
    setSelectedAddress(
      addresses.find((a) => a.id === defaultAddressId) || null
    );
  }, [addresses, defaultAddressId]);

  function handleAdd() {
    setEditingAddress(null);
    setShowForm(true);
  }

  function handleEdit(address) {
    setEditingAddress(address);
    setShowForm(true);
  }

  function handleCancelForm() {
    setEditingAddress(null);
    setShowForm(false);
  }

  async function handleDelete(addressId) {
    try {
      await deleteAddress(addressId);
      showToast(t("address.addressDeleted"), "success");
    } catch (e) {
      showToast(t("address.deleteFailed"), "error");
    }
  }

  async function handleSelect(addressId) {
    try {
      await setDefaultAddress(addressId);
      const addr = addresses.find((a) => a.id === addressId);
      setSelectedAddress(addr);
      showToast(t("address.defaultAddressUpdated"), "success");
    } catch (e) {
      showToast("Failed to set default address", "error");
    }
  }

  async function handleFormSubmit(address) {
    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);
    try {
      if (editingAddress) {
        await updateAddress(address);
        showToast("Address updated successfully", "success");
      } else {
        await addAddress(address);
        showToast("Address added successfully", "success");
      }
      // Reset form state and close modal
      setEditingAddress(null);
      setShowForm(false);
      // Refresh addresses to ensure the new address appears
      await refreshAddresses();
    } catch (e) {
      showToast(t("address.saveFailed"), "error");
      console.error("Address save error:", e);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
      statusBarTranslucent={false}
    >
      {/* <SafeAreaWrapper edges={["bottom"]}> */}
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("user.yourAddresses")}</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.gray700} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary500} />
              <Text style={styles.loadingText}>
                {t("address.loadingAddresses")}
              </Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.scrollContent}>
            <LocationPreview address={selectedAddress} />

            {addresses.map((item) => (
              <View key={item.id} style={styles.addressRow}>
                <Pressable
                  style={styles.radio}
                  onPress={() => handleSelect(item.id)}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      item.id === defaultAddressId && styles.radioSelected,
                    ]}
                  />
                </Pressable>
                <View style={styles.addressContent}>
                  <View style={styles.addressText}>
                    <Text style={styles.label}>{item.label}</Text>
                    <Text style={styles.addressLine}>{item.line1}</Text>
                    {item.line2 ? (
                      <Text style={styles.addressLine}>{item.line2}</Text>
                    ) : null}
                    <Text style={styles.addressLine}>
                      {item.city}, {item.state} {item.zip}
                    </Text>
                    <Text style={styles.addressLine}>{item.country}</Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <Pressable
                      onPress={() => handleEdit(item)}
                      style={styles.actionBtn}
                    >
                      <Ionicons
                        name="pencil"
                        size={scaleSize(16)}
                        color={Colors.accent700}
                      />
                      <Text style={styles.actionBtnText}>
                        {t("common.edit")}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(item.id)}
                      style={[styles.actionBtn, styles.deleteBtn]}
                    >
                      <Ionicons
                        name="trash"
                        size={scaleSize(16)}
                        color={Colors.error500}
                      />
                      <Text
                        style={[styles.actionBtnText, styles.deleteBtnText]}
                      >
                        {t("common.delete")}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}

            {addresses.length === 0 && !isLoading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {t("address.noAddressesYet")}
                </Text>
              </View>
            )}

            <Pressable style={styles.addBtn} onPress={handleAdd}>
              <Text style={styles.addBtnText}>{t("address.addAddress")}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
      {/* </SafeAreaWrapper> */}

      {/* New sub-modal for address form */}
      <Modal
        visible={showForm}
        animationType="fade"
        transparent
        onRequestClose={handleCancelForm}
      >
        <View style={styles.subOverlay}>
          <ScrollView
            style={styles.subModal}
            contentContainerStyle={styles.subModalContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            <AddressForm
              initialData={editingAddress}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelForm}
              isSubmitting={isSubmitting}
            />
          </ScrollView>
        </View>
      </Modal>
    </Modal>
  );
}

export default AddressesModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray300,
    backgroundColor: "#fff",
    minHeight: scaleSize(60),
  },
  title: {
    fontWeight: "bold",
    fontSize: scaleFont(20),
    color: Colors.gray700,
    flex: 1,
    lineHeight: scaleFont(24),
  },
  closeButton: {
    padding: spacing.lg,
    borderRadius: scaleSize(24),
    backgroundColor: Colors.gray200,
    minWidth: scaleSize(48),
    minHeight: scaleSize(48),
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: scaleFont(16),
    fontWeight: "bold",
    color: Colors.gray600,
    lineHeight: scaleFont(20),
  },
  content: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl, // + spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xxl + spacing.xl,
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: scaleFont(16),
    color: Colors.gray600,
    lineHeight: scaleFont(20),
  },
  errorContainer: {
    padding: spacing.xl,
    backgroundColor: Colors.error100,
    borderRadius: scaleSize(8),
    marginBottom: spacing.xl,
  },
  errorText: {
    color: Colors.gray900,
    textAlign: "center",
    fontSize: scaleFont(14),
    lineHeight: scaleFont(18),
  },
  addressRow: {
    flexDirection: "row",
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: "#fff",
    borderRadius: scaleSize(12),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  radio: {
    marginRight: spacing.lg,
    paddingTop: spacing.sm,
  },
  radioCircle: {
    width: scaleSize(20),
    height: scaleSize(20),
    borderRadius: scaleSize(10),
    borderWidth: 2,
    borderColor: Colors.accent500,
  },
  radioSelected: {
    backgroundColor: Colors.primary500,
    borderColor: Colors.accent500,
  },
  addressContent: {
    flex: 1,
  },
  addressText: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  label: {
    fontWeight: "bold",
    fontSize: scaleFont(16),
    color: Colors.gray700,
    marginBottom: spacing.sm,
    lineHeight: scaleFont(20),
  },
  addressLine: {
    fontSize: scaleFont(14),
    color: Colors.gray700,
    marginBottom: spacing.xs,
    lineHeight: scaleFont(18),
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.lg,
    flexWrap: "wrap",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: scaleSize(8),
    backgroundColor: Colors.white,
    minHeight: scaleSize(40),
    gap: spacing.sm,
  },
  actionBtnText: {
    fontSize: scaleFont(14),
    fontWeight: "500",
    color: Colors.accent700,
    lineHeight: scaleFont(16),
  },
  deleteBtn: {
    backgroundColor: Colors.error100,
  },
  deleteBtnText: {
    color: Colors.accent700,
  },
  emptyContainer: {
    padding: spacing.xxl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: scaleFont(16),
    color: Colors.gray600,
    textAlign: "center",
    lineHeight: scaleFont(20),
  },
  addBtn: {
    marginTop: spacing.xl,
    backgroundColor: Colors.primary500,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: scaleSize(8),
    alignSelf: "center",
    minHeight: scaleSize(48),
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: scaleFont(16),
    lineHeight: scaleFont(20),
  },
  subOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  subModal: {
    backgroundColor: "#fff",
    borderRadius: scaleSize(16),
    padding: spacing.xl,
    width: "100%",
    maxWidth: scaleSize(400),
    maxHeight: "90%",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  subModalContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
});
