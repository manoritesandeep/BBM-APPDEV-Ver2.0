import {
  View,
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";
import { isTablet } from "../../constants/responsive";
import { useI18n } from "../../store/i18n-context";

const SCREEN_WIDTH = Dimensions.get("window").width;

function SidebarMenu({ menuItems, selected, onSelect, loading }) {
  const { t } = useI18n();

  // Function to get translated label for menu items
  const getMenuLabel = (item) => {
    const labelKey = `menu.${item.key}`;
    return t(labelKey, item.label); // Fallback to original label if translation not found
  };

  if (loading) {
    return (
      <View style={[styles.sidebar, styles.loadingSidebar]}>
        <ActivityIndicator size="small" color={Colors.primary500} />
        <Text style={styles.loadingText}>{t("menu.loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.sidebar}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 2 }} // Add minimal vertical padding inside scroll
        style={{ flex: 1 }} // Ensure ScrollView takes full height
      >
        {menuItems.map((item) => (
          <Pressable
            key={item.key}
            style={[
              styles.menuIconBox,
              selected === item.key && styles.menuIconBoxSelected,
            ]}
            onPress={() => onSelect(item.key)}
          >
            <Ionicons
              name={item.icon}
              size={isTablet() ? 34 : SCREEN_WIDTH > 400 ? 32 : 28} // Responsive icon size
              color={selected === item.key ? Colors.accent500 : "black"}
              style={{ opacity: selected === item.key ? 1 : 0.7 }}
            />
            <Text
              style={[
                styles.menuLabel,
                selected === item.key && styles.menuLabelSelected,
              ]}
            >
              {getMenuLabel(item)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: isTablet() ? 120 : SCREEN_WIDTH > 400 ? 100 : 105, // Responsive sidebar width
    backgroundColor: Colors.primary50,
    padding: 0,
    // borderTopRightRadius: 24,
    // borderBottomRightRadius: 24,
    paddingVertical: 0, // Remove vertical padding to extend to edges
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 8,
    minHeight: "100%", // Ensure full height coverage
    // backgroundColor: Colors.primary50,
  },
  menuIconBox: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2, // Slightly increased spacing for better visual separation
    paddingVertical: 6, // Increased vertical padding for better touch targets
    paddingHorizontal: 6,
    borderRadius: 8,
    width: "100%",
    backgroundColor: "transparent",
    borderLeftWidth: 4,
    borderLeftColor: "transparent",
    backgroundColor: Colors.primary100,
    minHeight: 48, // Ensure consistent height for all menu items
  },
  menuIconBoxSelected: {
    backgroundColor: "#e0f7f4",
    borderLeftColor: "#2a9d8f",
    borderLeftWidth: 2, // Slightly thicker border for selected state
    shadowColor: "#2a9d8f",
    shadowOpacity: 0.15, // Slightly more pronounced shadow
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3, // Add elevation for Android
  },
  menuLabel: {
    fontSize: isTablet() ? 16 : SCREEN_WIDTH > 400 ? 12 : 10, // Responsive text size
    // color: "#2a9d8f",
    marginTop: 2,
    textAlign: "center",
    fontWeight: "bold",
    letterSpacing: 0.5,
    paddingHorizontal: 2, // Add small horizontal padding to prevent text clipping
  },
  menuLabelSelected: {
    color: Colors.accent500,
    fontWeight: "bold",
  },
  loadingSidebar: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100%", // Ensure loading state also fills full height
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: Colors.primary500,
    textAlign: "center",
  },
});

export default SidebarMenu;
