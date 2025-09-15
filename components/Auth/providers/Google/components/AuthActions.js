import React from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

const AuthActions = ({ userInfo, onSignIn, onLogout, isLoading }) => {
  return (
    <View style={styles.actionsContainer}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#4285f4" />
      ) : userInfo ? (
        <View style={styles.buttonContainer}>
          <Button title="Logout" onPress={onLogout} color="#db4437" />
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <Button
            title="Sign In with Google"
            onPress={onSignIn}
            color="#4285f4"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  buttonContainer: {
    minWidth: 200,
  },
});

export default AuthActions;
