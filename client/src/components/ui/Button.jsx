import React from "react";
import { Slot } from "@radix-ui/react-slot";
import styles from "../../styles/ui/Button.module.css"

const Button = React.forwardRef(
  ({ className = "", variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const variantClass = styles[`variant-${variant}`] || "";
    const sizeClass = styles[`size-${size}`] || "";
    return (
      <Comp
        className={`${styles.button} ${variantClass} ${sizeClass} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
