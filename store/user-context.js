import { createContext, useState } from "react";

export const UserContext = createContext({
  user: null,
  setUser: (user) => {},
  updateUser: (userData) => {},
  clearUser: () => {},
});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);

  function updateUser(userData) {
    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
    }));
  }

  function clearUser() {
    setUser(null);
  }

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}
