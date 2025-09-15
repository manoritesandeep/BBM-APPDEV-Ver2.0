// Order tracking utilities and helpers

export const ORDER_STATUSES = {
  PLACED: "placed",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  PROCESSING: "processing", // Alias for preparing
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUSES.PLACED]: "Order Placed",
  [ORDER_STATUSES.CONFIRMED]: "Confirmed",
  [ORDER_STATUSES.PREPARING]: "Preparing",
  [ORDER_STATUSES.PROCESSING]: "Processing", // Alias for preparing
  [ORDER_STATUSES.SHIPPED]: "Shipped",
  [ORDER_STATUSES.DELIVERED]: "Delivered",
  [ORDER_STATUSES.CANCELLED]: "Cancelled",
};

export const ORDER_STATUS_DESCRIPTIONS = {
  [ORDER_STATUSES.PLACED]: "We have received your order",
  [ORDER_STATUSES.CONFIRMED]: "Your order has been confirmed",
  [ORDER_STATUSES.PREPARING]: "We're preparing your items",
  [ORDER_STATUSES.PROCESSING]: "We're preparing your items", // Alias for preparing
  [ORDER_STATUSES.SHIPPED]: "Your order is on the way",
  [ORDER_STATUSES.DELIVERED]: "Order delivered successfully",
  [ORDER_STATUSES.CANCELLED]: "Order has been cancelled",
};
/**
 * Get the next status in the order workflow
 * @param {string} currentStatus - Current order status
 * @returns {string|null} - Next status or null if already at final status
 */
export function getNextOrderStatus(currentStatus) {
  // Normalize processing to preparing
  const normalizedStatus =
    currentStatus === "processing" ? "preparing" : currentStatus;

  const statusFlow = [
    ORDER_STATUSES.PLACED,
    ORDER_STATUSES.CONFIRMED,
    ORDER_STATUSES.PREPARING,
    ORDER_STATUSES.SHIPPED,
    ORDER_STATUSES.DELIVERED,
  ];

  const currentIndex = statusFlow.indexOf(normalizedStatus);
  if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
    return null;
  }

  return statusFlow[currentIndex + 1];
}
/**
 * Check if an order status is final (no more updates expected)
 * @param {string} status - Order status
 * @returns {boolean} - True if status is final
 */
export function isFinalStatus(status) {
  return (
    status === ORDER_STATUSES.DELIVERED || status === ORDER_STATUSES.CANCELLED
  );
}

/**
 * Get progress percentage for an order status
 * @param {string} status - Order status
 * @returns {number} - Progress percentage (0-100)
 */
export function getOrderProgress(status) {
  // Normalize processing to preparing
  const normalizedStatus = status === "processing" ? "preparing" : status;

  const statusFlow = [
    ORDER_STATUSES.PLACED,
    ORDER_STATUSES.CONFIRMED,
    ORDER_STATUSES.PREPARING,
    ORDER_STATUSES.SHIPPED,
    ORDER_STATUSES.DELIVERED,
  ];

  const index = statusFlow.indexOf(normalizedStatus);
  if (index === -1) return 0;

  return ((index + 1) / statusFlow.length) * 100;
}
/**
 * Estimate delivery date based on order creation and current status
 * @param {Date} orderDate - Order creation date
 * @param {string} status - Current order status
 * @returns {Date} - Estimated delivery date
 */
export function estimateDeliveryDate(orderDate, status) {
  const baseDeliveryDays = 5; // Default 5 business days
  let adjustmentDays = 0;

  // Adjust based on current status
  switch (status) {
    case ORDER_STATUSES.PLACED:
      adjustmentDays = 0;
      break;
    case ORDER_STATUSES.CONFIRMED:
      adjustmentDays = -1; // Slightly faster
      break;
    case ORDER_STATUSES.PREPARING:
      adjustmentDays = -1;
      break;
    case ORDER_STATUSES.SHIPPED:
      adjustmentDays = -2; // Much faster now
      break;
    case ORDER_STATUSES.DELIVERED:
      return orderDate; // Already delivered
    default:
      adjustmentDays = 0;
  }

  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(
    deliveryDate.getDate() + baseDeliveryDays + adjustmentDays
  );

  return deliveryDate;
}

/**
 * Generate tracking updates for an order
 * @param {string} orderNumber - Order number
 * @param {string} newStatus - New status to update to
 * @param {string} customMessage - Optional custom message
 * @returns {object} - Tracking update object
 */
export function createTrackingUpdate(
  orderNumber,
  newStatus,
  customMessage = null
) {
  return {
    status: newStatus,
    message: customMessage || ORDER_STATUS_DESCRIPTIONS[newStatus],
    timestamp: new Date(),
    orderNumber,
  };
}

/**
 * Check if order can be cancelled
 * @param {string} status - Current order status
 * @returns {boolean} - True if order can be cancelled
 */
export function canCancelOrder(status) {
  return ![
    ORDER_STATUSES.SHIPPED,
    ORDER_STATUSES.DELIVERED,
    ORDER_STATUSES.CANCELLED,
  ].includes(status);
}

/**
 * Get status color for UI display
 * @param {string} status - Order status
 * @returns {string} - Color code
 */
export function getStatusColor(status) {
  switch (status) {
    case ORDER_STATUSES.PLACED:
      return "#F59E0B"; // Amber
    case ORDER_STATUSES.CONFIRMED:
      return "#3B82F6"; // Blue
    case ORDER_STATUSES.PREPARING:
      return "#8B5CF6"; // Purple
    case ORDER_STATUSES.SHIPPED:
      return "#06B6D4"; // Cyan
    case ORDER_STATUSES.DELIVERED:
      return "#10B981"; // Green
    case ORDER_STATUSES.CANCELLED:
      return "#EF4444"; // Red
    default:
      return "#6B7280"; // Gray
  }
}
