// UserScreen.js - Enhanced with Unified Authentication
import { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AuthContext } from "../store/auth-context";
import { UserContext } from "../store/user-context";
import { useI18n } from "../store/i18n-context";
import UnifiedAuthScreen from "./UnifiedAuthScreen";
import UserScreenOutput from "../components/UserComponents/UserScreenOutput";
import { Colors } from "../constants/styles";
import { SafeAreaWrapper } from "../components/UI/SafeAreaWrapper";

function UserScreen({ navigation }) {
  const authCtx = useContext(AuthContext);
  const userCtx = useContext(UserContext);
  const { t } = useI18n();

  // Show unified authentication screen if user is not authenticated
  if (!authCtx.isAuthenticated) {
    return <UnifiedAuthScreen navigation={navigation} />;
  }

  const userName = userCtx.user?.name || userCtx.user?.email || "User";

  return (
    <SafeAreaWrapper
      edges={["left", "right"]}
      backgroundColor={Colors.primary300}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{t("user.welcomeUser", { userName })}</Text>
        <UserScreenOutput navigation={navigation} />
      </View>
    </SafeAreaWrapper>
  );
}

export default UserScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
});
