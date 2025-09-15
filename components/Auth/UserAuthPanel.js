import { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { login, createUser } from "../../util/auth";
import { getFirebaseDB } from "../../util/firebaseConfig";
import { doc, getDoc } from "@react-native-firebase/firestore";

import AuthContent from "../Auth/AuthContent";
import { Colors } from "../../constants/styles";
import { AuthContext } from "../../store/auth-context";
import { UserContext } from "../../store/user-context";
import { SafeAreaWrapper } from "../UI/SafeAreaWrapper";

function UserAuthPanel() {
  const authCtx = useContext(AuthContext);
  const userCtx = useContext(UserContext);
  const [isLogin, setIsLogin] = useState(true);

  async function authHandler({ email, password, name, address }) {
    try {
      let token, userId;
      if (isLogin) {
        ({ token, userId } = await login(email, password));
      } else {
        ({ token, userId } = await createUser(email, password, name, address));
      }
      authCtx.authenticate(token, userId, "email");

      // Fetch user profile from Firestore
      try {
        const db = await getFirebaseDB();
        if (db) {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            userCtx.setUser(userDoc.data());
          } else {
            userCtx.setUser({ email });
          }
        } else {
          console.warn("Database not available, using email only");
          userCtx.setUser({ email });
        }
      } catch (dbError) {
        console.warn("Database error during authentication:", dbError);
        userCtx.setUser({ email });
      }
    } catch (error) {
      Alert.alert(
        "Authentication failed!",
        isLogin
          ? "Could not log you in. Please check your credentials or try again later!"
          : "Could not create user, please check your input and try again later."
      );
    }
  }

  function switchAuthModeHandler() {
    setIsLogin((prev) => !prev);
  }

  return (
    <SafeAreaWrapper
      edges={["left", "right"]}
      backgroundColor={Colors.primary100}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={60} // Adjust if you have a header
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.welcomeContainer}>
              <Image
                source={require("../../assets/splash.png")}
                style={styles.imageLogo}
              />
              <Text style={styles.title}> Welcome to Build Bharat Mart!</Text>
            </View>

            <View style={{ marginHorizontal: 32 }}>
              <Text style={styles.subtitle}>
                {isLogin
                  ? "Welcome back! Please sign in to your account."
                  : "New here? Join us today with a free account."}
              </Text>
              <AuthContent
                isLogin={isLogin}
                onAuthenticate={authHandler}
                onSwitchMode={switchAuthModeHandler}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

export default UserAuthPanel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    justifyContent: "flex-start",
  },
  // centeredWelcome: {
  //   // alignItems: "center",
  //   // justifyContent: "center",
  //   // marginBottom: 24,
  // },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "left",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 4, // Reduced space between text and form
    textAlign: "left",
    fontWeight: "500",
  },
  welcomeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 48,
  },
  imageLogo: {
    width: 60,
    height: 65,
    borderRadius: 16,
    marginRight: 2,
  },
});
