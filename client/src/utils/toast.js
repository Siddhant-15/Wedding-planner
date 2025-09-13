import toast from 'react-hot-toast';

// Default toast configuration
const defaultConfig = {
  duration: 2000,
  position: 'top-right',
};

// Success toast
export const showSuccess = (message, title = 'Success', config = {}) => {
  const content = title ? `${title}\n${message}` : message;

  return toast.success(content, {
    ...defaultConfig,
    ...config,
  });
};

// Error toast
export const showError = (message, title = 'Error', config = {}) => {
  const content = title ? `${title}\n${message}` : message;

  return toast.error(content, {
    ...defaultConfig,
    duration: 5000, // Longer duration for errors
    ...config,
  });
};

// Warning toast
export const showWarning = (message, title = 'Warning', config = {}) => {
  const content = title ? `${title}\n${message}` : message;

  return toast(content, {
    ...defaultConfig,
    duration: 4500,
    style: {
      background: '#f59e0b',
      color: '#fff',
      border: '1px solid #d97706',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#f59e0b',
    },
    ...config,
  });
};

// Info toast
export const showInfo = (message, title = 'Information', config = {}) => {
  const content = title ? `${title}\n${message}` : message;

  return toast(content, {
    ...defaultConfig,
    style: {
      background: '#3b82f6',
      color: '#fff',
      border: '1px solid #2563eb',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#3b82f6',
    },
    ...config,
  });
};

// Loading toast
export const showLoading = (message, config = {}) => {
  return toast.loading(message, {
    ...defaultConfig,
    duration: Infinity, // Won't auto-dismiss
    ...config,
  });
};

// Dismiss specific toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Promise toast (for async operations)
export const showPromise = (promise, messages = {}) => {
  const {
    loading = 'Loading...',
    success = 'Success!',
    error = 'An error occurred',
  } = messages;

  return toast.promise(
    promise,
    {
      loading,
      success,
      error,
    },
    {
      ...defaultConfig,
      duration: 4000,
    }
  );
};

// Custom toast with full control
export const showCustomToast = (content, config = {}) => {
  return toast(content, {
    ...defaultConfig,
    ...config,
  });
};

// Export the base toast function for advanced usage
export { toast };
