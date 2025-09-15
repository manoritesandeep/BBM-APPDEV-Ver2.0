const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

function withFirebaseModularHeaders(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );

      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, "utf8");

        // Check if we already have modular headers configuration
        if (!podfileContent.includes("modular_headers")) {
          // Find the target block
          const targetRegex =
            /(target\s+['"][^'"]+['"][\s\S]*?do)([\s\S]*?)(end)/;
          const match = podfileContent.match(targetRegex);

          if (match) {
            const beforeTarget = podfileContent.substring(0, match.index);
            const targetStart = match[1];
            const targetBody = match[2];
            const targetEnd = match[3];
            const afterTarget = podfileContent.substring(
              match.index + match[0].length
            );

            // Add specific modular headers for Firebase pods
            const firebaseModularHeaders = `
  
  # Enable modular headers for Firebase pods
  pod 'FirebaseCore', :modular_headers => true
  pod 'FirebaseCoreInternal', :modular_headers => true
  pod 'FirebaseCoreExtension', :modular_headers => true
  pod 'FirebaseAppCheckInterop', :modular_headers => true
  pod 'FirebaseAuthInterop', :modular_headers => true
  pod 'GoogleUtilities', :modular_headers => true
  
`;

            podfileContent =
              beforeTarget +
              targetStart +
              firebaseModularHeaders +
              targetBody +
              targetEnd +
              afterTarget;

            fs.writeFileSync(podfilePath, podfileContent);
            console.log("✓ Added Firebase modular headers to Podfile");
          }
        }
      }

      return config;
    },
  ]);
}

module.exports = withFirebaseModularHeaders;
