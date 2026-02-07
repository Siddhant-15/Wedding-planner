// components/ui/Button.jsx
import React from 'react';
import styles from '../../styles/ui/Button.module.css';

const Button = React.forwardRef(({
  className = '',
  variant = 'primary',
  size = 'default',
  children,
  ...props
}, ref) => {
  const variantClasses = {
    primary: styles.variantPrimary,
    secondary: styles.variantSecondary,
    outline: styles.variantOutline,
    ghost: styles.variantGhost,
  };

  const sizeClasses = {
    default: styles.sizeDefault,
    sm: styles.sizeSm,
    lg: styles.sizeLg,
  };

  return (
    <button
      className={`
        ${styles.base}
        ${variantClasses[variant] || styles.variantPrimary}
        ${sizeClasses[size] || styles.sizeDefault}
        ${className}
      `}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };