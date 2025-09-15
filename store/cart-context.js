import {
  createContext,
  useReducer,
  useEffect,
  useContext,
  useState,
  useRef,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../util/firebaseConfig";
import { doc, setDoc, getDoc } from "@react-native-firebase/firestore";
import { AuthContext } from "./auth-context";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

export const CartContext = createContext({
  items: [],
  addToCart: (product, quantity) => {},
  removeFromCart: (id) => {},
  updateQuantity: (id, quantity) => {},
  clearCart: () => {},
  refreshCart: () => {},
  isCartLoading: false,
});

function cartReducer(state, action) {
  switch (action.type) {
    case "LOAD":
      return { ...state, items: action.payload };
    case "ADD":
      const existingIndex = state.items.findIndex(
        (item) => item.id === action.payload.product.id
      );
      if (existingIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex].quantity += action.payload.quantity;
        return { ...state, items: updatedItems };
      }
      return {
        ...state,
        items: [
          ...state.items,
          { ...action.payload.product, quantity: action.payload.quantity },
        ],
      };
    case "REMOVE":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case "UPDATE":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case "CLEAR":
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function CartContextProvider({ children }) {
  const [cartState, dispatch] = useReducer(cartReducer, { items: [] });
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const hasLoadedCart = useRef(false);

  const authCtx = useContext(AuthContext);
  const isAuthenticated = authCtx?.isAuthenticated;
  const userId = authCtx?.userId;

  // Set sessionId for guests
  useEffect(() => {
    let cancelled = false;
    async function initGuestSession() {
      try {
        let sid = await AsyncStorage.getItem("guestSessionId");
        if (!sid) {
          sid = uuidv4();
          await AsyncStorage.setItem("guestSessionId", sid);
        }
        if (!cancelled) {
          setSessionId(sid);
          setIsSessionReady(true);
        }
      } catch (error) {
        console.error("Error initializing guest session:", error);
      }
    }

    if (!isAuthenticated) {
      setIsSessionReady(false);
      initGuestSession();
    } else {
      setSessionId(null);
      setIsSessionReady(true);
    }

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const cartKey = isAuthenticated ? userId : sessionId;

  // Load cart
  useEffect(() => {
    const shouldLoadGuestCart = !isAuthenticated && isSessionReady && cartKey;
    const shouldLoadUserCart = isAuthenticated && cartKey;

    if (!shouldLoadGuestCart && !shouldLoadUserCart) return;

    setIsCartLoading(true);
    hasLoadedCart.current = false;

    async function fetchCart() {
      try {
        if (isAuthenticated) {
          const cartRef = doc(db, "carts", cartKey);
          const cartSnap = await getDoc(cartRef);
          if (cartSnap.exists()) {
            dispatch({ type: "LOAD", payload: cartSnap.data().items || [] });
          } else {
            dispatch({ type: "LOAD", payload: [] });
          }
        } else {
          const localCart = await AsyncStorage.getItem(`cart_${cartKey}`);
          if (localCart) {
            dispatch({ type: "LOAD", payload: JSON.parse(localCart) });
          } else {
            dispatch({ type: "LOAD", payload: [] });
          }
        }
      } catch (error) {
        console.error("Error loading cart:", error);
        dispatch({ type: "LOAD", payload: [] });
      } finally {
        hasLoadedCart.current = true;
        setIsCartLoading(false);
      }
    }

    fetchCart();
  }, [isAuthenticated, isSessionReady, cartKey]);

  // Save cart
  useEffect(() => {
    if (!cartKey || !hasLoadedCart.current) return;

    async function saveCart() {
      try {
        if (isAuthenticated) {
          const cartRef = doc(db, "carts", cartKey);
          await setDoc(cartRef, { items: cartState.items });
        } else {
          await AsyncStorage.setItem(
            `cart_${cartKey}`,
            JSON.stringify(cartState.items)
          );
        }
      } catch (error) {
        console.error("Error saving cart:", error);
      }
    }

    saveCart();
  }, [cartState.items, isAuthenticated, cartKey]);

  // Merge guest cart on login
  useEffect(() => {
    async function mergeCarts() {
      if (isAuthenticated && sessionId) {
        const localCart = await AsyncStorage.getItem(`cart_${sessionId}`);
        if (localCart) {
          const localItems = JSON.parse(localCart);
          const cartRef = doc(db, "carts", userId);
          const cartSnap = await getDoc(cartRef);
          let merged = localItems;
          if (cartSnap.exists()) {
            const remoteItems = cartSnap.data().items || [];
            merged = [...remoteItems];
            localItems.forEach((localItem) => {
              const idx = merged.findIndex((i) => i.id === localItem.id);
              if (idx >= 0) {
                merged[idx].quantity += localItem.quantity;
              } else {
                merged.push(localItem);
              }
            });
          }
          await setDoc(cartRef, { items: merged });
          await AsyncStorage.removeItem(`cart_${sessionId}`);
          dispatch({ type: "LOAD", payload: merged });
        }
      }
    }

    mergeCarts();
  }, [isAuthenticated, sessionId, userId]);

  function addToCart(product, quantity = 1) {
    dispatch({ type: "ADD", payload: { product, quantity } });
  }
  function removeFromCart(id) {
    dispatch({ type: "REMOVE", payload: id });
  }
  function updateQuantity(id, quantity) {
    dispatch({ type: "UPDATE", payload: { id, quantity } });
  }
  function clearCart() {
    dispatch({ type: "CLEAR" });
  }

  // Refresh cart function to reload cart data
  const refreshCart = async () => {
    if (!cartKey) return;

    setIsCartLoading(true);
    try {
      console.log("🛒 Refreshing cart...");

      if (isAuthenticated) {
        const cartRef = doc(db, "carts", cartKey);
        const cartSnap = await getDoc(cartRef);
        if (cartSnap.exists()) {
          dispatch({ type: "LOAD", payload: cartSnap.data().items || [] });
        } else {
          dispatch({ type: "LOAD", payload: [] });
        }
      } else {
        const localCart = await AsyncStorage.getItem(`cart_${cartKey}`);
        if (localCart) {
          dispatch({ type: "LOAD", payload: JSON.parse(localCart) });
        } else {
          dispatch({ type: "LOAD", payload: [] });
        }
      }
      console.log("✅ Cart refreshed successfully");
    } catch (error) {
      console.error("❌ Error refreshing cart:", error);
    } finally {
      setIsCartLoading(false);
    }
  };

  const value = {
    items: cartState.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
    isCartLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
