import { StyleSheet, Text } from "react-native";

function TopPicksContent() {
  return <Text>Top Picks here!</Text>;
}

export default TopPicksContent;

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
});
