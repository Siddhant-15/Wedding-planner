import React from "react";
import styles from "../../styles/ui/Textarea.module.css";

const Textarea = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <textarea
      className={`${styles.textarea} ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
