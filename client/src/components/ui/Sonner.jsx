import React from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import styles from "../../styles/Sonner.module.css"

function Toaster(props) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      className={styles.toaster}
      toastOptions={{
        classNames: {
          toast: styles.toast,
          description: styles.description,
          actionButton: styles.actionButton,
          cancelButton: styles.cancelButton,
        },
      }}
      {...props}
    />
  );
}

export { Toaster, toast };
