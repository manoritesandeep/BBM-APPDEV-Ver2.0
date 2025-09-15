import React, { createContext, useContext, useState } from "react";
import Toast from "./Toast";

const ToastContext = createContext({
  showToast: () => {},
});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
    duration: 3000,
  });

  const showToast = (message, type = "success", duration = 3000) => {
    setToast({ visible: true, message, type, duration });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export default ToastProvider;
