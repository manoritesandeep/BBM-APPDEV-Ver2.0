import Fuse from "fuse.js";

// Fuse.js configuration for fuzzy search
const fuseOptions = {
  keys: [
    {
      name: "productName",
      weight: 0.7,
    },
    {
      name: "category",
      weight: 0.2,
    },
    {
      name: "HSN",
      weight: 0.1,
    },
  ],
  threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
  distance: 100,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
};

let fuseInstance = null;

// Initialize or update Fuse instance with new data
export const initializeFuseSearch = (products) => {
  fuseInstance = new Fuse(products, fuseOptions);
};

// Perform fuzzy search
export const performFuzzySearch = (query, products, maxResults = 50) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  // Initialize Fuse if not already done or if products changed
  if (!fuseInstance || fuseInstance._docs.length !== products.length) {
    initializeFuseSearch(products);
  }

  const results = fuseInstance.search(query, { limit: maxResults });

  // Return the actual items with their search scores
  return results.map((result) => ({
    ...result.item,
    searchScore: result.score,
    searchMatches: result.matches,
  }));
};

// Alternative simple search function (fallback)
export const performSimpleSearch = (query, products, maxResults = 50) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const lowercaseQuery = query.toLowerCase();

  return products
    .filter(
      (product) =>
        product.productName.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery) ||
        (product.HSN && product.HSN.toLowerCase().includes(lowercaseQuery))
    )
    .slice(0, maxResults);
};

// Combined search function that tries fuzzy first, falls back to simple
export const searchProducts = (
  query,
  products,
  useFuzzy = true,
  maxResults = 50
) => {
  try {
    if (useFuzzy) {
      return performFuzzySearch(query, products, maxResults);
    } else {
      return performSimpleSearch(query, products, maxResults);
    }
  } catch (error) {
    console.warn("Search error, falling back to simple search:", error);
    return performSimpleSearch(query, products, maxResults);
  }
};
