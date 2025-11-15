// Advanced Filter Context for Build Bharat Mart
// Provides intelligent, category-aware filtering with personalization
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
} from "react";
import { ProductsContext } from "./products-context";

// Filter Context
export const FilterContext = createContext({
  activeFilters: {},
  selectedCategory: null,
  filteredProducts: [],
  availableFilters: {},
  filterCounts: {},
  appliedFiltersCount: 0,
  isLoading: false,

  // Actions
  setCategory: (category) => {},
  updateFilter: (filterType, value, isMultiSelect) => {},
  clearFilter: (filterType) => {},
  clearAllFilters: () => {},
  resetToCategory: (category) => {},

  // Smart features
  suggestedFilters: [],
  popularFilters: {},
  trendingFilters: [],
});

// Filter types and their configurations
export const FILTER_CONFIGS = {
  category: {
    type: "single",
    priority: 1,
    label: "Category",
    icon: "grid-outline",
  },
  brand: {
    type: "multi",
    priority: 2,
    label: "Brand",
    icon: "business-outline",
  },
  priceRange: {
    type: "range",
    priority: 3,
    label: "Price Range",
    icon: "cash-outline",
    ranges: [
      { label: "Under ₹500", min: 0, max: 500 },
      { label: "₹500 - ₹1,000", min: 500, max: 1000 },
      { label: "₹1,000 - ₹2,500", min: 1000, max: 2500 },
      { label: "₹2,500 - ₹5,000", min: 2500, max: 5000 },
      { label: "Above ₹5,000", min: 5000, max: Infinity },
    ],
  },
  rating: {
    type: "multi",
    priority: 4,
    label: "Rating",
    icon: "star-outline",
    options: [
      { label: "4+ Stars", value: 4 },
      { label: "3+ Stars", value: 3 },
      { label: "2+ Stars", value: 2 },
      { label: "1+ Stars", value: 1 },
    ],
  },
  colour: {
    type: "multi",
    priority: 5,
    label: "Color",
    icon: "color-palette-outline",
  },
  sizes: {
    type: "multi",
    priority: 6,
    label: "Size",
    icon: "resize-outline",
  },
  subCategory: {
    type: "multi",
    priority: 7,
    label: "Sub Category",
    icon: "list-outline",
  },
  material: {
    type: "multi",
    priority: 8,
    label: "Material",
    icon: "layers-outline",
  },
  availability: {
    type: "single",
    priority: 9,
    label: "Availability",
    icon: "checkmark-circle-outline",
    options: [
      { label: "In Stock", value: "inStock" },
      { label: "Low Stock", value: "lowStock" },
      { label: "Out of Stock", value: "outOfStock" },
    ],
  },
  discount: {
    type: "multi",
    priority: 10,
    label: "Discount",
    icon: "pricetag-outline",
    options: [
      { label: "50% or more", value: 50 },
      { label: "40% or more", value: 40 },
      { label: "30% or more", value: 30 },
      { label: "20% or more", value: 20 },
      { label: "10% or more", value: 10 },
    ],
  },
  rentable: {
    type: "single",
    priority: 11,
    label: "Rental Available",
    icon: "calendar-outline",
    options: [
      { label: "Available for Rent", value: true },
      { label: "Purchase Only", value: false },
    ],
  },
};

// Category-specific filter configurations
export const CATEGORY_FILTER_MAP = {
  PAINTS: [
    "brand",
    "priceRange",
    "colour",
    "sizes",
    "subCategory",
    "rating",
    "discount",
    "availability",
  ],
  LIGHTING: [
    "brand",
    "priceRange",
    "material",
    "rating",
    "discount",
    "availability",
    "rentable",
  ],
  PLUMBING: [
    "brand",
    "priceRange",
    "material",
    "sizes",
    "rating",
    "discount",
    "availability",
  ],
  ELECTRICAL: [
    "brand",
    "priceRange",
    "material",
    "rating",
    "discount",
    "availability",
    "rentable",
  ],
  HARDWARE: [
    "brand",
    "priceRange",
    "material",
    "sizes",
    "rating",
    "discount",
    "availability",
  ],
  TOOLS: [
    "brand",
    "priceRange",
    "material",
    "rating",
    "discount",
    "availability",
    "rentable",
  ],
  TILES: [
    "brand",
    "priceRange",
    "material",
    "colour",
    "sizes",
    "rating",
    "discount",
    "availability",
  ],
  FURNITURE: [
    "brand",
    "priceRange",
    "material",
    "colour",
    "sizes",
    "rating",
    "discount",
    "availability",
    "rentable",
  ],
  GARDEN: [
    "brand",
    "priceRange",
    "material",
    "sizes",
    "rating",
    "discount",
    "availability",
    "rentable",
  ],
  SAFETY: [
    "brand",
    "priceRange",
    "material",
    "sizes",
    "rating",
    "discount",
    "availability",
  ],
};

// Initial state
const initialState = {
  activeFilters: {},
  selectedCategory: null,
  filteredProducts: [],
  availableFilters: {},
  filterCounts: {},
  appliedFiltersCount: 0,
  isLoading: false,
  searchQuery: "",

  // Smart features
  userPreferences: {},
  filterHistory: [],
  popularFilters: {},
  trendingFilters: [],
};

// Filter reducer
function filterReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_CATEGORY":
      return {
        ...state,
        selectedCategory: action.payload,
        activeFilters: action.payload ? { category: [action.payload] } : {},
        appliedFiltersCount: action.payload ? 1 : 0,
      };

    case "UPDATE_FILTER":
      const { filterType, value, isMultiSelect } = action.payload;
      let newFilters = { ...state.activeFilters };

      if (isMultiSelect) {
        if (!newFilters[filterType]) {
          newFilters[filterType] = [];
        }

        const currentValues = [...newFilters[filterType]];
        const existingIndex = currentValues.indexOf(value);

        if (existingIndex >= 0) {
          currentValues.splice(existingIndex, 1);
        } else {
          currentValues.push(value);
        }

        if (currentValues.length === 0) {
          delete newFilters[filterType];
        } else {
          newFilters[filterType] = currentValues;
        }
      } else {
        if (newFilters[filterType] && newFilters[filterType][0] === value) {
          delete newFilters[filterType];
        } else {
          newFilters[filterType] = [value];
        }
      }

      return {
        ...state,
        activeFilters: newFilters,
        appliedFiltersCount: Object.keys(newFilters).length,
      };

    case "CLEAR_FILTER":
      const filtersAfterClear = { ...state.activeFilters };
      delete filtersAfterClear[action.payload];

      return {
        ...state,
        activeFilters: filtersAfterClear,
        appliedFiltersCount: Object.keys(filtersAfterClear).length,
      };

    case "CLEAR_ALL_FILTERS":
      return {
        ...state,
        activeFilters: state.selectedCategory
          ? { category: [state.selectedCategory] }
          : {},
        appliedFiltersCount: state.selectedCategory ? 1 : 0,
      };

    case "SET_FILTERED_PRODUCTS":
      return { ...state, filteredProducts: action.payload };

    case "SET_AVAILABLE_FILTERS":
      return { ...state, availableFilters: action.payload };

    case "SET_FILTER_COUNTS":
      return { ...state, filterCounts: action.payload };

    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };

    case "UPDATE_USER_PREFERENCES":
      return {
        ...state,
        userPreferences: { ...state.userPreferences, ...action.payload },
      };

    case "ADD_TO_FILTER_HISTORY":
      const newHistory = [action.payload, ...state.filterHistory.slice(0, 19)]; // Keep last 20
      return { ...state, filterHistory: newHistory };

    default:
      return state;
  }
}

// Filter Context Provider
export function FilterContextProvider({ children, products }) {
  const [state, dispatch] = useReducer(filterReducer, initialState);
  const productsCtx = useContext(ProductsContext);

  // Use provided products or fall back to ProductsContext
  const activeProducts = products ?? productsCtx.products ?? [];

  // Memoized product filtering logic
  const { filteredProducts, availableFilters, filterCounts } = useMemo(() => {
    let filtered = [...activeProducts];

    // Apply search query first if exists
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.productName.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          (product.HSN && product.HSN.toLowerCase().includes(query))
      );
    }

    // Apply active filters
    Object.entries(state.activeFilters).forEach(([filterType, values]) => {
      if (!values || values.length === 0) return;

      switch (filterType) {
        case "category":
          filtered = filtered.filter((product) =>
            values.includes(product.category)
          );
          break;

        case "brand":
          filtered = filtered.filter((product) =>
            values.includes(product.brand)
          );
          break;

        case "priceRange":
          filtered = filtered.filter((product) => {
            return values.some((range) => {
              const config = FILTER_CONFIGS.priceRange.ranges.find(
                (r) => r.label === range
              );
              if (!config) return false;
              return product.price >= config.min && product.price <= config.max;
            });
          });
          break;

        case "rating":
          filtered = filtered.filter((product) =>
            values.some((minRating) => product.rating >= minRating)
          );
          break;

        case "colour":
          filtered = filtered.filter(
            (product) => product.colour && values.includes(product.colour)
          );
          break;

        case "sizes":
          filtered = filtered.filter(
            (product) => product.sizes && values.includes(product.sizes)
          );
          break;

        case "subCategory":
          filtered = filtered.filter((product) =>
            values.includes(product.subCategory)
          );
          break;

        case "material":
          filtered = filtered.filter(
            (product) => product.material && values.includes(product.material)
          );
          break;

        case "availability":
          filtered = filtered.filter((product) => {
            return values.some((availability) => {
              switch (availability) {
                case "inStock":
                  return product.quantity > 10;
                case "lowStock":
                  return product.quantity > 0 && product.quantity <= 10;
                case "outOfStock":
                  return product.quantity === 0;
                default:
                  return true;
              }
            });
          });
          break;

        case "discount":
          filtered = filtered.filter((product) =>
            values.some((minDiscount) => product.discount >= minDiscount)
          );
          break;

        case "rentable":
          filtered = filtered.filter((product) =>
            values.includes(product.rentable)
          );
          break;
      }
    });

    // Calculate available filters and counts
    const available = {};
    const counts = {};

    // Get category-specific filters
    const relevantFilters = state.selectedCategory
      ? CATEGORY_FILTER_MAP[state.selectedCategory] ||
        Object.keys(FILTER_CONFIGS)
      : Object.keys(FILTER_CONFIGS);

    relevantFilters.forEach((filterType) => {
      available[filterType] = new Set();
      counts[filterType] = {};

      // Calculate what filter options are available in current results
      filtered.forEach((product) => {
        switch (filterType) {
          case "category":
            if (product.category) {
              available[filterType].add(product.category);
              counts[filterType][product.category] =
                (counts[filterType][product.category] || 0) + 1;
            }
            break;

          case "brand":
            if (product.brand) {
              available[filterType].add(product.brand);
              counts[filterType][product.brand] =
                (counts[filterType][product.brand] || 0) + 1;
            }
            break;

          case "colour":
            if (product.colour) {
              available[filterType].add(product.colour);
              counts[filterType][product.colour] =
                (counts[filterType][product.colour] || 0) + 1;
            }
            break;

          case "sizes":
            if (product.sizes) {
              available[filterType].add(product.sizes);
              counts[filterType][product.sizes] =
                (counts[filterType][product.sizes] || 0) + 1;
            }
            break;

          case "subCategory":
            if (product.subCategory) {
              available[filterType].add(product.subCategory);
              counts[filterType][product.subCategory] =
                (counts[filterType][product.subCategory] || 0) + 1;
            }
            break;

          case "material":
            if (product.material) {
              available[filterType].add(product.material);
              counts[filterType][product.material] =
                (counts[filterType][product.material] || 0) + 1;
            }
            break;

          case "priceRange":
            FILTER_CONFIGS.priceRange.ranges.forEach((range) => {
              if (product.price >= range.min && product.price <= range.max) {
                available[filterType].add(range.label);
                counts[filterType][range.label] =
                  (counts[filterType][range.label] || 0) + 1;
              }
            });
            break;

          case "rating":
            FILTER_CONFIGS.rating.options.forEach((option) => {
              if (product.rating >= option.value) {
                available[filterType].add(option.value);
                counts[filterType][option.value] =
                  (counts[filterType][option.value] || 0) + 1;
              }
            });
            break;

          case "discount":
            FILTER_CONFIGS.discount.options.forEach((option) => {
              if (product.discount >= option.value) {
                available[filterType].add(option.value);
                counts[filterType][option.value] =
                  (counts[filterType][option.value] || 0) + 1;
              }
            });
            break;

          case "availability":
            let availability;
            if (product.quantity > 10) availability = "inStock";
            else if (product.quantity > 0) availability = "lowStock";
            else availability = "outOfStock";

            available[filterType].add(availability);
            counts[filterType][availability] =
              (counts[filterType][availability] || 0) + 1;
            break;

          case "rentable":
            available[filterType].add(product.rentable);
            counts[filterType][product.rentable] =
              (counts[filterType][product.rentable] || 0) + 1;
            break;
        }
      });

      // Convert Sets to Arrays
      available[filterType] = Array.from(available[filterType]).sort();
    });

    return {
      filteredProducts: filtered,
      availableFilters: available,
      filterCounts: counts,
    };
  }, [
    activeProducts,
    state.activeFilters,
    state.selectedCategory,
    state.searchQuery,
  ]);

  // Update filtered products when they change
  useEffect(() => {
    dispatch({ type: "SET_FILTERED_PRODUCTS", payload: filteredProducts });
    dispatch({ type: "SET_AVAILABLE_FILTERS", payload: availableFilters });
    dispatch({ type: "SET_FILTER_COUNTS", payload: filterCounts });
  }, [filteredProducts, availableFilters, filterCounts]);

  // Smart filter suggestions based on category and user behavior
  const suggestedFilters = useMemo(() => {
    if (!state.selectedCategory) return [];

    const categoryFilters = CATEGORY_FILTER_MAP[state.selectedCategory] || [];
    const suggestions = [];

    // Suggest popular brands for the category
    if (categoryFilters.includes("brand") && availableFilters.brand) {
      const topBrands = availableFilters.brand
        .sort(
          (a, b) => (filterCounts.brand[b] || 0) - (filterCounts.brand[a] || 0)
        )
        .slice(0, 3);

      topBrands.forEach((brand) => {
        suggestions.push({
          type: "brand",
          value: brand,
          label: `${brand} (${filterCounts.brand[brand]} items)`,
          priority: 1,
        });
      });
    }

    // Suggest price ranges with good product count
    if (categoryFilters.includes("priceRange")) {
      FILTER_CONFIGS.priceRange.ranges.forEach((range) => {
        const count = filterCounts.priceRange[range.label] || 0;
        if (count > 0) {
          suggestions.push({
            type: "priceRange",
            value: range.label,
            label: `${range.label} (${count} items)`,
            priority: 2,
          });
        }
      });
    }

    // Suggest high ratings
    if (categoryFilters.includes("rating")) {
      const highRatingCount = filterCounts.rating[4] || 0;
      if (highRatingCount > 0) {
        suggestions.push({
          type: "rating",
          value: 4,
          label: `4+ Stars (${highRatingCount} items)`,
          priority: 3,
        });
      }
    }

    return suggestions.sort((a, b) => a.priority - b.priority).slice(0, 6);
  }, [state.selectedCategory, availableFilters, filterCounts]);

  // Context actions
  const setCategory = (category) => {
    dispatch({ type: "SET_CATEGORY", payload: category });
    if (category) {
      dispatch({
        type: "ADD_TO_FILTER_HISTORY",
        payload: { type: "category", value: category, timestamp: Date.now() },
      });
    }
  };

  const updateFilter = (filterType, value, isMultiSelect = true) => {
    dispatch({
      type: "UPDATE_FILTER",
      payload: { filterType, value, isMultiSelect },
    });
    dispatch({
      type: "ADD_TO_FILTER_HISTORY",
      payload: { type: filterType, value, timestamp: Date.now() },
    });
  };

  const clearFilter = (filterType) => {
    dispatch({ type: "CLEAR_FILTER", payload: filterType });
  };

  const clearAllFilters = () => {
    dispatch({ type: "CLEAR_ALL_FILTERS" });
  };

  const resetToCategory = (category) => {
    dispatch({ type: "SET_CATEGORY", payload: category });
  };

  const setSearchQuery = (query) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  };

  const value = {
    // State
    activeFilters: state.activeFilters,
    selectedCategory: state.selectedCategory,
    filteredProducts: state.filteredProducts,
    availableFilters: state.availableFilters,
    filterCounts: state.filterCounts,
    appliedFiltersCount: state.appliedFiltersCount,
    isLoading: state.isLoading,
    searchQuery: state.searchQuery,

    // Actions
    setCategory,
    updateFilter,
    clearFilter,
    clearAllFilters,
    resetToCategory,
    setSearchQuery,

    // Smart features
    suggestedFilters,
    popularFilters: state.popularFilters,
    trendingFilters: state.trendingFilters,

    // Utility
    FILTER_CONFIGS,
    CATEGORY_FILTER_MAP,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

// Custom hook for using filter context
export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within a FilterContextProvider");
  }
  return context;
}
