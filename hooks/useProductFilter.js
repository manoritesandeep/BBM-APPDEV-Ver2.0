// Filter Hook - Custom hook for easy filter integration
import { useContext } from "react";
import { FilterContext } from "../../store/filter-context";

export function useProductFilter() {
  const context = useContext(FilterContext);

  if (!context) {
    throw new Error(
      "useProductFilter must be used within a FilterContextProvider"
    );
  }

  return context;
}

// Filter utilities
export const filterUtils = {
  // Get filter summary text
  getFilterSummary: (activeFilters, filterConfigs) => {
    const filterCount = Object.keys(activeFilters).length;
    if (filterCount === 0) return "All products";

    const descriptions = [];
    Object.entries(activeFilters).forEach(([filterType, values]) => {
      if (values && values.length > 0) {
        const config = filterConfigs[filterType];
        if (config) {
          if (values.length === 1) {
            descriptions.push(`${config.label}: ${values[0]}`);
          } else {
            descriptions.push(`${config.label}: ${values.length} selected`);
          }
        }
      }
    });

    return descriptions.join(", ");
  },

  // Check if filters are empty
  hasActiveFilters: (activeFilters) => {
    return Object.values(activeFilters).some(
      (values) => values && values.length > 0
    );
  },

  // Get active filter count
  getActiveFilterCount: (activeFilters) => {
    return Object.values(activeFilters).reduce((total, values) => {
      return total + (values ? values.length : 0);
    }, 0);
  },

  // Format filter value for display
  formatFilterValue: (filterType, value) => {
    switch (filterType) {
      case "rating":
        return `${value}+ Stars`;
      case "discount":
        return `${value}% off`;
      case "availability":
        const availabilityLabels = {
          inStock: "In Stock",
          lowStock: "Low Stock",
          outOfStock: "Out of Stock",
        };
        return availabilityLabels[value] || value;
      case "rentable":
        return value ? "Rentable" : "Purchase Only";
      default:
        return value;
    }
  },

  // Get filter icon
  getFilterIcon: (filterType) => {
    const iconMap = {
      category: "grid-outline",
      brand: "business-outline",
      priceRange: "cash-outline",
      rating: "star-outline",
      colour: "color-palette-outline",
      sizes: "resize-outline",
      subCategory: "list-outline",
      material: "layers-outline",
      availability: "checkmark-circle-outline",
      discount: "pricetag-outline",
      rentable: "calendar-outline",
    };
    return iconMap[filterType] || "filter-outline";
  },
};

export default useProductFilter;
