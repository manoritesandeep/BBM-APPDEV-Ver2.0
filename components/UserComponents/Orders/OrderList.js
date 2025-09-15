import React, { useState, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
  RefreshControl,
  TextInput,
  Pressable,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/styles";
import OrderCard from "./OrderCard";
import { useI18n } from "../../../store/i18n-context";
import { useTheme } from "../../../store/theme-context";
// import { useI18n } from "../../../hooks/useI18n";

function OrderList({ orders, loading, onReload, onOrderPress }) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    orderType: "all", // all, not_shipped, cancelled
    dateRange: "30days", // 30days, 3months, year, all_time
    selectedYear: null,
  });

  // Get available years from orders
  const availableYears = useMemo(() => {
    const years = new Set();
    orders.forEach((order) => {
      if (order.createdAt?.seconds) {
        const year = new Date(order.createdAt.seconds * 1000).getFullYear();
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }, [orders]);

  // Filter orders based on current filters and search
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Apply default logic: hide cancelled orders older than 7 days unless specifically looking for them
    if (filters.orderType !== "cancelled") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      filtered = filtered.filter((order) => {
        if (order.status === "cancelled") {
          const orderDate = new Date(order.createdAt.seconds * 1000);
          return orderDate >= sevenDaysAgo; // Only show cancelled orders from last 7 days
        }
        return true;
      });
    }

    // Apply order type filter
    switch (filters.orderType) {
      case "not_shipped":
        filtered = filtered.filter(
          (order) =>
            !["shipped", "delivered", "cancelled"].includes(order.status)
        );
        break;
      case "cancelled":
        filtered = filtered.filter((order) => order.status === "cancelled");
        break;
      case "all":
      default:
        // Keep all orders (with default cancelled logic already applied above)
        break;
    }

    // Apply date range filter
    const now = new Date();
    switch (filters.dateRange) {
      case "30days":
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter((order) => {
          const orderDate = new Date(order.createdAt.seconds * 1000);
          return orderDate >= thirtyDaysAgo;
        });
        break;
      case "3months":
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        filtered = filtered.filter((order) => {
          const orderDate = new Date(order.createdAt.seconds * 1000);
          return orderDate >= threeMonthsAgo;
        });
        break;
      case "year":
        if (filters.selectedYear) {
          filtered = filtered.filter((order) => {
            const orderDate = new Date(order.createdAt.seconds * 1000);
            return orderDate.getFullYear() === filters.selectedYear;
          });
        }
        break;
      case "all_time":
      default:
        // Keep all orders
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((order) => {
        return (
          order.orderNumber?.toLowerCase().includes(query) ||
          order.items?.some((item) =>
            item.productName?.toLowerCase().includes(query)
          ) ||
          order.status?.toLowerCase().includes(query)
        );
      });
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });
  }, [orders, filters, searchQuery]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      // Reset selectedYear if not using year filter
      if (key === "dateRange" && value !== "year") {
        newFilters.selectedYear = null;
      }
      return newFilters;
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.orderType !== "all") count++;
    if (filters.dateRange !== "30days") count++;
    return count;
  };

  const resetFilters = () => {
    setFilters({
      orderType: "all",
      dateRange: "30days",
      selectedYear: null,
    });
    setSearchQuery("");
  };
  return (
    <>
      <Text style={styles.headerText}>{t("user.yourOrders")}</Text>

      {/* Search and Filter Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={16}
            color={Colors.gray500}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t("user.searchAllOrders")}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={16} color={Colors.gray500} />
            </Pressable>
          )}
        </View>

        <Pressable
          style={[
            styles.filterButton,
            getActiveFilterCount() > 0 && styles.filterButtonActive,
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons
            name="filter"
            size={16}
            color={getActiveFilterCount() > 0 ? Colors.white : Colors.gray600}
          />
          {getActiveFilterCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {getActiveFilterCount()}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.activeFilters}>
              {filters.orderType !== "all" && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>
                    {filters.orderType === "not_shipped"
                      ? t("orders.notShipped")
                      : t("orders.cancelled")}
                  </Text>
                  <Pressable
                    onPress={() => handleFilterChange("orderType", "all")}
                  >
                    <Ionicons
                      name="close"
                      size={12}
                      color={Colors.primary500}
                    />
                  </Pressable>
                </View>
              )}
              {filters.dateRange !== "30days" && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>
                    {filters.dateRange === "3months"
                      ? t("orders.threeMonths")
                      : filters.dateRange === "year"
                      ? `${filters.selectedYear}`
                      : t("orders.allTime")}
                  </Text>
                  <Pressable
                    onPress={() => handleFilterChange("dateRange", "30days")}
                  >
                    <Ionicons
                      name="close"
                      size={12}
                      color={Colors.primary500}
                    />
                  </Pressable>
                </View>
              )}
              <Pressable style={styles.clearAllButton} onPress={resetFilters}>
                <Text style={styles.clearAllText}>{t("user.clearAll")}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Results Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          {loading
            ? t("common.loading")
            : t("user.ordersFound", {
                count: filteredOrders.length,
                orderText:
                  filteredOrders.length === 1
                    ? t("user.order")
                    : t("user.orders"),
              })}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onReload}
            colors={[Colors.primary500, Colors.accent500]}
            tintColor={Colors.primary500}
            title={t("user.pullToRefreshOrders")}
            titleColor={Colors.primary500}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#333" />
            <Text style={styles.loadingText}>
              {t("user.loadingYourOrders")}
            </Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color={Colors.gray400} />
            <Text style={styles.emptyText}>
              {searchQuery.trim() || getActiveFilterCount() > 0
                ? t("user.noOrdersMatch")
                : t("user.noOrdersFound")}
            </Text>
            {(searchQuery.trim() || getActiveFilterCount() > 0) && (
              <Pressable style={styles.resetButton} onPress={resetFilters}>
                <Text style={styles.resetButtonText}>
                  {t("user.clearFilters")}
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onPress={onOrderPress} />
          ))
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t("orders.filterOrders")}</Text>
            <Pressable
              onPress={() => setShowFilters(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={Colors.gray700} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Order Type Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>
                {t("orders.orderType")}
              </Text>
              <View style={styles.filterOptions}>
                {[
                  { key: "all", label: t("orders.allOrders") },
                  { key: "not_shipped", label: t("orders.notYetShipped") },
                  { key: "cancelled", label: t("orders.cancelled") },
                ].map((option) => (
                  <Pressable
                    key={option.key}
                    style={[
                      styles.filterOption,
                      filters.orderType === option.key &&
                        styles.filterOptionActive,
                    ]}
                    onPress={() => handleFilterChange("orderType", option.key)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.orderType === option.key &&
                          styles.filterOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {filters.orderType === option.key && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.white}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Date Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>
                {t("orders.orderDate")}
              </Text>
              <View style={styles.filterOptions}>
                {[
                  { key: "30days", label: t("orders.last30Days") },
                  { key: "3months", label: t("orders.last3Months") },
                  { key: "year", label: t("orders.specificYear") },
                  { key: "all_time", label: t("orders.allTime") },
                ].map((option) => (
                  <Pressable
                    key={option.key}
                    style={[
                      styles.filterOption,
                      filters.dateRange === option.key &&
                        styles.filterOptionActive,
                    ]}
                    onPress={() => handleFilterChange("dateRange", option.key)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.dateRange === option.key &&
                          styles.filterOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {filters.dateRange === option.key && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.white}
                      />
                    )}
                  </Pressable>
                ))}
              </View>

              {/* Year Selection */}
              {filters.dateRange === "year" && (
                <View style={styles.yearSelection}>
                  <Text style={styles.yearSelectionTitle}>
                    {t("orders.selectYear")}:
                  </Text>
                  <View style={styles.yearOptions}>
                    {availableYears.map((year) => (
                      <Pressable
                        key={year}
                        style={[
                          styles.yearOption,
                          filters.selectedYear === year &&
                            styles.yearOptionActive,
                        ]}
                        onPress={() => handleFilterChange("selectedYear", year)}
                      >
                        <Text
                          style={[
                            styles.yearOptionText,
                            filters.selectedYear === year &&
                              styles.yearOptionTextActive,
                          ]}
                        >
                          {year}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable style={styles.resetFiltersButton} onPress={resetFilters}>
              <Text style={styles.resetFiltersButtonText}>
                {t("orders.resetAll")}
              </Text>
            </Pressable>
            <Pressable
              style={styles.applyFiltersButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyFiltersButtonText}>
                {t("orders.applyFilters")}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default OrderList;

const styles = StyleSheet.create({
  headerText: {
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: 18,
    padding: 2,
    color: Colors.gray900,
  },

  // Controls
  controlsContainer: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray300,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray900,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray300,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  filterButtonActive: {
    backgroundColor: Colors.primary500,
    borderColor: Colors.primary500,
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.accent500,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },

  // Active Filters
  activeFiltersContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeFilters: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary100,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary500,
  },
  clearAllButton: {
    backgroundColor: Colors.gray200,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.gray900,
  },

  // Summary
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  summaryText: {
    fontSize: 12,
    color: Colors.gray700,
    fontStyle: "italic",
  },

  // Content
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 2,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginLeft: 10,
    color: Colors.gray900,
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    color: Colors.gray600,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  resetButton: {
    marginTop: 16,
    backgroundColor: Colors.primary500,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.gray900,
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.error100,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderTopWidth: 1,
    borderTopColor: Colors.gray300,
  },

  // Filter Sections
  filterSection: {
    marginTop: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.gray900,
    marginBottom: 12,
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.gray50,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  filterOptionActive: {
    backgroundColor: Colors.primary500,
    borderColor: Colors.primary500,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray700,
  },
  filterOptionTextActive: {
    color: Colors.white,
    fontWeight: "600",
  },

  // Year Selection
  yearSelection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray300,
  },
  yearSelectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray700,
    marginBottom: 8,
  },
  yearOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  yearOption: {
    backgroundColor: Colors.gray100,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  yearOptionActive: {
    backgroundColor: Colors.primary500,
    borderColor: Colors.primary500,
  },
  yearOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray700,
  },
  yearOptionTextActive: {
    color: Colors.white,
    fontWeight: "600",
  },

  // Modal Footer Buttons
  resetFiltersButton: {
    flex: 1,
    backgroundColor: Colors.gray100,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  resetFiltersButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray700,
  },
  applyFiltersButton: {
    flex: 1,
    backgroundColor: Colors.primary500,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  applyFiltersButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
  },
});
