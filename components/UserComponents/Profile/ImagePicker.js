import { useState, useContext } from "react";
import { Alert } from "react-native";
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  useCameraPermissions,
  PermissionStatus,
} from "expo-image-picker";

import { UserContext } from "../../../store/user-context";
import ImagePreview from "./ImagePreview";
import ImageUploadButtons from "./ImageUploadButtons";
import { useImageUpload } from "./useImageUpload";
import { compressImage } from "../../../util/compressImage";

function ImagePicker() {
  const [pickedImage, setPickedImage] = useState();
  const [cameraPermissionInformation, requestPermission] =
    useCameraPermissions();
  const userCtx = useContext(UserContext);
  const { uploadToFirebase, uploading } = useImageUpload();

  async function verifyPermissions() {
    if (cameraPermissionInformation.status === PermissionStatus.UNDETERMINED) {
      const permissionResponse = await requestPermission();
      return permissionResponse.granted;
    }
    if (cameraPermissionInformation.status === PermissionStatus.DENIED) {
      Alert.alert(
        "Insufficient Permissions!",
        "You need to grant camera permissions to use this app."
      );
      return false;
    }
    return true;
  }

  // async function compressImage(uri) {
  //   const manipResult = await ImageManipulator.manipulateAsync(
  //     uri,
  //     [{ resize: { width: 800 } }], // Resize to width 800px (adjust as needed)
  //     { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  //   );
  //   return manipResult.uri;
  // }

  async function takeImageHandler() {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) return;

    const image = await launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (!image.canceled && image.assets && image.assets[0]?.uri) {
      const compressedUri = await compressImage(image.assets[0].uri);
      setPickedImage(compressedUri);
      await uploadToFirebase(compressedUri);
    }
  }

  async function uploadImageHandler() {
    const image = await launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (image.canceled || !image.assets || !image.assets[0]?.uri) {
      return;
    }

    const imageUri = image.assets[0].uri;
    const compressedUri = await compressImage(imageUri);
    setPickedImage(compressedUri);
    await uploadToFirebase(compressedUri);
  }

  return (
    <>
      <ImagePreview
        pickedImage={pickedImage}
        profilePhotoUrl={userCtx.user?.profilePhotoUrl}
      />
      <ImageUploadButtons
        onTakeImage={takeImageHandler}
        onUploadImage={uploadImageHandler}
        uploading={uploading}
      />
    </>
  );
}

export default ImagePicker;
