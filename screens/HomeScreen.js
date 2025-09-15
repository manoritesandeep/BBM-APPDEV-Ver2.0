import HomeScreenOutput from "../components/HomeComponents/HomeScreenOutput";

function HomeScreen(props) {
  // Any props received by HomeScreen (like navigation, route, etc. from React Navigation) are passed down to HomeScreenOutput.
  // This makes sure HomeScreenOutput has access to all the navigation and screen props it needs to function.

  return <HomeScreenOutput {...props} />;
}

export default HomeScreen;
