import { useState, useContext } from "react";
import { View, StyleSheet } from "react-native";

import SidebarMenu from "./SidebarMenu";

import MenuContent from "./MenuContent";
import useFetchMenuItems from "./FetchMenuItems"; // <-- Import the hook
import { SafeAreaWrapper } from "../UI/SafeAreaWrapper";
import { CartContext } from "../../store/cart-context";
import { AuthContext } from "../../store/auth-context";
// import { MENU_ITEMS } from "../../data/menu-items";

function MenuScreenOutput({ onSignUpPress }) {
  const [selected, setSelected] = useState("categories"); // Default to categories for better UX
  const { menuItems, loading } = useFetchMenuItems(); // <-- Use the hook
  const cartCtx = useContext(CartContext);
  const authCtx = useContext(AuthContext);
  const sortedMenuItems = [...menuItems].sort((a, b) => a.id - b.id);

  // Calculate cart total
  const cartTotal = cartCtx.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // console.log("Menu Items: ", menuItems);

  return (
    <SafeAreaWrapper
      edges={["right"]} // Only preserve right edge, allow full height and left edge usage
      backgroundColor="#f3f7f7"
    >
      <View style={styles.root}>
        <SidebarMenu
          menuItems={sortedMenuItems}
          selected={selected}
          onSelect={setSelected}
          loading={loading}
        />
        <View style={styles.separator} />
        <MenuContent
          selected={selected}
          cartTotal={cartTotal}
          userId={authCtx.userId}
          onSignUpPress={onSignUpPress}
        />
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f3f7f7", // Ensure consistent background
    minHeight: "100%", // Ensure full height usage
  },
  separator: {
    width: 1,
    backgroundColor: "#E0E0E0", // Subtle separator line
    opacity: 0.5,
  },
});

export default MenuScreenOutput;
