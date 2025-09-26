// Filter System Exports - Easy imports for the filtering system
export {
  FilterContextProvider,
  useFilter,
  FILTER_CONFIGS,
  CATEGORY_FILTER_MAP,
} from "../../store/filter-context";

// Main Components
export { default as FilterPanel } from "./FilterPanel";
export { default as CompactFilterBar } from "./CompactFilterBar";

// Specialized Components
export { default as FilterSection } from "./FilterSection";
export { default as FilterOption } from "./FilterOption";
export { default as FilterChips } from "./FilterChips";
export { default as CategorySelector } from "./CategorySelector";
export { default as SmartFilterSuggestions } from "./SmartFilterSuggestions";
export { default as PriceRangeFilter } from "./PriceRangeFilter";
export { default as RatingFilter } from "./RatingFilter";

// Hooks and Utilities
export { useProductFilter, filterUtils } from "../../hooks/useProductFilter";

// Quick Setup Examples
export { default as AllProductsEnhanced } from "../../screens/AllProductsEnhanced";
export { default as SearchResultsEnhanced } from "../../screens/SearchResultsScreenEnhanced";
export { default as IntegrationExample } from "./IntegrationExample";

/*
QUICK START GUIDE:

1. Basic Integration:
```jsx
import { FilterContextProvider, useFilter, FilterPanel, CompactFilterBar } from './components/Filters';

function MyProductScreen() {
  const { products } = useContext(ProductsContext);
  
  return (
    <FilterContextProvider products={products}>
      <MyFilteredContent />
    </FilterContextProvider>
  );
}

function MyFilteredContent() {
  const { filteredProducts } = useFilter();
  const [filterVisible, setFilterVisible] = useState(false);
  
  return (
    <View>
      <CompactFilterBar onOpenFullFilter={() => setFilterVisible(true)} />
      <ProductList products={filteredProducts} />
      <FilterPanel visible={filterVisible} onClose={() => setFilterVisible(false)} />
    </View>
  );
}
```

2. Custom Filter Implementation:
```jsx
import { useFilter, filterUtils } from './components/Filters';

function CustomFilters() {
  const { activeFilters, updateFilter, availableFilters } = useFilter();
  
  return (
    <View>
      {availableFilters.brand?.map(brand => (
        <TouchableOpacity
          key={brand}
          onPress={() => updateFilter('brand', brand)}
        >
          <Text>{brand}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```
*/
