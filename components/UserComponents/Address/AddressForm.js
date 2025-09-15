import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";

import LocationPicker from "./LocationPicker";
import { getAddress } from "../../../util/location";
import { useI18n } from "../../../store/i18n-context";

function AddressForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  const { t } = useI18n();
  const [label, setLabel] = useState(initialData?.label || "");
  const [line1, setLine1] = useState(initialData?.line1 || "");
  const [line2, setLine2] = useState(initialData?.line2 || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [state, setState] = useState(initialData?.state || "");
  const [zip, setZip] = useState(initialData?.zip || "");
  const [country, setCountry] = useState(initialData?.country || "");
  const [error, setError] = useState("");
  const [location, setLocation] = useState(null);

  // Reset form when initialData changes (new form vs edit form)
  useEffect(() => {
    setLabel(initialData?.label || "");
    setLine1(initialData?.line1 || "");
    setLine2(initialData?.line2 || "");
    setCity(initialData?.city || "");
    setState(initialData?.state || "");
    setZip(initialData?.zip || "");
    setCountry(initialData?.country || "");
    setError("");
    setLocation(null);
  }, [initialData]);

  async function handleSave() {
    if (!label || !line1 || !city || !state || !zip || !country) {
      setError(t("address.fillAllRequiredFields"));
      return;
    }
    setError("");

    const addressData = {
      id: initialData?.id || `${label.toLowerCase()}-${Date.now()}`,
      label,
      line1,
      line2,
      city,
      state,
      zip,
      country,
      lat: location?.lat || null,
      lng: location?.lng || null,
    };

    // Call onSubmit and let the parent handle the async operation
    await onSubmit(addressData);
  }

  // // When location changes, reverse-geocode and update fields
  useEffect(() => {
    async function fetchAddress() {
      if (location) {
        try {
          const addressObj = await getAddress(location.lat, location.lng);
          const components = addressObj.address_components || [];

          // Helper to get component by type(s)
          const getComponent = (types) =>
            components.find((c) => types.every((t) => c.types.includes(t)))
              ?.long_name || "";

          // Address Line 1: street_number + route, or premise, or subpremise
          let addressLine1 = "";
          const streetNumber = getComponent(["street_number"]);
          const route = getComponent(["route"]);
          if (streetNumber || route) {
            addressLine1 = [streetNumber, route].filter(Boolean).join(" ");
          } else {
            addressLine1 =
              getComponent(["premise"]) || getComponent(["subpremise"]) || "";
          }
          setLine1(addressLine1);

          // Address Line 2: neighborhood, sublocality, premise (if not used), admin_area_level_3
          let addressLine2 = [
            getComponent(["neighborhood"]),
            getComponent(["sublocality"]),
            getComponent(["sublocality_level_1"]),
            getComponent(["sublocality_level_2"]),
            getComponent(["sublocality_level_3"]),
            getComponent(["administrative_area_level_3"]),
          ]
            .filter((v, i, arr) => v && arr.indexOf(v) === i) // remove duplicates and empty
            .join(", ");
          setLine2(addressLine2);

          // City: locality, fallback to sublocality, admin_area_level_2
          setCity(
            getComponent(["locality"]) ||
              getComponent(["sublocality"]) ||
              getComponent(["administrative_area_level_2"]) ||
              ""
          );

          // State: admin_area_level_1
          setState(getComponent(["administrative_area_level_1"]) || "");

          // ZIP: postal_code
          setZip(getComponent(["postal_code"]) || "");

          // Country
          setCountry(getComponent(["country"]) || "");
        } catch (e) {
          console.log("Error parsing address in AddressForm.js: ", e);
        }
      }
    }
    fetchAddress();
  }, [location]);

  return (
    // <KeyboardAvoidingView
    //   behavior={Platform.OS === "ios" ? "padding" : "height"}
    //   style={{ flex: 1 }}
    //   keyboardVerticalOffset={80} // adjust as needed for your header/modal
    // >
    <ScrollView>
      <View style={styles.form}>
        <Text style={styles.title}>
          {initialData ? t("address.editAddress") : t("address.addAddress")}
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <LocationPicker onLocationPicked={setLocation} />

        <TextInput
          placeholder={t("address.labelPlaceholder")}
          value={label}
          onChangeText={setLabel}
          style={styles.input}
        />
        <TextInput
          placeholder={t("address.address1Placeholder")}
          value={line1}
          onChangeText={setLine1}
          style={styles.input}
        />
        <TextInput
          placeholder={t("address.address2Placeholder")}
          value={line2}
          onChangeText={setLine2}
          style={styles.input}
        />
        <TextInput
          placeholder={t("address.city")}
          value={city}
          onChangeText={setCity}
          style={styles.input}
        />
        <TextInput
          placeholder={t("address.state")}
          value={state}
          onChangeText={setState}
          style={styles.input}
        />
        <TextInput
          placeholder={t("address.zipCode")}
          value={zip}
          onChangeText={setZip}
          style={styles.input}
          keyboardType="numeric"
        />
        <TextInput
          placeholder={t("address.country")}
          value={country}
          onChangeText={setCountry}
          style={styles.input}
        />
        <View style={styles.row}>
          <Pressable
            style={[styles.saveBtn, isSubmitting && styles.disabledBtn]}
            onPress={handleSave}
            disabled={isSubmitting}
          >
            <Text style={styles.saveBtnText}>
              {isSubmitting ? t("address.saving") : t("common.save")}
            </Text>
          </Pressable>
          <Pressable
            style={styles.cancelBtn}
            onPress={onCancel}
            disabled={isSubmitting}
          >
            <Text>{t("common.cancel")}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
    // {/* </KeyboardAvoidingView> */}
  );
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  title: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  error: { color: "red", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  row: { flexDirection: "row", justifyContent: "flex-end" },
  saveBtn: {
    backgroundColor: "#2a9d8f",
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  disabledBtn: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  saveBtnText: { color: "#fff", fontWeight: "bold" },
  cancelBtn: { padding: 8 },
});

export default AddressForm;
