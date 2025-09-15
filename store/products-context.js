// // Major update: Data read from firestore database
import { createContext, useReducer, useEffect, useState } from "react";
import { readCollection } from "../util/firebaseUtils";

export const ProductsContext = createContext({
  products: [],
  addProduct: (productData) => {},
  deleteProduct: (id) => {},
  updateProduct: (id, productData) => {},
  setProducts: (products) => {},
  refreshProducts: () => {},
  loading: false,
  error: null,
});

function productsReducer(state, action) {
  switch (action.type) {
    case "ADD":
      const id = new Date().toString() + Math.random().toString();
      return [{ ...action.payload, id: id }, ...state];
    case "UPDATE":
      const updatableProductIndex = state.findIndex(
        (product) => product.id === action.payload.id
      );
      const updatableProduct = state[updatableProductIndex];
      const updatedItem = { ...updatableProduct, ...action.payload.data };
      const updatedProducts = [...state];
      updatedProducts[updatableProductIndex] = updatedItem;
      return updatedProducts;
    case "DELETE":
      return state.filter((product) => product.id !== action.payload);
    case "SET":
      return action.payload;
    default:
      return state;
  }
}

function ProductsContextProvider({ children }) {
  const [productsState, dispatch] = useReducer(productsReducer, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function addProduct(productData) {
    dispatch({ type: "ADD", payload: productData });
  }

  function deleteProduct(id) {
    dispatch({ type: "DELETE", payload: id });
  }

  function updateProduct(id, productData) {
    dispatch({ type: "UPDATE", payload: { id: id, data: productData } });
  }

  function setProducts(products) {
    dispatch({ type: "SET", payload: products });
  }

  // Fetch products from Firestore when provider mounts
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        // console.log("🛍️ Starting to fetch products...");

        const fetchedProductsData = await readCollection("products");

        if (fetchedProductsData && fetchedProductsData.length > 0) {
          setProducts(fetchedProductsData);
          console.log(
            `✅ Successfully loaded ${fetchedProductsData.length} products`
          );
        } else {
          console.warn("⚠️ No products found in database");
          setProducts([]); // Ensure fallback to empty array
        }
      } catch (e) {
        console.error("❌ Failed to fetch products:", e);
        setError(e.message || "Failed to load products");
        // Set empty array as fallback to prevent crashes
        setProducts([]);
      } finally {
        setLoading(false);
        // console.log("🏁 Products fetch completed");
      }
    }

    fetchProducts();
  }, []);

  // Refresh function that can be called from components
  const refreshProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // console.log("🔄 Refreshing products...");

      const fetchedProductsData = await readCollection("products");
      setProducts(fetchedProductsData || []); // Ensure fallback to empty array
      // console.log("✅ Products refreshed successfully");
    } catch (e) {
      console.error("❌ Failed to refresh products:", e);
      setError(e.message || "Failed to refresh products");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    products: productsState,
    addProduct,
    deleteProduct,
    updateProduct,
    setProducts,
    refreshProducts,
    loading,
    error,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export default ProductsContextProvider;
