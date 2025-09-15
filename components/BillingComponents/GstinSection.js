import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
  layout,
} from "../../constants/responsive";
import { AuthContext } from "../../store/auth-context";
import { UserContext } from "../../store/user-context";
import { updateDocument } from "../../util/firebaseUtils";

function GstinSection({ onGstinChange }) {
  const { userId, isAuthenticated } = useContext(AuthContext);
  const { user, updateUser } = useContext(UserContext);

  const [isExpanded, setIsExpanded] = useState(false);
  const [gstinNumber, setGstinNumber] = useState("");
  const [confirmedGstin, setConfirmedGstin] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing GSTIN from user data
  useEffect(() => {
    if (user && user.gstinNumber) {
      setConfirmedGstin(user.gstinNumber);
      setGstinNumber(""); // Reset input field
      // Notify parent component of existing GSTIN
      if (onGstinChange) {
        onGstinChange(user.gstinNumber);
      }
    }
  }, [user, onGstinChange]);

  const validateGSTIN = (gstin) => {
    // GSTIN format: 15 characters - 2 state code + 10 PAN + 1 entity number + 1 alphabet + 1 checksum
    const gstinRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  };

  const handleGstinConfirm = async () => {
    if (!gstinNumber.trim()) {
      Alert.alert("Error", "Please enter a valid GSTIN number");
      return;
    }

    const cleanedGstin = gstinNumber.toUpperCase().trim();

    if (!validateGSTIN(cleanedGstin)) {
      Alert.alert(
        "Invalid GSTIN",
        "Please enter a valid 15-character GSTIN number"
      );
      return;
    }

    setIsLoading(true);

    try {
      // Update GSTIN in Firebase if user is authenticated
      if (isAuthenticated && userId) {
        await updateDocument("users", userId, { gstinNumber: cleanedGstin });
        // Update local user context
        updateUser({ gstinNumber: cleanedGstin });
      }

      // Update confirmed GSTIN and clear input
      setConfirmedGstin(cleanedGstin);
      setGstinNumber("");

      // Notify parent component
      if (onGstinChange) {
        onGstinChange(cleanedGstin);
      }

      Alert.alert("Success", "GSTIN number saved successfully");
      setIsExpanded(false);
    } catch (error) {
      console.error("Error saving GSTIN:", error);
      Alert.alert("Error", "Failed to save GSTIN number. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditGstin = () => {
    setGstinNumber(confirmedGstin);
    setConfirmedGstin(null);
  };

  const handleRemoveGstin = async () => {
    Alert.alert(
      "Remove GSTIN",
      "Are you sure you want to remove your GSTIN number?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              if (isAuthenticated && userId) {
                await updateDocument("users", userId, { gstinNumber: null });
                updateUser({ gstinNumber: null });
              }

              setConfirmedGstin(null);
              setGstinNumber("");
              if (onGstinChange) {
                onGstinChange(null);
              }

              setIsExpanded(false);
            } catch (error) {
              console.error("Error removing GSTIN:", error);
              Alert.alert(
                "Error",
                "Failed to remove GSTIN number. Please try again."
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Collapsible Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Add GSTIN (optional)</Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={scaleSize(20)}
            color={Colors.accent700}
          />
        </View>
        <Text style={styles.headerSubtext}>
          Claim GST input credit up to 28% on your order.
        </Text>
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.description}>
            If you are a business owner, add your GST details and get GST
            invoice on your order.
          </Text>

          {confirmedGstin ? (
            <View style={styles.existingGstinContainer}>
              <Text style={styles.existingGstinLabel}>Current GSTIN:</Text>
              <Text style={styles.existingGstinValue}>{confirmedGstin}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEditGstin}
                  disabled={isLoading}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={handleRemoveGstin}
                  disabled={isLoading}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter 15-digit GSTIN number"
                value={gstinNumber}
                onChangeText={setGstinNumber}
                maxLength={15}
                autoCapitalize="characters"
                returnKeyType="done"
                onSubmitEditing={handleGstinConfirm}
              />
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (!gstinNumber.trim() || isLoading) &&
                    styles.confirmButtonDisabled,
                ]}
                onPress={handleGstinConfirm}
                disabled={!gstinNumber.trim() || isLoading}
              >
                <Text
                  style={[
                    styles.confirmButtonText,
                    (!gstinNumber.trim() || isLoading) &&
                      styles.confirmButtonTextDisabled,
                  ]}
                >
                  {isLoading ? "Saving..." : "Confirm"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default GstinSection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: scaleSize(12),
    marginVertical: spacing.sm,
    overflow: "hidden",
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    padding: spacing.lg,
  },
  headerContent: {
    ...layout.flexRow,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  headerTitle: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.accent700,
  },
  headerSubtext: {
    ...typography.caption,
    color: Colors.gray600,
    lineHeight: scaleSize(16),
  },
  expandedContent: {
    padding: spacing.lg,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  description: {
    ...typography.caption,
    color: Colors.gray700,
    marginBottom: spacing.md,
    lineHeight: scaleSize(18),
  },
  inputContainer: {
    gap: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: scaleSize(8),
    padding: spacing.md,
    ...typography.body,
    color: Colors.gray900,
    backgroundColor: Colors.gray50,
  },
  confirmButton: {
    backgroundColor: Colors.accent700,
    borderRadius: scaleSize(8),
    padding: spacing.md,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.gray300,
  },
  confirmButtonText: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.white,
  },
  confirmButtonTextDisabled: {
    color: Colors.gray500,
  },
  existingGstinContainer: {
    backgroundColor: Colors.success50,
    borderRadius: scaleSize(8),
    padding: spacing.md,
    borderWidth: 1,
    borderColor: Colors.success200,
  },
  existingGstinLabel: {
    ...typography.caption,
    color: Colors.gray700,
    marginBottom: spacing.xs,
  },
  existingGstinValue: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.success700,
    marginBottom: spacing.sm,
  },
  buttonContainer: {
    ...layout.flexRow,
    gap: spacing.md,
  },
  editButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  editButtonText: {
    ...typography.caption,
    color: Colors.accent700,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  removeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  removeButtonText: {
    ...typography.caption,
    color: Colors.error600,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
