import { View, StyleSheet } from "react-native";

import OutlinedButton from "../../UI/OutlinedButton";
import { spacing } from "../../../constants/responsive";

function ImageUploadButtons({ onTakeImage, onUploadImage, uploading }) {
  return (
    <View style={styles.buttons}>
      <OutlinedButton icon="camera" onPress={onTakeImage}>
        Take Image
      </OutlinedButton>
      <OutlinedButton
        icon="cloud-upload"
        onPress={onUploadImage}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </OutlinedButton>
    </View>
  );
}

export default ImageUploadButtons;

const styles = StyleSheet.create({
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
});
