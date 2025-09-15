import React, { createContext, useContext, useReducer } from "react";
import {
  checkReturnEligibility,
  submitReturnRequest,
  fetchUserReturnRequests,
  fetchReturnRequestByNumber,
  calculateRefundAmount,
  RETURN_STATUSES,
  RETURN_REASONS,
  REFUND_METHODS,
} from "../util/returnsApi";

const ReturnsContext = createContext({
  // State
  returnRequests: [],
  currentReturnRequest: null,
  returnEligibility: null,
  isLoading: false,
  error: null,

  // Actions
  checkOrderReturnEligibility: () => {},
  createReturnRequest: () => {},
  fetchReturnRequests: () => {},
  getReturnRequestByNumber: () => {},
  clearError: () => {},
  resetReturnFlow: () => {},

  // Constants
  RETURN_STATUSES,
  RETURN_REASONS,
  REFUND_METHODS,
});

function returnsReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    case "SET_RETURN_ELIGIBILITY":
      return {
        ...state,
        returnEligibility: action.payload,
        isLoading: false,
        error: null,
      };

    case "SET_RETURN_REQUESTS":
      return {
        ...state,
        returnRequests: action.payload,
        isLoading: false,
        error: null,
      };

    case "ADD_RETURN_REQUEST":
      return {
        ...state,
        returnRequests: [action.payload, ...state.returnRequests],
        currentReturnRequest: action.payload,
        isLoading: false,
        error: null,
      };

    case "SET_CURRENT_RETURN_REQUEST":
      return {
        ...state,
        currentReturnRequest: action.payload,
        isLoading: false,
        error: null,
      };

    case "UPDATE_RETURN_REQUEST_STATUS":
      return {
        ...state,
        returnRequests: state.returnRequests.map((request) =>
          request.id === action.payload.id
            ? { ...request, ...action.payload.updates }
            : request
        ),
        currentReturnRequest:
          state.currentReturnRequest?.id === action.payload.id
            ? { ...state.currentReturnRequest, ...action.payload.updates }
            : state.currentReturnRequest,
      };

    case "RESET_RETURN_FLOW":
      return {
        ...state,
        returnEligibility: null,
        currentReturnRequest: null,
        error: null,
      };

    default:
      return state;
  }
}

export function ReturnsContextProvider({ children }) {
  const [state, dispatch] = useReducer(returnsReducer, {
    returnRequests: [],
    currentReturnRequest: null,
    returnEligibility: null,
    isLoading: false,
    error: null,
  });

  // Check if an order is eligible for returns
  async function checkOrderReturnEligibility(orderId) {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const eligibility = await checkReturnEligibility(orderId);
      dispatch({ type: "SET_RETURN_ELIGIBILITY", payload: eligibility });
      return eligibility;
    } catch (error) {
      console.error("Error checking return eligibility:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to check return eligibility",
      });
      throw error;
    }
  }

  // Calculate refund amount for selected items
  function calculateItemsRefund(items, order) {
    try {
      return calculateRefundAmount(items, order);
    } catch (error) {
      console.error("Error calculating refund:", error);
      return { totalRefund: 0, breakdown: {} };
    }
  }

  // Submit a new return request
  async function createReturnRequest(returnData) {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const result = await submitReturnRequest(returnData);

      // Fetch the created return request to add to state
      const newRequest = await fetchReturnRequestByNumber(result.returnNumber);

      if (newRequest) {
        dispatch({ type: "ADD_RETURN_REQUEST", payload: newRequest });
      }

      return result;
    } catch (error) {
      console.error("Error creating return request:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to submit return request",
      });
      throw error;
    }
  }

  // Fetch all return requests for current user
  async function fetchReturnRequests(userId) {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const requests = await fetchUserReturnRequests(userId);
      dispatch({ type: "SET_RETURN_REQUESTS", payload: requests });
      return requests;
    } catch (error) {
      console.error("Error fetching return requests:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to load return requests",
      });
      throw error;
    }
  }

  // Get a specific return request by return number
  async function getReturnRequestByNumber(returnNumber) {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const request = await fetchReturnRequestByNumber(returnNumber);
      dispatch({ type: "SET_CURRENT_RETURN_REQUEST", payload: request });
      return request;
    } catch (error) {
      console.error("Error fetching return request:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load return request" });
      throw error;
    }
  }

  // Clear any error messages
  function clearError() {
    dispatch({ type: "CLEAR_ERROR" });
  }

  // Reset the return flow (clear eligibility and current request)
  function resetReturnFlow() {
    dispatch({ type: "RESET_RETURN_FLOW" });
  }

  // Update return request status (for real-time updates)
  function updateReturnRequestStatus(requestId, updates) {
    dispatch({
      type: "UPDATE_RETURN_REQUEST_STATUS",
      payload: { id: requestId, updates },
    });
  }

  const value = {
    // State
    returnRequests: state.returnRequests,
    currentReturnRequest: state.currentReturnRequest,
    returnEligibility: state.returnEligibility,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    checkOrderReturnEligibility,
    calculateItemsRefund,
    createReturnRequest,
    fetchReturnRequests,
    getReturnRequestByNumber,
    clearError,
    resetReturnFlow,
    updateReturnRequestStatus,

    // Constants
    RETURN_STATUSES,
    RETURN_REASONS,
    REFUND_METHODS,
  };

  return (
    <ReturnsContext.Provider value={value}>{children}</ReturnsContext.Provider>
  );
}

export function useReturns() {
  const context = useContext(ReturnsContext);
  if (!context) {
    throw new Error("useReturns must be used within a ReturnsContextProvider");
  }
  return context;
}

export default ReturnsContext;
