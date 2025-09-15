import { Image, Text, StyleSheet, View } from "react-native";

import { Colors } from "../../../constants/styles";

function ImagePreview({ pickedImage, profilePhotoUrl }) {
  let imagePreview = <Text>No image selected yet.</Text>;
  if (pickedImage) {
    imagePreview = <Image style={styles.image} source={{ uri: pickedImage }} />;
  } else if (profilePhotoUrl) {
    imagePreview = (
      <Image style={styles.image} source={{ uri: profilePhotoUrl }} />
    );
  }

  return <View style={styles.imagePreview}>{imagePreview}</View>;
}

export default ImagePreview;

const styles = StyleSheet.create({
  imagePreview: {
    width: 200,
    height: 200,
    marginVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary100,
    borderRadius: 70,
    overflow: "hidden",
    alignSelf: "center",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 70,
    resizeMode: "cover",
  },
});
