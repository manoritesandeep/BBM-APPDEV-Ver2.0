import React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useI18n } from "../../store/i18n-context";

import UserCard from "./UserCard";

function UserSettings() {
  const navigation = useNavigation();
  const { t } = useI18n();

  function handleSettingsCardPress() {
    navigation.navigate("UserSettingsOutput");
  }

  return (
    <View>
      <UserCard
        icon="settings"
        title={t("user.settings")}
        subtitle={t("user.languageOptions") + ", " + t("user.themeOptions")}
        onPress={handleSettingsCardPress}
      />
    </View>
  );
}

export default UserSettings;
