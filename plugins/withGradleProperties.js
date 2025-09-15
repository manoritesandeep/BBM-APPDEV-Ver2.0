const { withGradleProperties } = require("@expo/config-plugins");

module.exports = function withAndroidXGradleProperties(config) {
  return withGradleProperties(config, (config) => {
    config.modResults = config.modResults || [];

    const setProp = (key, value) => {
      const idx = config.modResults.findIndex(
        (r) => r.key === key && r.type === "property"
      );
      const entry = { type: "property", key, value };
      if (idx === -1) {
        config.modResults.push(entry);
      } else {
        config.modResults[idx].value = value;
      }
    };

    setProp("android.useAndroidX", "true");
    setProp("android.enableJetifier", "true");

    return config;
  });
};

// const { withGradleProperties } = require("@expo/config-plugins");

// module.exports = function withAndroidXGradleProperties(config) {
//   return withGradleProperties(config, (config) => {
//     config.modResults = config.modResults || [];
//     const set = (key, value) => {
//       const idx = config.modResults.findIndex((r) => r.key === key);
//       if (idx === -1) config.modResults.push({ key, value });
//       else config.modResults[idx].value = value;
//     };
//     set("android.useAndroidX", "true");
//     set("android.enableJetifier", "true");
//     return config;
//   });
// };
