import { useContext } from "react";
import UserCard from "./UserCard";
import { AuthContext } from "../../store/auth-context";
import { useI18n } from "../../store/i18n-context";

function UserOrdersCard({ navigation }) {
  const { t } = useI18n();
  const { isAuthenticated } = useContext(AuthContext);

  function handleCardPress() {
    if (!isAuthenticated) {
      // Could show a login prompt here
      return;
    }
    navigation.navigate("OrdersScreen");
  }

  return (
    <UserCard
      icon="cube"
      title={t("user.myOrders")}
      subtitle={t("user.viewOrderHistory")}
      onPress={handleCardPress}
    />
  );
}

export default UserOrdersCard;
