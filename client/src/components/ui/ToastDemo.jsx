import React from "react";
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  showPromise,
  dismissAllToasts,
} from "@/utils/toast";

export function ToastDemo() {
  const handleSuccess = () => {
    showSuccess("Your action was completed successfully!", "Success");
  };

  const handleError = () => {
    showError("Something went wrong. Please try again.", "Error");
  };

  const handleWarning = () => {
    showWarning("Please review your input before proceeding.", "Warning");
  };

  const handleInfo = () => {
    showInfo("Here's some useful information for you.", "Information");
  };

  const handleLoading = () => {
    const loadingToast = showLoading("Processing your request...");
    // Simulate some async operation
    setTimeout(() => {
      dismissAllToasts();
      showSuccess("Request completed!", "Done");
    }, 3000);
  };

  const handlePromise = () => {
    const fakePromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve("Data loaded successfully!") : reject("Failed to load data");
      }, 2000);
    });

    showPromise(fakePromise, {
      loading: "Loading data...",
      success: "Data loaded successfully!",
      error: "Failed to load data",
    });
  };

  const handleCustomDuration = () => {
    showSuccess("This toast will stay for 10 seconds", "Custom Duration", {
      duration: 10000,
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Toast System Demo</h2>
        <p className="text-gray-600">
          Professional toast notifications with React Hot Toast
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <button
          onClick={handleSuccess}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
        >
          Success Toast
        </button>
        
        <button
          onClick={handleError}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
        >
          Error Toast
        </button>
        
        <button
          onClick={handleWarning}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors font-medium"
        >
          Warning Toast
        </button>
        
        <button
          onClick={handleInfo}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Info Toast
        </button>
        
        <button
          onClick={handleLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
        >
          Loading Toast
        </button>
        
        <button
          onClick={handlePromise}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
        >
          Promise Toast
        </button>
        
        <button
          onClick={handleCustomDuration}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
        >
          Custom Duration
        </button>
        
        <button
          onClick={dismissAllToasts}
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors font-medium"
        >
          Dismiss All
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="font-semibold text-gray-800 mb-2">Features:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Auto-dismiss after configurable duration</li>
          <li>• Professional styling with proper colors</li>
          <li>• Loading states and promise handling</li>
          <li>• Customizable duration and positioning</li>
          <li>• Smooth animations and transitions</li>
          <li>• Responsive design for all devices</li>
        </ul>
      </div>
    </div>
  );
}
