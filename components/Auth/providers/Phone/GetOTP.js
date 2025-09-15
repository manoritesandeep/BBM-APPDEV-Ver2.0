// // // Perplexity code
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import auth from "@react-native-firebase/auth";

// function GetOTP() {
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [confirm, setConfirm] = useState(null);
//   const [verificationCode, setVerificationCode] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Validate phone number format
//   const validatePhoneNumber = (phone) => {
//     const phoneRegex = /^\+[1-9]\d{1,14}$/;
//     return phoneRegex.test(phone);
//   };

//   const sendVerificationCode = async () => {
//     if (!validatePhoneNumber(phoneNumber)) {
//       Alert.alert(
//         "Error",
//         "Please enter a valid phone number with country code (e.g., +1234567890)"
//       );
//       return;
//     }

//     setLoading(true);
//     try {
//       const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
//       setConfirm(confirmation);
//       Alert.alert("Success", "Verification code sent to your phone");
//     } catch (error) {
//       console.error("Error sending verification code:", error);
//       let errorMessage = "Failed to send verification code";

//       if (error.code === "auth/invalid-phone-number") {
//         errorMessage = "Invalid phone number format";
//       } else if (error.code === "auth/too-many-requests") {
//         errorMessage = "Too many requests. Try again later";
//       } else if (error.code === "auth/quota-exceeded") {
//         errorMessage = "SMS quota exceeded. Try again tomorrow";
//       }

//       Alert.alert("Error", errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const confirmCode = async () => {
//     if (!verificationCode || verificationCode.length < 6) {
//       Alert.alert("Error", "Please enter the complete verification code");
//       return;
//     }

//     setLoading(true);
//     try {
//       await confirm.confirm(verificationCode);
//       Alert.alert("Success", "Phone number verified successfully!");
//       // Navigate to your main app or handle successful authentication
//     } catch (error) {
//       console.error("Error confirming verification code:", error);
//       let errorMessage = "Invalid verification code";

//       if (error.code === "auth/invalid-verification-code") {
//         errorMessage = "Invalid verification code. Please try again";
//       } else if (error.code === "auth/code-expired") {
//         errorMessage = "Verification code has expired. Request a new one";
//       }

//       Alert.alert("Error", errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetFlow = () => {
//     setConfirm(null);
//     setVerificationCode("");
//     setPhoneNumber("");
//   };

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <View style={styles.content}>
//         <Text style={styles.title}>Phone Verification</Text>

//         {!confirm ? (
//           <>
//             <Text style={styles.subtitle}>
//               Enter your phone number with country code
//             </Text>
//             <TextInput
//               placeholder="Enter phone number (+1234567890)"
//               value={phoneNumber}
//               onChangeText={setPhoneNumber}
//               style={styles.input}
//               keyboardType="phone-pad"
//               autoCompleteType="tel"
//               textContentType="telephoneNumber"
//               editable={!loading}
//             />
//             <TouchableOpacity
//               style={[styles.button, loading && styles.buttonDisabled]}
//               onPress={sendVerificationCode}
//               disabled={loading}
//             >
//               <Text style={styles.buttonText}>
//                 {loading ? "Sending..." : "Send OTP"}
//               </Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           <>
//             <Text style={styles.subtitle}>
//               Enter the 6-digit code sent to {phoneNumber}
//             </Text>
//             <TextInput
//               placeholder="Enter verification code"
//               value={verificationCode}
//               onChangeText={setVerificationCode}
//               style={styles.input}
//               keyboardType="numeric"
//               maxLength={6}
//               autoCompleteType="sms-otp"
//               textContentType="oneTimeCode"
//               editable={!loading}
//             />
//             <TouchableOpacity
//               style={[styles.button, loading && styles.buttonDisabled]}
//               onPress={confirmCode}
//               disabled={loading}
//             >
//               <Text style={styles.buttonText}>
//                 {loading ? "Verifying..." : "Verify Code"}
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.linkButton}
//               onPress={resetFlow}
//               disabled={loading}
//             >
//               <Text style={styles.linkText}>Use different number</Text>
//             </TouchableOpacity>
//           </>
//         )}
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   content: {
//     flex: 1,
//     padding: 20,
//     justifyContent: "center",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 10,
//     color: "#333",
//   },
//   subtitle: {
//     fontSize: 16,
//     textAlign: "center",
//     marginBottom: 30,
//     color: "#666",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     padding: 15,
//     fontSize: 16,
//     marginBottom: 20,
//     backgroundColor: "#fff",
//   },
//   button: {
//     backgroundColor: "#007AFF",
//     borderRadius: 8,
//     padding: 15,
//     alignItems: "center",
//   },
//   buttonDisabled: {
//     backgroundColor: "#ccc",
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   linkButton: {
//     marginTop: 20,
//     alignItems: "center",
//   },
//   linkText: {
//     color: "#007AFF",
//     fontSize: 16,
//   },
// });

// export default GetOTP;

// // function GetOTP() {
// //   return null;
// // }

// // export default GetOTP;

// // import React, { useRef, useState } from "react";
// // import { Button, Text, TextInput, View } from "react-native";
// // import { auth } from "../utils/config"; // Import 'auth' from your config file
// // import {
// //   PhoneAuthProvider,
// //   signInWithCredential,
// //   // If you're using modular SDK v9+, you can use setAppVerificationDisabledForTesting:
// //   setAppVerificationDisabledForTesting, // optional - uncomment if available in your SDK
// // } from "firebase/auth";
// // // import { firebaseConfig } from "../utils/config";
// // // import firebase from "firebase/compat/app";

// // function GetOTP() {
// //   const [phoneNumber, setPhoneNumber] = useState("");
// //   const [verificationId, setVerificationId] = useState("");
// //   const [verificationCode, setVerificationCode] = useState("");

// //   async function sendVerificationCode() {
// //     try {
// //       // === For local testing only: disable app verification ===
// //       // Use ONE of these approaches depending on your SDK:
// //       // 1) Modular SDK v9+ (uncomment import above and this line):
// //       setAppVerificationDisabledForTesting(auth, true);

// //       // 2) Compat SDK (if you're using firebase/compat):
// //       // firebase.auth().settings.appVerificationDisabledForTesting = true;

// //       // Remove or guard these calls in production builds.
// //       const phoneProvider = new PhoneAuthProvider(auth);
// //       const id = await phoneProvider.verifyPhoneNumber(phoneNumber);
// //       setVerificationId(id);
// //       console.log("Verification code sent!");
// //     } catch (error) {
// //       console.error("Error sending verification code:", error);
// //     }
// //   }

// //   const confirmCode = async () => {
// //     try {
// //       const credential = PhoneAuthProvider.credential(
// //         verificationId,
// //         verificationCode
// //       );
// //       await signInWithCredential(auth, credential);
// //       console.log("Phone number authentication successful!");
// //     } catch (error) {
// //       console.error("Error confirming verification code:", error);
// //     }
// //   };

// //   return (
// //     <View style={{ padding: 20 }}>
// //       <Text>OTP</Text>
// //       {!verificationId ? (
// //         <>
// //           <TextInput
// //             placeholder="Enter phone number"
// //             value={phoneNumber}
// //             onChangeText={setPhoneNumber}
// //             style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
// //           />
// //           <Button title="Send OTP" onPress={sendVerificationCode} />
// //         </>
// //       ) : (
// //         <>
// //           <TextInput
// //             placeholder="Enter verification code"
// //             value={verificationCode}
// //             onChangeText={setVerificationCode}
// //             style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
// //           />
// //           <Button title="Confirm OTP" onPress={confirmCode} />
// //         </>
// //       )}
// //     </View>
// //   );
// // }

// // export default GetOTP;
