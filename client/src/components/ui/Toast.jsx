import React from "react";
import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '14px',
          maxWidth: '400px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
        success: {
          duration: 4000,
          style: {
            background: '#10b981',
            color: '#fff',
            border: '1px solid #059669',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10b981',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#ef4444',
            color: '#fff',
            border: '1px solid #dc2626',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#ef4444',
          },
        },
        warning: {
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
        },
        info: {
          duration: 4000,
          style: {
            background: '#3b82f6',
            color: '#fff',
            border: '1px solid #2563eb',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#3b82f6',
          },
        },
      }}
    />
  );
}
