import { createContext, useState, useContext } from "react";

const SearchContext = createContext({
  searchQuery: "",
  searchResults: [],
  isSearching: false,
  setSearchQuery: () => {},
  setSearchResults: () => {},
  setIsSearching: () => {},
  clearSearch: () => {},
});

export function SearchContextProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };

  const value = {
    searchQuery,
    searchResults,
    isSearching,
    setSearchQuery,
    setSearchResults,
    setIsSearching,
    clearSearch,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within SearchContextProvider");
  }
  return context;
};

export { SearchContext };
