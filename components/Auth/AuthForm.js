import { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

import Button from "../UI/authUI/Button";
import Input from "./Input";
import { Colors } from "../../constants/styles";

function AuthForm({ isLogin, onSubmit, credentialsInvalid, onForgotPassword }) {
  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredConfirmEmail, setEnteredConfirmEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [enteredConfirmPassword, setEnteredConfirmPassword] = useState("");
  const [enteredName, setEnteredName] = useState("");
  // const [enteredAddress, setEnteredAddress] = useState("");

  const {
    email: emailIsInvalid,
    confirmEmail: emailsDontMatch,
    password: passwordIsInvalid,
    confirmPassword: passwordsDontMatch,
  } = credentialsInvalid;

  function updateInputValueHandler(inputType, enteredValue) {
    switch (inputType) {
      case "email":
        setEnteredEmail(enteredValue);
        break;
      case "confirmEmail":
        setEnteredConfirmEmail(enteredValue);
        break;
      case "password":
        setEnteredPassword(enteredValue);
        break;
      case "confirmPassword":
        setEnteredConfirmPassword(enteredValue);
        break;
      case "name":
        setEnteredName(enteredValue);
        break;
      // case "address":
      //   setEnteredAddress(enteredValue);
      //   break;
    }
  }

  function submitHandler() {
    onSubmit({
      email: enteredEmail,
      confirmEmail: enteredConfirmEmail,
      password: enteredPassword,
      confirmPassword: enteredConfirmPassword,
      name: enteredName,
      // address: enteredAddress,
    });
  }

  return (
    <View style={styles.form}>
      <View>
        {!isLogin && (
          <Input
            label="Name"
            onUpdateValue={updateInputValueHandler.bind(this, "name")}
            value={enteredName}
            isInvalid={false}
          />
        )}
        {/* {!isLogin && (
          <Input
            label="Address"
            onUpdateValue={updateInputValueHandler.bind(this, "address")}
            value={enteredAddress}
            isInvalid={false}
          />
        )} */}

        <Input
          label="Email Address"
          onUpdateValue={updateInputValueHandler.bind(this, "email")}
          value={enteredEmail}
          keyboardType="email-address"
          isInvalid={emailIsInvalid}
        />
        {!isLogin && (
          <Input
            label="Confirm Email Address"
            onUpdateValue={updateInputValueHandler.bind(this, "confirmEmail")}
            value={enteredConfirmEmail}
            keyboardType="email-address"
            isInvalid={emailsDontMatch}
          />
        )}
        <Input
          label="Password"
          onUpdateValue={updateInputValueHandler.bind(this, "password")}
          secure
          value={enteredPassword}
          isInvalid={passwordIsInvalid}
        />

        {/* Forgot Password Link - Only show on login */}
        {isLogin && onForgotPassword && (
          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity
              onPress={onForgotPassword}
              style={styles.forgotPasswordButton}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLogin && (
          <Input
            label="Confirm Password"
            onUpdateValue={updateInputValueHandler.bind(
              this,
              "confirmPassword"
            )}
            secure
            value={enteredConfirmPassword}
            isInvalid={passwordsDontMatch}
          />
        )}
        <View style={styles.buttons}>
          <Button onPress={submitHandler}>
            {isLogin ? "Sign In" : "Create Account"}
          </Button>

          {/* Enhanced helpful text */}
          <Text style={styles.helpText}>
            {isLogin
              ? "Secure sign in to your account"
              : "All fields are required to create your account"}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default AuthForm;

const styles = StyleSheet.create({
  form: {
    color: "black",
  },
  buttons: {
    marginTop: 4,
  },
  helpText: {
    fontSize: 11,
    color: Colors.accent500,
    textAlign: "center",
    marginTop: 6,
    fontStyle: "italic",
  },
  text: {
    color: "black",
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginTop: 4,
    marginBottom: 8,
  },
  forgotPasswordButton: {
    padding: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: Colors.accent700,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
