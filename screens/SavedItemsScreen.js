import React, { useContext, useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaWrapper } from "../components/UI/SafeAreaWrapper";
import { AuthContext } from "../store/auth-context";
import { useToast } from "../components/UI/ToastProvider";
import LoadingState from "../components/UI/LoadingState";
import { Colors } from "../constants/styles";
import {
  SavedItemsHeader,
  SavedItemsActionsBar,
  SavedItemsList,
  SavedItemsEmptyState,
  useSavedItemsLogic,
} from "../components/UserComponents/SavedItems";

function SavedItemsScreen({ navigation }) {
  const authCtx = useContext(AuthContext);
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const {
    savedItemsCtx,
    getProductById,
    getPriceComparison,
    handleAddToCart,
    handleRemoveFromSaved,
    handleAddAllToCart,
    handleClearAll,
    handleRefresh,
  } = useSavedItemsLogic(showToast);

  useEffect(() => {
    if (!authCtx.isAuthenticated) {
      navigation.goBack();
      showToast("Please sign in to view saved items", "warning");
    }
  }, [authCtx.isAuthenticated, navigation, showToast]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await handleRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [handleRefresh]);

  // Memoize navigation callbacks
  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleStartShopping = useCallback(() => {
    navigation.navigate("HomeScreen");
  }, [navigation]);

  if (savedItemsCtx.isLoading && savedItemsCtx.savedItems.length === 0) {
    return (
      <SafeAreaWrapper>
        <LoadingState type="skeleton-list" message="Loading saved items..." />
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <SavedItemsHeader
          onBackPress={handleBackPress}
          itemCount={savedItemsCtx.getSavedItemsCount()}
          onClearAll={handleClearAll}
          showClearAll={savedItemsCtx.savedItems.length > 0}
        />

        {savedItemsCtx.savedItems.length > 0 && (
          <SavedItemsActionsBar onAddAllToCart={handleAddAllToCart} />
        )}

        {savedItemsCtx.savedItems.length === 0 ? (
          <SavedItemsEmptyState onStartShopping={handleStartShopping} />
        ) : (
          <SavedItemsList
            savedItems={savedItemsCtx.savedItems}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onAddToCart={handleAddToCart}
            onRemoveFromSaved={handleRemoveFromSaved}
            getPriceComparison={getPriceComparison}
            getProductById={getProductById}
          />
        )}
      </View>
    </SafeAreaWrapper>
  );
}

export default SavedItemsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary100,
  },
});
