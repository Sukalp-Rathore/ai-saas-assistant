import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((type, message, duration = 4000) => {
    const id = uid();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const value = useMemo(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message, 5500),
      info: (message) => push("info", message),
      dismiss,
    }),
    [dismiss, push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" role="status" aria-live="polite" aria-atomic="true" style={{ zIndex: 1080 }}>
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast show text-white border-0 ${toast.type === "success" ? "bg-success" : toast.type === "error" ? "bg-danger" : "bg-primary"}`}>
            <div className="d-flex align-items-start">
              <div className="toast-body">{toast.message}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
