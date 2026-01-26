import React from "react";
import styles from "../../styles/ui/Popover.module.css";

// components/ui/Popover.jsx
import * as PopoverPrimitive from '@radix-ui/react-popover';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef(
  (
    {
      className = '',
      align = 'center',
      sideOffset = 8,
      children,
      ...props
    },
    ref
  ) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={`${styles.content} ${className}`}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
);
PopoverContent.displayName = 'PopoverContent';

// Optional: Close button inside content (useful for mobile/touch)
const PopoverClose = PopoverPrimitive.Close;

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
};
