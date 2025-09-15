// A reusable card component for all user actions.

import { Pressable, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";

function UserCard({ icon, title, subtitle, onPress, style }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={28}
        color={Colors.accent700}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

export default UserCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary700,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.gray700,
    marginTop: 2,
  },
});
