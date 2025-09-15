import { TouchableOpacity, Text, StyleSheet, Image, View } from "react-native";

const SocialLoginButton = ({ onPress, icon, text, backgroundColor }) => (
  <TouchableOpacity
    style={[styles.button, { backgroundColor }]}
    onPress={onPress}
  >
    <View style={styles.content}>
      {icon && <Image source={icon} style={styles.icon} />}
      <Text style={styles.text}>{text}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default SocialLoginButton;
