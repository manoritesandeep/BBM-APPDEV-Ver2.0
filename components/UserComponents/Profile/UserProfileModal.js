import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Text,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import UserProfileForm from "./UserProfileForm";
import SafeAreaWrapper from "../../UI/SafeAreaWrapper";
import { Colors } from "../../../constants/styles";
import { scaleSize, scaleFont, spacing } from "../../../constants/responsive";
import { useI18n } from "../../../store/i18n-context";

function UserProfileModal({ visible, onClose }) {
  const { t } = useI18n();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaWrapper edges={["bottom"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("user.editProfile")}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.gray700} />
            </Pressable>
          </View>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            <UserProfileForm onClose={onClose} />
          </ScrollView>
        </View>
      </SafeAreaWrapper>
    </Modal>
  );
}

export default UserProfileModal;

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
  },
  title: {
    fontWeight: "bold",
    fontSize: scaleFont(20),
    color: Colors.gray700,
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
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    padding: spacing.sm,
    paddingBottom: spacing.xxl, // + spacing.xl, // Extra bottom padding
  },
});
