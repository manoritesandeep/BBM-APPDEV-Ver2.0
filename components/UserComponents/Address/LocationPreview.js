import { View, Text, Image, StyleSheet } from "react-native";
import { getMapPreview } from "../../../util/location";
import { Colors } from "../../../constants/styles";

function LocationPreview({ address }) {
  if (!address) {
    return (
      <View style={styles.preview}>
        <Text>No address selected.</Text>
      </View>
    );
  }

  // You may want to store lat/lng in your address object for this to work.
  // Fallback to a static image or message if not available.
  const { lat, lng, label, line1, line2, city, state, zip, country } = address;

  let mapImage = null;
  if (lat && lng) {
    mapImage = (
      <Image
        style={styles.mapImage}
        source={{ uri: getMapPreview(lat, lng) }}
      />
    );
  }

  return (
    <View style={styles.preview}>
      {mapImage}
      <View style={styles.details}>
        <Text style={styles.label}>{label}</Text>
        <Text>{line1}</Text>
        {line2 ? <Text>{line2}</Text> : null}
        <Text>
          {city}, {state}, {country} - {zip}
        </Text>
      </View>
    </View>
  );
}

export default LocationPreview;

const styles = StyleSheet.create({
  preview: {
    backgroundColor: Colors.primary300,
    borderRadius: 12,
    padding: 1,
    marginBottom: 8,
    alignItems: "center",
  },
  mapImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  details: {
    alignItems: "center",
  },
  label: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 2,
  },
});
