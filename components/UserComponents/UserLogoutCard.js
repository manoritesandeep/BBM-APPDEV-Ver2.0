import { useContext } from "react";
import UserCard from "./UserCard";
import { AuthContext } from "../../store/auth-context";
import { UserContext } from "../../store/user-context";
import { useI18n } from "../../store/i18n-context";

function UserLogoutCard() {
  const { t } = useI18n();
  const authCtx = useContext(AuthContext);
  const userCtx = useContext(UserContext);
  const name =
    userCtx.user?.name || userCtx.user?.email || t("user.defaultUserName");

  function handlePress() {
    authCtx.logout();
    userCtx.clearUser();
  }

  return (
    <UserCard
      icon="exit"
      title={t("user.logoutUser", { userName: name })}
      subtitle={t("user.signOutAccount")}
      onPress={handlePress}
      style={{ backgroundColor: "#ffeaea" }}
    />
  );
}

export default UserLogoutCard;
