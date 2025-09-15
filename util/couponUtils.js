import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  increment,
  arrayUnion,
  getDoc,
} from "@react-native-firebase/firestore";
import { db } from "./firebaseConfig";

// Validate and apply coupon
export const validateAndApplyCoupon = async (couponCode, orderData, userId) => {
  try {
    // console.log("🎫 Starting coupon validation for:", couponCode);
    // console.log("📦 Order data:", orderData);
    // console.log("👤 User ID:", userId);

    // Fetch coupon from Firestore
    const couponsCollection = collection(db, "coupons");
    const q = query(couponsCollection, where("code", "==", couponCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("❌ Coupon not found");
      return {
        isValid: false,
        error: "Coupon not found",
      };
    }

    const couponDoc = querySnapshot.docs[0];
    const coupon = couponDoc.data();

    // console.log("🎫 Coupon found:", JSON.stringify(coupon, null, 2));

    // Check if coupon is active
    if (!coupon.isActive) {
      console.log("❌ Coupon not active");
      return {
        isValid: false,
        error: "This coupon is not currently active",
      };
    }

    // Check usage limit
    if (
      coupon.usageLimit !== null &&
      coupon.usageLimit <= (coupon.currentUsage || 0)
    ) {
      console.log("❌ Coupon usage limit exceeded");
      return {
        isValid: false,
        error: "This coupon has reached its usage limit",
      };
    }

    // Check expiry date
    const currentDate = new Date();
    if (coupon.expiryDate) {
      const expiryDate = coupon.expiryDate.toDate
        ? coupon.expiryDate.toDate()
        : new Date(coupon.expiryDate);
      if (currentDate > expiryDate) {
        console.log("❌ Coupon expired");
        return {
          isValid: false,
          error: "This coupon has expired",
        };
      }
    }

    // Check user eligibility - HANDLE EMPTY STRINGS
    if (coupon.specificUsers && coupon.specificUsers.length > 0) {
      console.log("👥 Checking user eligibility...");
      console.log("Specific users:", coupon.specificUsers);
      console.log("Current user ID:", userId);

      // Filter out empty strings and null values
      const validUserIds = coupon.specificUsers.filter(
        (id) => id && id.trim() !== ""
      );

      if (validUserIds.length > 0 && !validUserIds.includes(userId)) {
        console.log("❌ User not eligible for this coupon");
        return {
          isValid: false,
          error: "This coupon is not available for your account",
        };
      } else {
        console.log("✅ User is eligible");
      }
    } else {
      console.log("✅ Coupon available for all users");
    }

    // Check minimum order amount
    if (
      coupon.minimumOrderAmount > 0 &&
      orderData.subtotal < coupon.minimumOrderAmount
    ) {
      console.log("❌ Minimum order amount not met");
      return {
        isValid: false,
        error: `Minimum order amount of ₹${coupon.minimumOrderAmount} required`,
      };
    }

    // Check category restrictions - FLEXIBLE MATCHING
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      console.log("� Checking category restrictions...");
      console.log("Applicable categories:", coupon.applicableCategories);
      console.log(
        "Order items categories:",
        orderData.items.map((item) => item.category)
      );

      const hasApplicableItems = orderData.items.some((item) => {
        if (!item.category) return false;

        const itemCategory = item.category.toLowerCase();

        return coupon.applicableCategories.some((applicableCategory) => {
          const applicable = applicableCategory.toLowerCase();

          // Exact match
          if (itemCategory === applicable) return true;

          // Check if item category contains applicable category
          if (itemCategory.includes(applicable)) return true;

          // Check if applicable category contains item category
          if (applicable.includes(itemCategory)) return true;

          return false;
        });
      });

      if (!hasApplicableItems) {
        console.log("❌ No applicable items in cart");
        return {
          isValid: false,
          error: "Coupon not applicable to items in your cart",
        };
      } else {
        console.log("✅ Found applicable items");
      }
    }

    // Check excluded categories - FLEXIBLE MATCHING
    if (coupon.excludedCategories && coupon.excludedCategories.length > 0) {
      console.log("🚫 Checking excluded categories...");
      const hasExcludedItems = orderData.items.some((item) => {
        if (!item.category) return false;

        const itemCategory = item.category.toLowerCase();

        return coupon.excludedCategories.some((excludedCategory) => {
          const excluded = excludedCategory.toLowerCase();

          // Exact match
          if (itemCategory === excluded) return true;

          // Check if item category contains excluded category
          if (itemCategory.includes(excluded)) return true;

          // Check if excluded category contains item category
          if (excluded.includes(itemCategory)) return true;

          return false;
        });
      });

      if (hasExcludedItems) {
        console.log("❌ Found excluded items");
        return {
          isValid: false,
          error: "Coupon not applicable due to excluded items",
        };
      } else {
        console.log("✅ No excluded items found");
      }
    }

    // Calculate discount - only on applicable items
    let discountAmount = 0;
    let applicableAmount = orderData.subtotal; // Default to full amount if no category restrictions

    // If there are category restrictions, calculate discount only on applicable items
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      applicableAmount = orderData.items.reduce((sum, item) => {
        if (!item.category) return sum;

        const itemCategory = item.category.toLowerCase();

        // Check if item is excluded
        const isExcluded =
          coupon.excludedCategories && coupon.excludedCategories.length > 0
            ? coupon.excludedCategories.some((excludedCategory) => {
                const excluded = excludedCategory.toLowerCase();
                return (
                  itemCategory === excluded ||
                  itemCategory.includes(excluded) ||
                  excluded.includes(itemCategory)
                );
              })
            : false;

        if (isExcluded) {
          console.log(
            `🚫 Excluding item "${item.productName}" (${item.category}) from discount`
          );
          return sum;
        }

        // Check if item is applicable
        const isApplicable = coupon.applicableCategories.some(
          (applicableCategory) => {
            const applicable = applicableCategory.toLowerCase();

            // Exact match
            if (itemCategory === applicable) return true;

            // Check if item category contains applicable category
            if (itemCategory.includes(applicable)) return true;

            // Check if applicable category contains item category
            if (applicable.includes(itemCategory)) return true;

            return false;
          }
        );

        if (isApplicable) {
          const itemTotal = item.price * item.quantity;
          console.log(
            `✅ Including item "${item.productName}" (${item.category}): ₹${itemTotal}`
          );
          return sum + itemTotal;
        } else {
          console.log(
            `❌ Excluding item "${item.productName}" (${item.category}) - not in applicable categories`
          );
        }

        return sum;
      }, 0);

      console.log(
        `💰 Applicable amount: ₹${applicableAmount} (out of ₹${orderData.subtotal} total)`
      );
    }

    if (coupon.discountType === "percentage") {
      discountAmount = (applicableAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else if (coupon.discountType === "fixed") {
      discountAmount = coupon.discountValue;
    } else if (coupon.discountType === "free_shipping") {
      // For free shipping, return shipping amount as discount
      const shippingCost = 50; // Standard shipping cost
      discountAmount = shippingCost;
    }

    // Ensure discount doesn't exceed applicable amount
    discountAmount = Math.min(discountAmount, applicableAmount);

    // console.log("✅ Coupon validation successful");
    // console.log("💰 Discount amount:", discountAmount);

    return {
      isValid: true,
      coupon: coupon,
      discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
    };
  } catch (error) {
    console.error("❌ Error validating coupon:", error);
    return {
      isValid: false,
      error: "Failed to validate coupon. Please try again.",
    };
  }
};

// Validate coupon conditions
async function validateCoupon(coupon, orderData, userId) {
  console.log("🔍 Starting validation for coupon:", coupon.code);
  console.log("👤 User ID:", userId);
  console.log("📋 Coupon details:", {
    specificUsers: coupon.specificUsers,
    newUsersOnly: coupon.newUsersOnly,
    applicableCategories: coupon.applicableCategories,
    excludedCategories: coupon.excludedCategories,
    minOrderAmount: coupon.minOrderAmount,
    maxOrderAmount: coupon.maxOrderAmount,
  });

  const now = new Date();

  // Check validity dates
  if (coupon.validFrom && coupon.validFrom.toDate() > now) {
    return { isValid: false, error: "Coupon is not yet valid" };
  }

  if (coupon.validUntil && coupon.validUntil.toDate() < now) {
    return { isValid: false, error: "Coupon has expired" };
  }

  // Check usage limits
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { isValid: false, error: "Coupon usage limit reached" };
  }

  // Check minimum order amount
  if (coupon.minOrderAmount && orderData.subtotal < coupon.minOrderAmount) {
    return {
      isValid: false,
      error: `Minimum order amount is ₹${coupon.minOrderAmount}`,
    };
  }

  // Check maximum order amount
  if (coupon.maxOrderAmount && orderData.subtotal > coupon.maxOrderAmount) {
    return {
      isValid: false,
      error: `Maximum order amount is ₹${coupon.maxOrderAmount}`,
    };
  }

  // Check new users only
  if (coupon.newUsersOnly && userId) {
    const isNewUser = await checkIfNewUser(userId);
    if (!isNewUser) {
      return { isValid: false, error: "This coupon is for new users only" };
    }
  }

  // Check specific users - FIX: Empty array or array with empty strings should allow all users
  if (coupon.specificUsers && coupon.specificUsers.length > 0) {
    // Filter out empty strings and check if there are actual user IDs
    const validUserIds = coupon.specificUsers.filter(
      (id) => id && id.trim() !== ""
    );

    if (validUserIds.length > 0) {
      console.log("🎯 Checking specific users restriction...");
      console.log("Valid user IDs:", validUserIds);
      if (!userId || !validUserIds.includes(userId)) {
        console.log("❌ User not in specific users list");
        return {
          isValid: false,
          error: "This coupon is not available for your account",
        };
      }
    } else {
      console.log(
        "✅ No valid user restrictions (array contains only empty strings)"
      );
    }
  } else {
    console.log("✅ No specific user restrictions (empty array or null)");
  }

  // Check user usage limit
  if (coupon.userUsageLimit && userId) {
    const userUsageCount = await getUserCouponUsage(coupon.id, userId);
    if (userUsageCount >= coupon.userUsageLimit) {
      return { isValid: false, error: "You have already used this coupon" };
    }
  }

  // Check applicable categories (if items have categories) - FLEXIBLE MATCHING
  if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
    console.log("🏷️ Checking applicable categories...");
    console.log("Required categories:", coupon.applicableCategories);
    console.log(
      "Order items:",
      orderData.items.map((item) => ({
        name: item.productName,
        category: item.category,
      }))
    );

    const hasApplicableItems = orderData.items.some((item) => {
      if (!item.category) return false;

      const itemCategory = item.category.toLowerCase();

      return coupon.applicableCategories.some((requiredCategory) => {
        const required = requiredCategory.toLowerCase();

        // Exact match
        if (itemCategory === required) return true;

        // Check if item category contains required category (e.g., "PAINTS" contains "paint")
        if (itemCategory.includes(required)) return true;

        // Check if required category contains item category (e.g., "paint" in "PAINTS")
        if (required.includes(itemCategory)) return true;

        return false;
      });
    });

    if (!hasApplicableItems) {
      console.log("❌ No applicable items found");
      console.log(
        "Category matching failed - item categories:",
        orderData.items.map((i) => i.category)
      );
      console.log("Required categories:", coupon.applicableCategories);
      return {
        isValid: false,
        error: "Coupon not applicable for selected items",
      };
    } else {
      console.log("✅ Found applicable items");
    }
  } else {
    console.log("✅ No category restrictions");
  }

  // Check excluded categories - FLEXIBLE MATCHING
  if (coupon.excludedCategories && coupon.excludedCategories.length > 0) {
    console.log("🚫 Checking excluded categories...");
    const hasExcludedItems = orderData.items.some((item) => {
      if (!item.category) return false;

      const itemCategory = item.category.toLowerCase();

      return coupon.excludedCategories.some((excludedCategory) => {
        const excluded = excludedCategory.toLowerCase();

        // Exact match
        if (itemCategory === excluded) return true;

        // Check if item category contains excluded category
        if (itemCategory.includes(excluded)) return true;

        // Check if excluded category contains item category
        if (excluded.includes(itemCategory)) return true;

        return false;
      });
    });

    if (hasExcludedItems) {
      console.log("❌ Found excluded items");
      return {
        isValid: false,
        error: "Coupon not applicable due to excluded items",
      };
    } else {
      console.log("✅ No excluded items found");
    }
  }

  return { isValid: true };
}

// Calculate discount amount
function calculateDiscount(coupon, subtotal) {
  let discountAmount = 0;

  switch (coupon.discountType) {
    case "percentage":
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
      break;

    case "fixed":
      discountAmount = coupon.discountValue;
      break;

    case "free_shipping":
      // This would be handled in shipping calculation
      discountAmount = 0;
      break;

    default:
      discountAmount = 0;
  }

  // Ensure discount doesn't exceed subtotal
  return Math.min(discountAmount, subtotal);
}

// Record coupon usage after successful order
export async function recordCouponUsage(couponId, userId = null, orderNumber) {
  try {
    const couponRef = doc(db, "coupons", couponId);

    // Update usage count
    await updateDoc(couponRef, {
      usageCount: increment(1),
      updatedAt: new Date(),
    });

    // Record user usage if user is logged in
    if (userId) {
      const userCouponRef = doc(db, "userCouponUsage", `${userId}_${couponId}`);

      // Check if document exists first
      const userCouponDoc = await getDoc(userCouponRef);

      if (userCouponDoc.exists()) {
        // Update existing document
        await updateDoc(userCouponRef, {
          usageCount: increment(1),
          lastUsed: new Date(),
          orderNumbers: arrayUnion(orderNumber),
        });
      } else {
        // Create new document
        await setDoc(userCouponRef, {
          usageCount: 1,
          lastUsed: new Date(),
          orderNumbers: [orderNumber],
          createdAt: new Date(),
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error recording coupon usage:", error);
    return { success: false, error: error.message };
  }
}

// Helper functions
async function checkIfNewUser(userId) {
  try {
    // Check if user has any previous orders
    const ordersRef = collection(db, "orders");
    const userOrdersQuery = query(ordersRef, where("userId", "==", userId));
    const ordersSnapshot = await getDocs(userOrdersQuery);

    return ordersSnapshot.empty;
  } catch (error) {
    console.error("Error checking if new user:", error);
    return false;
  }
}

async function getUserCouponUsage(couponId, userId) {
  try {
    const userCouponRef = doc(db, "userCouponUsage", `${userId}_${couponId}`);
    const userCouponDoc = await getDoc(userCouponRef);

    if (userCouponDoc.exists()) {
      return userCouponDoc.data().usageCount || 0;
    }

    return 0;
  } catch (error) {
    console.error("Error getting user coupon usage:", error);
    return 0;
  }
}

// Get available coupons for user
export async function getAvailableCoupons(
  userId = null,
  orderAmount = 0,
  showAllForListing = false
) {
  try {
    console.log(
      "🎫 Fetching available coupons for user:",
      userId,
      "order amount:",
      orderAmount,
      "showAllForListing:",
      showAllForListing
    );

    const couponsRef = collection(db, "coupons");

    // Simplified query to avoid index issues - just get active coupons
    const q = query(couponsRef, where("isActive", "==", true));

    const couponsSnapshot = await getDocs(q);
    const coupons = [];
    const now = new Date();

    console.log("📦 Found", couponsSnapshot.docs.length, "active coupons");

    for (const doc of couponsSnapshot.docs) {
      const coupon = { id: doc.id, ...doc.data() };

      console.log("🔍 Checking coupon:", coupon.code);

      // Filter expired coupons manually
      if (coupon.validUntil && coupon.validUntil.toDate() < now) {
        console.log("⏰ Coupon expired:", coupon.code);
        continue;
      }

      // Basic filtering - skip order amount checks when orderAmount is 0 (for coupon listing)
      console.log(
        `📊 Checking order amount filter: orderAmount=${orderAmount}, minOrderAmount=${coupon.minOrderAmount}`
      );

      if (orderAmount > 0) {
        if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
          console.log("💰 Order amount too low for:", coupon.code);
          continue;
        }

        if (coupon.maxOrderAmount && orderAmount > coupon.maxOrderAmount) {
          console.log("💰 Order amount too high for:", coupon.code);
          continue;
        }
      } else {
        console.log("📋 Skipping order amount checks for coupon listing");
      }

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        console.log("📊 Usage limit reached for:", coupon.code);
        continue;
      }

      // Check user-specific restrictions (skip if showing all for listing)
      if (userId && !showAllForListing) {
        if (coupon.userUsageLimit) {
          const userUsage = await getUserCouponUsage(coupon.id, userId);
          if (userUsage >= coupon.userUsageLimit) {
            console.log("👤 User usage limit reached for:", coupon.code);
            continue;
          }
        }

        if (coupon.newUsersOnly) {
          const isNewUser = await checkIfNewUser(userId);
          if (!isNewUser) {
            console.log("🆕 New users only restriction for:", coupon.code);
            continue;
          }
        }

        if (coupon.specificUsers && coupon.specificUsers.length > 0) {
          // Filter out empty strings and check if there are actual user IDs
          const validUserIds = coupon.specificUsers.filter(
            (id) => id && id.trim() !== ""
          );

          if (validUserIds.length > 0 && !validUserIds.includes(userId)) {
            console.log("🎯 Specific users restriction for:", coupon.code);
            continue;
          }
        }
      } else if (showAllForListing) {
        console.log("📋 Skipping user restrictions for coupon listing");
      }

      console.log("✅ Coupon passed all checks:", coupon.code);
      coupons.push(coupon);
    }

    console.log("🎉 Final coupons list:", coupons.length, "coupons");
    return { success: true, coupons };
  } catch (error) {
    console.error("❌ Error fetching available coupons:", error);
    return { success: false, error: error.message, coupons: [] };
  }
}
