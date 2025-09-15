import * as ImageManipulator from "expo-image-manipulator";

export async function compressImage(uri) {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 800 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return manipResult.uri;
}
