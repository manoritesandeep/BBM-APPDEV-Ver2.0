import { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { getFirebaseDB } from "../../../util/firebaseConfig";
import { doc, updateDoc, getDoc } from "@react-native-firebase/firestore";

import { AuthContext } from "../../../store/auth-context";
import { UserContext } from "../../../store/user-context";
import ImagePicker from "./ImagePicker";
import { scaleSize, scaleFont, spacing } from "../../../constants/responsive";
import { useI18n } from "../../../store/i18n-context";

function UserProfileForm({ onClose }) {
  const { t } = useI18n();
  const { userId } = useContext(AuthContext);
  const userCtx = useContext(UserContext);
  const user = userCtx.user || {};

  const [name, setName] = useState(user.name || user.displayName || "");
  const [phone, setPhone] = useState(user.phone || user.phoneNumber || "");
  const [email, setEmail] = useState(user.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dirty, setDirty] = useState(false);

  function handleChange(setter) {
    return (value) => {
      setter(value);
      setDirty(true);
      setSuccess(false);
      setError("");
    };
  }

  // Validate email format
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Check if user can update email (phone auth users can add email if empty)
  function canUpdateEmail() {
    const isPhoneUser = user.authProvider === "phone";
    const hasNoEmail = !user.email || user.email.trim() === "";
    return isPhoneUser && hasNoEmail;
  }

  async function handleSave() {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Validate email if it's being added
      if (email && email.trim() !== "" && !validateEmail(email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      const db = await getFirebaseDB();
      const userRef = doc(db, "users", userId);

      // Prepare update data
      const updateData = {
        name: name || user.displayName,
        phone,
        // For phone auth users, also update phoneNumber field for consistency
        ...(user.authProvider === "phone" && { phoneNumber: phone }),
      };

      // Add email handling for phone auth users
      if (canUpdateEmail() && email && email.trim() !== "") {
        updateData.email = email.trim();
        updateData.canAddEmail = false; // Lock email after first addition
        updateData.emailVerified = false; // Email needs verification
        console.log("📧 Adding email to phone auth user:", email);
      }

      await updateDoc(userRef, updateData);
      const updatedDoc = await getDoc(userRef);
      if (updatedDoc.exists()) {
        userCtx.setUser(updatedDoc.data());
      }
      setSuccess(true);
      setDirty(false);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (e) {
      console.error("Error updating profile:", e);
      setError(t("user.updateProfileError"));
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    if (dirty) {
      Alert.alert(t("user.discardChanges"), t("user.unsavedChanges"), [
        { text: t("user.keepEditing"), style: "cancel" },
        { text: t("user.discard"), style: "destructive", onPress: onClose },
      ]);
    } else {
      onClose();
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarSection}>
        <ImagePicker />
        {user.profilePhotoUrl && (
          <Text style={styles.photoSource}>
            Profile photo from {user.provider === "google" && "Google"}
            {user.provider === "facebook" && "Facebook"}
            {user.provider === "apple" && "Apple"}
            {!["google", "facebook", "apple"].includes(user.provider) &&
              "upload"}
          </Text>
        )}
      </View>
      <Text style={styles.sectionTitle}>{t("user.personalInformation")}</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t("user.fullName")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("user.enterName")}
          value={name}
          onChangeText={handleChange(setName)}
          autoCapitalize="words"
        />
      </View>
      <Text style={styles.sectionTitle}>{t("user.contactInformation")}</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t("user.phoneNumber")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("user.enterPhoneNumber")}
          value={phone}
          onChangeText={handleChange(setPhone)}
          keyboardType="phone-pad"
        />
        <Text style={styles.helperText}>{t("user.phonePrivacy")}</Text>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={[styles.input, !canUpdateEmail() && styles.disabledInput]}
          placeholder={
            canUpdateEmail()
              ? "Add email for order notifications (optional)"
              : "Email"
          }
          value={email}
          onChangeText={canUpdateEmail() ? handleChange(setEmail) : undefined}
          editable={canUpdateEmail()}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.helperText}>
          {canUpdateEmail()
            ? "📧 Add email to receive order confirmations via email (optional)"
            : user.authProvider === "phone" && user.email
            ? "📧 Email added and locked for security"
            : user.authProvider === "google"
            ? "Email cannot be changed (Google account)"
            : user.authProvider === "facebook"
            ? "Email cannot be changed (Facebook account)"
            : user.authProvider === "apple"
            ? "Email cannot be changed (Apple account)"
            : "Email cannot be changed"}
        </Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? (
        <Text style={styles.success}>{t("user.profileUpdated")}</Text>
      ) : null}
      <View style={styles.row}>
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            loading && styles.disabledBtn,
            pressed && !loading && styles.pressedBtn,
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>{t("user.saveChanges")}</Text>
          )}
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.cancelBtn,
            loading && styles.disabledBtn,
            pressed && !loading && styles.pressedBtn,
          ]}
          onPress={handleCancel}
          disabled={loading}
        >
          <Text style={styles.cancelBtnText}>{t("common.cancel")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default UserProfileForm;

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: "#fff",
    borderRadius: scaleSize(16),
    minHeight: "100%",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: spacing.xxl,
    paddingVertical: spacing.md,
  },
  photoSource: {
    fontSize: scaleFont(12),
    color: "#666",
    marginTop: spacing.md,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: scaleFont(16),
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: scaleFont(18),
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    color: "#2a9d8f",
    lineHeight: scaleFont(24),
  },
  inputGroup: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: scaleFont(16),
    marginBottom: spacing.md,
    color: "#333",
    fontWeight: "500",
    lineHeight: scaleFont(20),
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: scaleSize(8),
    padding: spacing.lg,
    marginBottom: spacing.md,
    fontSize: scaleFont(16),
    backgroundColor: "#fafafa",
    minHeight: scaleSize(48),
    lineHeight: scaleFont(20),
  },
  disabledInput: {
    backgroundColor: "#eee",
    color: "#888",
  },
  helperText: {
    fontSize: scaleFont(14),
    color: "#888",
    marginBottom: spacing.sm,
    lineHeight: scaleFont(18),
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.xxl + spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.lg,
  },
  saveBtn: {
    backgroundColor: "#2a9d8f",
    paddingVertical: scaleSize(14),
    paddingHorizontal: spacing.xxl,
    borderRadius: scaleSize(8),
    minWidth: scaleSize(120),
    alignItems: "center",
    minHeight: scaleSize(48),
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: scaleFont(16),
    lineHeight: scaleFont(20),
  },
  cancelBtn: {
    backgroundColor: "#eee",
    paddingVertical: scaleSize(14),
    paddingHorizontal: spacing.xxl,
    borderRadius: scaleSize(8),
    minWidth: scaleSize(100),
    alignItems: "center",
    minHeight: scaleSize(48),
    justifyContent: "center",
  },
  cancelBtnText: {
    color: "#2a9d8f",
    fontWeight: "bold",
    fontSize: scaleFont(16),
    lineHeight: scaleFont(20),
  },
  error: {
    color: "red",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    textAlign: "center",
    fontSize: scaleFont(14),
    lineHeight: scaleFont(18),
  },
  success: {
    color: "#2a9d8f",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: scaleFont(14),
    lineHeight: scaleFont(18),
  },
  disabledBtn: { opacity: 0.6 },
  pressedBtn: { opacity: 0.8 },
});
