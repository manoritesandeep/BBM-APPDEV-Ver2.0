import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../util/firebaseConfig";
import { doc, getDoc, updateDoc } from "@react-native-firebase/firestore";
import { AuthContext } from "./auth-context";

export const AddressContext = createContext({
  addresses: [],
  defaultAddressId: null,
  isLoading: false,
  error: null,
  addAddress: async (address) => {},
  updateAddress: async (address) => {},
  deleteAddress: async (id) => {},
  setDefaultAddress: async (id) => {},
  refreshAddresses: async () => {},
});

export function AddressContextProvider({ children }) {
  const { userId } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch addresses from Firestore
  async function refreshAddresses() {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setAddresses(data.addresses || []);
        setDefaultAddressId(data.defaultAddressId || null);
      } else {
        setAddresses([]);
        setDefaultAddressId(null);
      }
    } catch (err) {
      setError("Failed to load addresses.");
    } finally {
      setIsLoading(false);
    }
  }

  // Save addresses to Firestore
  async function saveAddresses(newAddresses, newDefaultId = defaultAddressId) {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        addresses: newAddresses,
        defaultAddressId: newDefaultId,
      });
      setAddresses(newAddresses);
      setDefaultAddressId(newDefaultId);
    } catch (err) {
      setError("Failed to update addresses.");
    } finally {
      setIsLoading(false);
    }
  }

  async function addAddress(address) {
    const newAddresses = [...addresses, address];
    await saveAddresses(newAddresses, defaultAddressId || address.id);
  }

  async function updateAddress(address) {
    const newAddresses = addresses.map((a) =>
      a.id === address.id ? address : a
    );
    await saveAddresses(newAddresses, defaultAddressId);
  }

  async function deleteAddress(id) {
    const newAddresses = addresses.filter((a) => a.id !== id);
    let newDefault =
      defaultAddressId === id && newAddresses.length > 0
        ? newAddresses[0].id
        : defaultAddressId === id
        ? null
        : defaultAddressId;
    await saveAddresses(newAddresses, newDefault);
  }

  async function setDefaultAddress(id) {
    await saveAddresses(addresses, id);
  }

  // Auto-refresh when userId changes
  useEffect(() => {
    refreshAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const value = {
    addresses,
    defaultAddressId,
    isLoading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refreshAddresses,
  };

  return (
    <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
  );
}
