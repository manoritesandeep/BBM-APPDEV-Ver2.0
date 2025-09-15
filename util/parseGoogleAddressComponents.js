export function parseGoogleAddressComponents(addressComponents) {
  let street_number = "";
  let route = "";
  let city = "";
  let state = "";
  let zip = "";
  let country = "";

  addressComponents.forEach((component) => {
    if (component.types.includes("street_number")) {
      street_number = component.long_name;
    }
    if (component.types.includes("route")) {
      route = component.long_name;
    }
    if (component.types.includes("locality")) {
      city = component.long_name;
    }
    if (component.types.includes("administrative_area_level_1")) {
      state = component.short_name;
    }
    if (component.types.includes("postal_code")) {
      zip = component.long_name;
    }
    if (component.types.includes("country")) {
      country = component.long_name;
    }
  });

  return {
    line1: [street_number, route].filter(Boolean).join(" "),
    city,
    state,
    zip,
    country,
  };
}
