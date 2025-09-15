import { useState } from "react";
import AddressesModal from "./Address/AddressesModal";
import UserCard from "./UserCard";
import { useI18n } from "../../store/i18n-context";

function UserAddressesCard({ navigation }) {
  const { t } = useI18n();
  const [modalVisible, setModalVisible] = useState(false);

  function handlePress() {
    setModalVisible(true);
  }

  return (
    <>
      <UserCard
        icon="location"
        title={t("user.myAddresses")}
        subtitle={t("user.manageAddresses")}
        onPress={handlePress}
      />
      <AddressesModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

export default UserAddressesCard;

// import UserCard from "./UserCard";

// function UserAddressesCard({ navigation }) {
//   function handlePress() {
//     // navigation.navigate("Addresses"); // Implement Addresses screen
//   }

//   return (
//     <UserCard
//       icon="location"
//       title="My Addresses"
//       subtitle="Manage your delivery addresses"
//       onPress={handlePress}
//     />
//   );
// }

// export default UserAddressesCard;
