import React, { forwardRef } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import styles from "../../styles/Select.module.css";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = forwardRef(({ children, ...props }, ref) => (
  <SelectPrimitive.Trigger ref={ref} className={styles.selectTrigger} {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className={styles.icon} />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));

const SelectScrollUpButton = forwardRef((props, ref) => (
  <SelectPrimitive.ScrollUpButton ref={ref} className={styles.scrollButton} {...props}>
    <ChevronUp className={styles.icon} />
  </SelectPrimitive.ScrollUpButton>
));

const SelectScrollDownButton = forwardRef((props, ref) => (
  <SelectPrimitive.ScrollDownButton ref={ref} className={styles.scrollButton} {...props}>
    <ChevronDown className={styles.icon} />
  </SelectPrimitive.ScrollDownButton>
));

const SelectContent = forwardRef(({ children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={`${styles.selectContent} ${position === "popper" ? styles.popper : ""}`}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={`${styles.viewport} ${position === "popper" ? styles.viewportPopper : ""}`}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));

const SelectLabel = forwardRef((props, ref) => (
  <SelectPrimitive.Label ref={ref} className={styles.selectLabel} {...props} />
));

const SelectItem = forwardRef(({ children, ...props }, ref) => (
  <SelectPrimitive.Item ref={ref} className={styles.selectItem} {...props}>
    <span className={styles.itemIndicatorWrapper}>
      <SelectPrimitive.ItemIndicator>
        <Check className={styles.icon} />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));

const SelectSeparator = forwardRef((props, ref) => (
  <SelectPrimitive.Separator ref={ref} className={styles.separator} {...props} />
));

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
