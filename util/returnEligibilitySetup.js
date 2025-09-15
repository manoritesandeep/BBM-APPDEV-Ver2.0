// Script to update some products with return eligibility for demo purposes
// This would typically be run once to add return fields to existing products

import { db } from "../firebaseConfig";
import {
  collection,
  query,
  limit,
  getDocs,
  updateDoc,
  doc,
} from "@react-native-firebase/firestore";

/**
 * Sample script to add return eligibility to some products
 * This demonstrates how products would be configured for returns
 */
export async function addReturnEligibilityToSampleProducts() {
  try {
    console.log("🔄 Adding return eligibility to sample products...");

    // Get some sample products from the products collection
    const productsRef = collection(db, "products");
    const q = query(productsRef, limit(20)); // Get first 20 products
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("No products found in Firestore. Using local data for demo.");
      return;
    }

    const updates = [];
    let count = 0;

    snapshot.docs.forEach((docSnapshot, index) => {
      const product = docSnapshot.data();

      // Configure different return policies for different product types
      let isReturnable = true;
      let returnWindow = 7; // Default 7 days

      // Customize based on product category
      if (product.category) {
        const category = product.category.toLowerCase();

        // Paint products - shorter return window due to custom mixing
        if (category.includes("paint")) {
          returnWindow = 3; // 3 days for paints
        }

        // LED Mirrors - longer return window for higher value items
        else if (
          category.includes("led mirror") ||
          category.includes("mirror")
        ) {
          returnWindow = 14; // 14 days for mirrors
        }

        // Hardware items - standard return window
        else if (
          category.includes("hardware") ||
          category.includes("fitting")
        ) {
          returnWindow = 7;
        }

        // Some items might not be returnable (hygiene/safety items)
        else if (
          category.includes("sanitaryware") ||
          category.includes("hygiene")
        ) {
          isReturnable = false;
          returnWindow = 0;
        }
      }

      // Create update object
      const updateData = {
        isReturnable,
        returnWindow,
        updatedAt: new Date(),
      };

      updates.push({
        id: docSnapshot.id,
        data: updateData,
      });

      count++;
    });

    // Apply updates
    for (const update of updates) {
      await updateDoc(doc(db, "products", update.id), update.data);
    }

    console.log(
      `✅ Successfully updated ${count} products with return eligibility`
    );

    // Log sample of what was updated
    console.log("📋 Sample return configurations:");
    console.log("• Paint products: 3 days return window");
    console.log("• LED Mirrors: 14 days return window");
    console.log("• Hardware items: 7 days return window");
    console.log("• Sanitaryware: Not returnable");

    return { success: true, updatedCount: count };
  } catch (error) {
    console.error("❌ Error updating products with return eligibility:", error);
    throw error;
  }
}

/**
 * Sample return eligibility configurations for demo
 * This shows how different products could be configured
 */
export const SAMPLE_RETURN_CONFIGS = {
  // High-value items - longer return window
  mirrors: {
    isReturnable: true,
    returnWindow: 14,
    reason: "Higher value items get longer return window",
  },

  // Paint products - shorter window due to custom mixing
  paints: {
    isReturnable: true,
    returnWindow: 3,
    reason: "Custom mixed paints have shorter return window",
  },

  // Standard hardware - normal return window
  hardware: {
    isReturnable: true,
    returnWindow: 7,
    reason: "Standard return policy for hardware items",
  },

  // Hygiene/sanitary items - not returnable
  sanitaryware: {
    isReturnable: false,
    returnWindow: 0,
    reason: "Hygiene items cannot be returned for health reasons",
  },

  // Tools and equipment - longer window for testing
  tools: {
    isReturnable: true,
    returnWindow: 10,
    reason: "Tools need more time for proper testing",
  },
};

/**
 * Function to apply return config to a specific product
 */
export function getReturnConfigForProductCategory(category) {
  if (!category) return SAMPLE_RETURN_CONFIGS.hardware; // Default

  const cat = category.toLowerCase();

  if (cat.includes("mirror")) return SAMPLE_RETURN_CONFIGS.mirrors;
  if (cat.includes("paint")) return SAMPLE_RETURN_CONFIGS.paints;
  if (cat.includes("sanitaryware") || cat.includes("hygiene"))
    return SAMPLE_RETURN_CONFIGS.sanitaryware;
  if (
    cat.includes("tool") ||
    cat.includes("drill") ||
    cat.includes("equipment")
  )
    return SAMPLE_RETURN_CONFIGS.tools;

  return SAMPLE_RETURN_CONFIGS.hardware; // Default for other categories
}
