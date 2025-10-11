import React from "react";
import styles from "../../styles/ui/Label.module.css"

const Label = React.forwardRef(({ className = "", children, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={`${styles.label} ${className}`}
      {...props}
    >
      {children}
    </label>
  );
});

Label.displayName = "Label";

export { Label };
