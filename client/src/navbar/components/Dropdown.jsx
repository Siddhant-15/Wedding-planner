import React, { useRef, useEffect, useId } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useClickOutside } from "../hooks/useNavbarBehavior";
import styles from "../styles/Dropdown.module.css";

function Dropdown({
  label,
  triggerContent,
  items = [],
  open,
  onOpenChange,
  align = "left",
  children,
  className,
}) {
  const ref = useRef(null);
  const id = useId();

  useClickOutside(ref, () => onOpenChange(false), open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onOpenChange(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <div className={`${styles.dropdown} ${className || ""}`} ref={ref}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => onOpenChange(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
      >
        {triggerContent || label}
        <ChevronDown size={16} className={`${styles.chev} ${open ? styles.chevOpen : ""}`} />
      </button>

      <div
        id={id}
        role="menu"
        className={`${styles.menu} ${open ? styles.menuOpen : ""} ${align === "right" ? styles.alignRight : ""
          }`}
      >
        {children
          ? children
          : items.map((it, idx) => {
            if (it.divider) return <div key={`d-${idx}`} className={styles.divider} />;

            const Icon = it.icon; // 👈 IMPORTANT

            const content = (
              <>
                {Icon && (
                  <span className={styles.itemIcon}>
                    {React.isValidElement(Icon) ? Icon : <Icon size={16} />}
                  </span>
                )}
                <span className={styles.itemBody}>
                  <span className={styles.itemLabel}>{it.label}</span>
                  {it.desc && <span className={styles.itemDesc}>{it.desc}</span>}
                </span>
              </>
            );

            const cls = `${styles.item} ${it.danger ? styles.danger : ""}`;

            if (it.to) {
              return (
                <Link
                  key={it.label + idx}
                  to={it.to}
                  role="menuitem"
                  className={cls}
                  onClick={() => onOpenChange(false)}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={it.label + idx}
                type="button"
                role="menuitem"
                className={cls}
                onClick={() => {
                  it.onClick?.();
                  onOpenChange(false);
                }}
              >
                {content}
              </button>
            );
          })}
      </div>
    </div>
  );
}

export default Dropdown;