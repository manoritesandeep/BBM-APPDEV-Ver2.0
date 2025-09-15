import { View, StyleSheet, Dimensions } from "react-native";
import { isTablet } from "../../constants/responsive";

import TrackOrderContent from "./OrderTracking/TrackOrderContent";
import RentalsContent from "./RentalsContent/RentalsContent";
import ServicesContent from "./ServicesContent/ServicesContent";
import CustomerCareContent from "./CustomerCare/CustomerCareContent";
import TopPicksContent from "./TopPicks/TopPicksContent";
import CouponContent from "./CouponComponents/CouponContent";
import BBMBucksUserDetails from "./BBMBucksUserDetails/BBMBucksUserDetails";
import CategoryContent from "./CategoryComponents/CatergoryContent";
import AppFeedbackContent from "./AppFeedback/AppFeedbackContent";

const SCREEN_WIDTH = Dimensions.get("window").width;

function MenuContent({ selected, cartTotal, userId, onSignUpPress }) {
  return (
    <View style={styles.contentArea}>
      {selected === "topPicks" && <TopPicksContent />}
      {selected === "category" && <CategoryContent />}
      {selected === "track" && <TrackOrderContent />}
      {selected === "rentals" && <RentalsContent />}
      {selected === "services" && <ServicesContent />}
      {selected === "care" && <CustomerCareContent />}
      {selected === "coupon" && (
        <CouponContent userId={userId} cartTotal={cartTotal} />
      )}
      {selected === "bbmBucks" && (
        <BBMBucksUserDetails onSignUpPress={onSignUpPress} />
      )}
      {selected === "feedback" && <AppFeedbackContent />}
    </View>
  );
}

const styles = StyleSheet.create({
  contentArea: {
    flex: 1,
    // paddingTop: isTablet() ? 20 : 16, // Slightly more padding on tablets
    // paddingLeft: isTablet() ? 16 : 8, // Adaptive left padding based on device
    // paddingRight: isTablet() ? 24 : 16, // More right padding on larger screens
    // paddingBottom: isTablet() ? 20 : 16, // Adaptive bottom padding
    // justifyContent: "center",
    // alignItems: "center",
    // width: SCREEN_WIDTH > 600 ? 400 : "98%",
    minWidth: 0,
    backgroundColor: "transparent", // Ensure no background color conflicts
  },
});

export default MenuContent;
