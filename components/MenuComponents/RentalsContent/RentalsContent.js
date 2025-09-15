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

import useFetchRentals from "./FetchRentals"; // <-- Import the hook
// import { RENTALS } from "../../../data/dummy-data";

function RentalsContent() {
  const { rentals, loading } = useFetchRentals(); // <-- use the hook
  const { t } = useI18n();
  const { colors } = useTheme();

  const styles = createStyles(colors);

  return (
    <View style={styles.contentBox}>
      <View style={styles.sectionHeader}>
        <Ionicons
          name="construct-outline"
          size={26}
          color={colors.primary500}
        />
        <Text style={styles.contentTitle}>{t("menu.rentals")}</Text>
      </View>
      <View style={styles.divider} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary500} />
          <Text style={styles.loadingText}>{t("common.loadingRentals")}</Text>
        </View>
      ) : rentals.length === 0 ? (
        <Text style={styles.emptyText}>{t("menu.noRentalsAvailable")}</Text>
      ) : (
        <FlatList
          data={rentals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 4 }} // Minimal padding for better space utilization
          renderItem={({ item }) => (
            <View style={styles.listCard}>
              <Text style={styles.listCardTitle}>{item.name}</Text>
              <Text style={styles.listCardSubtitle}>{item.price}</Text>
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
    listCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 18,
      marginBottom: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      elevation: 1,
      shadowColor: colors.shadow,
      shadowOpacity: 0.06,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    },
    listCardTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    listCardSubtitle: {
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

export default RentalsContent;
