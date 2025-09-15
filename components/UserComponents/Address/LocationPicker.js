import { useState } from "react";
import {
  StyleSheet,
  View,
  Alert,
  Image,
  Text,
  Modal,
  Pressable,
  Platform,
  Linking,
} from "react-native";
import {
  getCurrentPositionAsync,
  useForegroundPermissions,
  PermissionStatus,
} from "expo-location";
import { Ionicons } from "@expo/vector-icons";

import OutlinedButton from "../../UI/OutlinedButton";
import { Colors } from "../../../constants/styles";
import { getMapPreview } from "../../../util/location";
import Map from "./Map";
import { useToast } from "../../UI/ToastProvider";
// import { getAddress } from "../../../util/location";
// import IconButton from "../../UI/IconButton";

function LocationPicker({ onLocationPicked }) {
  const [pickedLocation, setPickedLocation] = useState();
  const [showMap, setShowMap] = useState(false);
  const [mapPickedLocation, setMapPickedLocation] = useState();
  const [isMapLoading, setIsMapLoading] = useState(false);
  const { showToast } = useToast();

  const [locationPermissionInformation, requestPermission] =
    useForegroundPermissions();

  async function verifyPermissions() {
    if (
      locationPermissionInformation.status === PermissionStatus.UNDETERMINED
    ) {
      const permissionResponse = await requestPermission();
      return permissionResponse.granted;
    }

    if (locationPermissionInformation.status === PermissionStatus.DENIED) {
      // Show alert with options to open settings or try again
      Alert.alert(
        "Location Permission Required",
        "This app needs location permission to help you find nearby locations and set delivery addresses. Would you like to:",
        [
          {
            text: "Open Settings",
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            },
          },
          {
            text: "Try Again",
            onPress: async () => {
              const permissionResponse = await requestPermission();
              if (!permissionResponse.granted) {
                showToast(
                  "Location permission is required for this feature",
                  "warning"
                );
              }
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
      return false;
    }

    return true;
  }

  async function getLocationHandler() {
    const hasPermission = await verifyPermissions();

    if (!hasPermission) {
      return;
    }

    const location = await getCurrentPositionAsync();
    // console.log("Location: ", location);
    const coords = {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
    setPickedLocation(coords);
    if (onLocationPicked) {
      onLocationPicked(coords);
    }
  }

  function pickOnMapHandler() {
    try {
      setMapPickedLocation(undefined); // Reset previous selection
      setIsMapLoading(true);

      // Add delay for Android to prevent crashes
      if (Platform.OS === "android") {
        setTimeout(() => {
          setShowMap(true);
          setIsMapLoading(false);
        }, 300);
      } else {
        setShowMap(true);
        setIsMapLoading(false);
      }
    } catch (error) {
      console.error("Error opening map:", error);
      setIsMapLoading(false);
      showToast("Could not open map. Please try again.", "error");
    }
  }

  function handleMapClose() {
    setShowMap(false);
    setIsMapLoading(false);
  }

  function handleSaveLocation() {
    if (!mapPickedLocation) {
      showToast(
        "Please pick a location by tapping on the map first!",
        "warning"
      );
      return;
    }
    // console.log("Picked Location:", mapPickedLocation);
    setPickedLocation(mapPickedLocation);
    setShowMap(false);
    setIsMapLoading(false);
    if (onLocationPicked) {
      onLocationPicked(mapPickedLocation);
    }
    showToast("Location selected successfully!", "success");
  }

  let locationPreview = <Text>No location selected yet.</Text>;

  if (pickedLocation) {
    locationPreview = (
      <Image
        source={{
          uri: getMapPreview(pickedLocation.lat, pickedLocation.lng),
        }}
        style={styles.mapPreviewImage}
      />
    );
  }

  return (
    <View>
      <Modal visible={showMap} animationType="slide">
        <View style={styles.modalHeader}>
          <Pressable onPress={handleMapClose} style={styles.backButton}>
            <Ionicons name="arrow-back-circle" size={36} color="#222" />
          </Pressable>

          <Text style={styles.headerTitle}>Pick Location</Text>

          <Pressable onPress={handleSaveLocation} style={styles.saveButton}>
            <Ionicons name="checkmark-circle" size={36} color="black" />
            {/* Update buttons to use IconButton component */}
            {/* <IconButton icon="checkmark-circle" size={36} color="black" /> */}
          </Pressable>
        </View>
        <View style={{ flex: 1 }}>
          <Map
            selectedLocation={mapPickedLocation}
            onLocationPick={setMapPickedLocation}
          />
        </View>
      </Modal>

      <View style={styles.mapPreview}>{locationPreview}</View>
      <View style={styles.actions}>
        <OutlinedButton
          icon="location"
          onPress={getLocationHandler}
          style={styles.actionButton}
        >
          Locate User
        </OutlinedButton>
        <OutlinedButton
          icon="map"
          onPress={pickOnMapHandler}
          style={styles.actionButton}
          disabled={isMapLoading}
        >
          {isMapLoading ? "Loading..." : "Pick on Map"}
        </OutlinedButton>
      </View>
    </View>
  );
}

export default LocationPicker;

const styles = StyleSheet.create({
  mapPreview: {
    width: "100%",
    height: 200,
    marginVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary100,
    borderRadius: 24,
    overflow: "hidden",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  mapPreviewImage: {
    width: "100%",
    height: "100%",
    // borderRadius: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    // borderTopLeftRadius: 18,
    // borderTopRightRadius: 18,
    position: "relative",
    backgroundColor: Colors.primary300,
  },
  backButton: {
    position: "absolute",
    left: 10,
    top: 45,
    zIndex: 2,
    padding: 4,
    backgroundColor: Colors.primary50,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    letterSpacing: 0.5,
  },
  saveButton: {
    position: "absolute",
    right: 10,
    top: 45,
    zIndex: 2,
    padding: 4,
    backgroundColor: Colors.primary50,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 2,
  },
});
