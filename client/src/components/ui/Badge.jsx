import React from "react";
import styles from "../../styles/Badge.module.css"

function Badge({ variant = "default", className = "", children, ...props }) {
  return (
    <div
      className={`${styles.badge} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Badge;
