import React from "react";
import { showSuccess, showError } from "@/utils/toast";

export function ToastTest() {
  const testSuccess = () => {
    showSuccess("This is a test success message!", "Test Success");
  };

  const testError = () => {
    showError("This is a test error message!", "Test Error");
  };

  return (
    <div className="p-4 space-y-2">
      <h3 className="text-lg font-semibold">Quick Toast Test</h3>
      <div className="space-x-2">
        <button
          onClick={testSuccess}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Success
        </button>
        <button
          onClick={testError}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Test Error
        </button>
      </div>
    </div>
  );
}
