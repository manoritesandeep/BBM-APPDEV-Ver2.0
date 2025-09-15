const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withAppComponentFactory(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;

    // ensure manifest.$ exists and set tools namespace if missing
    manifest.manifest.$ = manifest.manifest.$ || {};
    if (!manifest.manifest.$["xmlns:tools"]) {
      manifest.manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";
    }

    // ensure application element exists
    manifest.manifest.application = manifest.manifest.application || [{}];
    const application = manifest.manifest.application[0];
    application.$ = application.$ || {};

    // request manifest merger to replace android:appComponentFactory and set empty value
    const replaceKey = "android:appComponentFactory";
    const existing = application.$["tools:replace"];
    application.$["tools:replace"] = existing
      ? `${existing},${replaceKey}`
      : replaceKey;
    // Use AndroidX CoreComponentFactory to avoid empty class name
    application.$["android:appComponentFactory"] =
      "androidx.core.app.CoreComponentFactory";

    config.modResults = manifest;
    return config;
  });
};

// const { withAndroidManifest } = require("@expo/config-plugins");

// module.exports = function withAppComponentFactory(config) {
//   return withAndroidManifest(config, async (config) => {
//     const manifest = config.modResults;

//     // ensure tools namespace on <manifest>
//     manifest.manifest.$ = manifest.manifest.$ || {};
//     manifest.manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";

//     // ensure application element exists and add attributes
//     const application =
//       manifest.manifest.application?.[0] ||
//       (manifest.manifest.application =
//         [{}] && manifest.manifest.application[0]);
//     application.$ = application.$ || {};
//     // ask manifest merger to replace the attribute and set it empty
//     application.$["tools:replace"] =
//       (application.$["tools:replace"]
//         ? application.$["tools:replace"] + ","
//         : "") + "android:appComponentFactory";
//     application.$["android:appComponentFactory"] = "";

//     config.modResults = manifest;
//     return config;
//   });
// };
