import { View, Text, StyleSheet } from "react-native";

function CustomerCareContent() {
  return (
    <View style={styles.contentBox}>
      <Text style={styles.contentTitle}>Customer Care</Text>
      <Text style={styles.contentText}>
        Call us at <Text style={styles.bold}>1800-123-4567</Text>
        {"\n"}or email <Text style={styles.bold}>support@bbmart.com</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contentBox: {
    flex: 1, // Fills all available space in the content area
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    // REMOVE width, minHeight, alignItems
  },
  contentTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2a9d8f",
    marginBottom: 18,
    textAlign: "center",
  },
  contentText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  bold: { fontWeight: "bold", color: "#2a9d8f" },
});

export default CustomerCareContent;
