Reference Documentation

Here's a comprehensive reference document you can save:
Firebase iOS Build Fix - React Native Expo Reference

Date: September 16, 2025
Project: BuildBharatMart (React Native 0.79.6 + Expo SDK 53)
Issue: Firebase Swift header integration with EAS builds
Problem Summary

    Error: 'FirebaseAuth/FirebaseAuth-Swift.h' file not found

    Root Cause: EAS managed builds override Podfile settings and force static frameworks

    Firebase Requirement: Swift Firebase pods need dynamic frameworks or modular headers

    Conflict: EAS static framework override vs Firebase Swift integration needs

Solution: expo-build-properties Plugin
Step 1: Install Plugin

bash
npx expo install expo-build-properties

Step 2: Update app.config.js

Add this to your plugins array (FIRST in the list):

javascript
export default {
expo: {
plugins: [
[
"expo-build-properties",
{
ios: {
useFrameworks: "dynamic",
},
},
],
// ... other plugins
],
},
};

Step 3: Clean and Build

bash

# Clean everything

rm -rf node_modules ios android .expo
npm install

# Build with EAS

eas build -p ios --profile development --local

Key Success Indicators

    Log shows: Framework build type is dynamic framework

    Firebase logs: ✅ Firebase app available

    No "Swift pods cannot yet be integrated as static libraries" errors

What NOT to Do

❌ Don't manually add Firebase pods to Podfile (autolinking handles this)
❌ Don't use use_modular_headers! globally (causes conflicts with Expo)
❌ Don't run npx expo prebuild --clean after manual Podfile changes (overwrites config)
Alternative Search Terms for Future Reference

    "expo build properties useFrameworks dynamic Firebase iOS"

    "EAS build Firebase static framework override"

    "Firebase Swift pods cannot yet be integrated as static libraries"

    "react-native-firebase iOS build expo managed workflow"

Package Versions (Working Configuration)

    Expo SDK: 53.0.22

    React Native: 0.79.6

    @react-native-firebase/app: 22.4.0

    expo-build-properties: ~0.14.8

Final Podfile (Reference Only - Auto-generated)

ruby

# This gets auto-generated - don't modify manually

target 'BuildBharatMart' do
use_expo_modules!
use_frameworks! :linkage => :dynamic # Set by expo-build-properties

# Firebase dependencies auto-linked via @react-native-firebase packages

end

####### podfile used for firebase v22 upgrade
require File.join(File.dirname(`node --print "require.resolve('expo/package.json')"`), "scripts/autolinking")
require File.join(File.dirname(`node --print "require.resolve('react-native/package.json')"`), "scripts/react_native_pods")

require 'json'
podfile_properties = JSON.parse(File.read(File.join(**dir**, 'Podfile.properties.json'))) rescue {}

ENV['RCT_NEW_ARCH_ENABLED'] = '0' if podfile_properties['newArchEnabled'] == 'false'
ENV['EX_DEV_CLIENT_NETWORK_INSPECTOR'] = podfile_properties['EX_DEV_CLIENT_NETWORK_INSPECTOR']

platform :ios, podfile_properties['ios.deploymentTarget'] || '15.1'
install! 'cocoapods', :deterministic_uuids => false

prepare_react_native_project!

target 'BuildBharatMart' do
use_expo_modules!

# CRITICAL: Dynamic frameworks (NO static, NO modular headers)

use_frameworks! :linkage => :dynamic

if ENV['EXPO_USE_COMMUNITY_AUTOLINKING'] == '1'
config_command = ['node', '-e', "process.argv=['', '', 'config'];require('@react-native-community/cli').run()"]
else
config_command = [
'npx',
'expo-modules-autolinking',
'react-native-config',
'--json',
'--platform',
'ios'
]
end

config = use_native_modules!(config_command)

use_react_native!(
:path => config[:reactNativePath],
:hermes_enabled => podfile_properties['expo.jsEngine'] == nil || podfile_properties['expo.jsEngine'] == 'hermes',
:app_path => "#{Pod::Config.instance.installation_root}/..",
:privacy_file_aggregation_enabled => podfile_properties['apple.privacyManifestAggregationEnabled'] != 'false'
)

post_install do |installer|
react_native_post_install(
installer,
config[:reactNativePath],
:mac_catalyst_enabled => false,
:ccache_enabled => podfile_properties['apple.ccacheEnabled'] == 'true'
)

    installer.target_installation_results.pod_target_installation_results.each do |pod_name, target_installation_result|
      target_installation_result.resource_bundle_targets.each do |resource_bundle_target|
        resource_bundle_target.build_configurations.each do |config|
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        end
      end
    end

    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = podfile_properties['ios.deploymentTarget'] || '15.1'
      end
    end

end
end

################# Podfile end

Success Confirmation

✅ Build completes without Firebase Swift header errors
✅ App launches on iOS simulator/device
✅ Firebase services initialize: Auth, Firestore, Storage
✅ Development client with hot reload works

Note: This solution works specifically for Expo managed workflow with EAS builds. For bare React Native projects, manual Podfile configuration may be different.
