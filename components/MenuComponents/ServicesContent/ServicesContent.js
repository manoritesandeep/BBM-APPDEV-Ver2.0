import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useI18n } from "../../../store/i18n-context";
import { useTheme } from "../../../store/theme-context";

import useFetchServices from "./FetchServices";
// import { SERVICES } from "../../../data/dummy-data";

function ServicesContent() {
  const { services, loading } = useFetchServices();
  const { t } = useI18n();
  const { colors } = useTheme();

  const styles = createStyles(colors);

  return (
    <View style={styles.contentBox}>
      <View style={styles.sectionHeader}>
        <Ionicons name="people-outline" size={26} color={colors.primary500} />
        <Text style={styles.contentTitle}>{t("menu.services")}</Text>
      </View>
      <View style={styles.divider} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary500} />
          <Text style={styles.loadingText}>{t("common.loadingServices")}</Text>
        </View>
      ) : services.length === 0 ? (
        <Text style={styles.emptyText}>{t("menu.noServicesAvailable")}</Text>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 4 }} // Minimal padding for better space utilization
          renderItem={({ item }) => (
            <View style={styles.listPill}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={colors.primary500}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.listPillText}>{item.name}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    contentBox: {
      flex: 1, // Fills all available space in the content area
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 24,
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      // REMOVE width, minHeight, alignItems
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
      gap: 8,
    },
    contentTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.primary500,
      marginLeft: 8,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      width: "100%",
      marginBottom: 12,
      marginTop: 2,
    },
    listPill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary50,
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 16,
      marginBottom: 10,
      alignSelf: "flex-start",
    },
    listPillText: {
      fontSize: 15,
      color: colors.primary500,
      fontWeight: "600",
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 15,
      textAlign: "center",
      marginTop: 30,
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    loadingText: {
      marginLeft: 10,
      color: colors.primary500,
      fontSize: 15,
    },
  });

export default ServicesContent;
