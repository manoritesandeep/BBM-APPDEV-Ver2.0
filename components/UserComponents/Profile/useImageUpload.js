// Custom hook

import { useState, useContext } from "react";
import { Alert } from "react-native";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "@react-native-firebase/storage";
import { doc, updateDoc } from "@react-native-firebase/firestore";
import { storage, db } from "../../../util/firebaseConfig";

import { AuthContext } from "../../../store/auth-context";
import { UserContext } from "../../../store/user-context";

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const { userId } = useContext(AuthContext);
  const userCtx = useContext(UserContext);

  async function uploadToFirebase(imageUri) {
    if (!userId) {
      Alert.alert(
        "Not logged in",
        "You must be logged in to upload a profile image."
      );
      return;
    }
    setUploading(true);
    try {
      const fileName = `profile_${userId}_${Date.now()}.jpg`;
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const storageRef = ref(storage, `profileImages/${fileName}`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { profilePhotoUrl: downloadURL });

      userCtx.setUser({ ...userCtx.user, profilePhotoUrl: downloadURL });

      Alert.alert("Success", "Profile image uploaded!");
    } catch (e) {
      console.error(e);
      Alert.alert("Upload failed", "Could not upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return { uploadToFirebase, uploading };
}
