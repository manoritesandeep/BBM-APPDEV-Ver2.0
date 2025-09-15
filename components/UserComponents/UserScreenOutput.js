// This is the main entry for authenticated users. It displays a list of cards for each account function.

import { StyleSheet, ScrollView } from "react-native";

import UserProfileCard from "./UserProfileCard";
import UserOrdersCard from "./UserOrdersCard";
import UserAddressesCard from "./UserAddressesCard";
import UserSavedItemsCard from "./SavedItems/UserSavedItemsCard";
import UserLogoutCard from "./UserLogoutCard";
import { Colors } from "../../constants/styles";
import UserSettings from "./UserSettings";

function UserScreenOutput({ navigation }) {
  // navigation is passed from UserScreen if needed for navigation

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ToDo: Pass navigation prop to cards that use it */}
      <UserProfileCard />
      <UserOrdersCard navigation={navigation} />
      <UserSavedItemsCard />
      <UserAddressesCard />
      <UserSettings />
      <UserLogoutCard />
      {/* Add more cards as needed */}
    </ScrollView>
  );
}

export default UserScreenOutput;

const styles = StyleSheet.create({
  container: {
    padding: 2,
    backgroundColor: Colors.primary300,
    flexGrow: 1,
  },
});
