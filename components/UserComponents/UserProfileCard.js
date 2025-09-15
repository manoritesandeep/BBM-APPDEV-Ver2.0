import { useContext, useState } from "react";
import UserCard from "./UserCard";
import { UserContext } from "../../store/user-context";
import { AuthContext } from "../../store/auth-context";
import UserProfileModal from "./Profile/UserProfileModal";
import { useI18n } from "../../store/i18n-context";

function UserProfileCard() {
  const { t } = useI18n();
  const userCtx = useContext(UserContext);
  const authCtx = useContext(AuthContext);
  const user = userCtx.user || {};
  const name = user.name || t("user.defaultUserName");
  const email = user.email || "";
  const provider = authCtx.authProvider || "email";

  const [modalVisible, setModalVisible] = useState(false);

  function handlePress() {
    setModalVisible(true);
  }

  const getProviderIcon = () => {
    switch (provider) {
      case "google":
        return `🔗 ${t("auth.providerGoogle")}`;
      case "facebook":
        return `🔗 ${t("auth.providerFacebook")}`;
      case "apple":
        return `🔗 ${t("auth.providerApple")}`;
      default:
        return `✉️ ${t("auth.providerEmail")}`;
    }
  };

  return (
    <>
      <UserCard
        icon="person-circle"
        title={name}
        subtitle={`${email} • ${getProviderIcon()}`}
        onPress={handlePress}
      />
      <UserProfileModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

export default UserProfileCard;
