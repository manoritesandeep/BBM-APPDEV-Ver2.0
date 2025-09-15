import {
  GOOGLE_MAPS_API_KEY,
  EXPO_PUBLIC_GOOGLE_MAPS_STATIC_API_URL,
  EXPO_PUBLIC_GOOGLE_MAPS_GEOCODING_API_URL,
} from "@env";

const GOOGLE_API_KEY = GOOGLE_MAPS_API_KEY;

export function getMapPreview(lat, lng) {
  const imagePreviewUrl = `${EXPO_PUBLIC_GOOGLE_MAPS_STATIC_API_URL}?center=${lat},${lng}&zoom=15&size=400x200&maptype=roadmap&markers=color:red%7Clabel:S%7C${lat},${lng}&key=${GOOGLE_API_KEY}`;
  return imagePreviewUrl;
}

// To reverse-geocode the coordinates.
// The below function can help with more robust address break down.
export async function getAddress(lat, lng) {
  const url = `${EXPO_PUBLIC_GOOGLE_MAPS_GEOCODING_API_URL}?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch address!");
  }

  const data = await response.json();
  // const address = data.results[0].formatted_address;
  // return address;

  if (!data.results || !data.results.length)
    throw new Error("No address found!");
  return data.results[0]; // Return the full result object
}

// // Return the full first result for structured parsing
// export async function getAddress(lat, lng) {
//   const url = `${EXPO_PUBLIC_GOOGLE_MAPS_GEOCODING_API_URL}?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;
//   const response = await fetch(url);
//   if (!response.ok) {
//     throw new Error("Failed to fetch address!");
//   }
//   const data = await response.json();
//   if (!data.results || !data.results.length) {
//     throw new Error("No address found!");
//   }
//   return data.results[0]; // Return the full result object
// }
