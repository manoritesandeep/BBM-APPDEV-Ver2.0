// // components/ProtectedScreen.js
import { useContext, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { AuthContext } from "../../store/auth-context";

function ProtectedScreen({ children, navigation }) {
  const authCtx = useContext(AuthContext);

  useEffect(() => {
    if (!authCtx.isAuthenticated) {
      navigation.navigate("Login");
    }
  }, [authCtx.isAuthenticated, navigation]);

  if (!authCtx.isAuthenticated) {
    // Show loading indicator or blank screen while redirecting
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
}

export default ProtectedScreen;
