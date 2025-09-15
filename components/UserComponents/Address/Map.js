import { StyleSheet, Platform } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useEffect, useState } from "react";
import { useToast } from "../../UI/ToastProvider";

function Map({ selectedLocation, onLocationPick }) {
  const [mapReady, setMapReady] = useState(false);
  const { showToast } = useToast();

  const region = {
    latitude: 37.78,
    longitude: -122.43,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  useEffect(() => {
    // Add a small delay for Android to ensure proper initialization
    if (Platform.OS === "android") {
      const timer = setTimeout(() => {
        setMapReady(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setMapReady(true);
    }
  }, []);

  function selectLocationHandler(event) {
    try {
      const lat = event.nativeEvent.coordinate.latitude;
      const lng = event.nativeEvent.coordinate.longitude;
      onLocationPick({ lat, lng });
    } catch (error) {
      console.error("Error selecting location:", error);
      showToast("Could not select location. Please try again.", "error");
    }
  }

  function onMapReady() {
    setMapReady(true);
  }

  if (!mapReady && Platform.OS === "android") {
    return null; // or a loading indicator
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={region}
      onPress={selectLocationHandler}
      onMapReady={onMapReady}
      showsUserLocation={true}
      showsMyLocationButton={true}
      toolbarEnabled={false}
      moveOnMarkerPress={false}
      pitchEnabled={true}
      rotateEnabled={true}
      scrollEnabled={true}
      zoomEnabled={true}
    >
      {selectedLocation && (
        <Marker
          title="Picked Location"
          coordinate={{
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lng,
          }}
        />
      )}
    </MapView>
  );
}

export default Map;

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

// import { useState } from "react";
// import { Alert, StyleSheet } from "react-native";
// import MapView, { Marker } from "react-native-maps";

// function Map() {
//   const [selectedLocation, setSelectedLocation] = useState();

//   const region = {
//     latitude: 37.78,
//     longitude: -122.43,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   };

//   function selectLocationHandler(event) {
//     // console.log("Event Map: ", event);
//     const lat = event.nativeEvent.coordinate.latitude;
//     const lng = event.nativeEvent.coordinate.longitude;

//     setSelectedLocation({ lat: lat, lng: lng });
//   }

//   function savePickedLocationHandler() {
//     if (!selectedLocation) {
//       Alert.alert(
//         "No location picked!",
//         "Please pick a location (by tapping on the map) first!"
//       );
//       return;
//     }

//     // // navigate to the address form and send latitude and longitude
//     // // sample: navigation.navigate("Add Place", {pickedLat: selectedLocation.lat, pickedLng: selectedLocation.lng})
//   }

//   return (
//     <MapView
//       style={styles.map}
//       initialRegion={region}
//       onPress={selectLocationHandler}
//     >
//       {selectedLocation && (
//         <Marker
//           title="Picked Location"
//           coordinate={{
//             latitude: selectedLocation.lat,
//             longitude: selectedLocation.lng,
//           }}
//         />
//       )}
//     </MapView>
//   );
// }

// export default Map;

// const styles = StyleSheet.create({
//   map: {
//     flex: 1,
//   },
// });
