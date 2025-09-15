import MenuScreenOutput from "../components/MenuComponents/MenuScreenOutput";

function MenuScreen({ navigation }) {
  const handleSignUpPress = () => {
    // Navigate to the User tab which shows UnifiedAuthScreen for unauthenticated users
    navigation.navigate("UserScreen");
  };

  return <MenuScreenOutput onSignUpPress={handleSignUpPress} />;
}

export default MenuScreen;
