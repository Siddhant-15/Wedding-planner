import React from "react";
import { ChevronRight, Home } from "lucide-react";
import styles from "../styles/PageShell.module.css";

/**
 * Shared page wrapper — header, breadcrumb, container, optional sidebar layout.
 * Keeps every account page visually consistent.
 */
function PageShell({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  sidebar,
  children,
}) {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        {breadcrumbs.length > 0 && (
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <a href="/" className={styles.crumbLink}>
              <Home size={14} />
              <span>Home</span>
            </a>
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                <ChevronRight size={14} className={styles.crumbSep} />
                {crumb.href && i < breadcrumbs.length - 1 ? (
                  <a href={crumb.href} className={styles.crumbLink}>
                    {crumb.label}
                  </a>
                ) : (
                  <span className={styles.crumbCurrent}>{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {actions && <div className={styles.headerActions}>{actions}</div>}
        </header>

        {/* Body */}
        <div className={sidebar ? styles.bodyWithSidebar : styles.body}>
          {sidebar && <aside className={styles.sidebar}>{sidebar}</aside>}
          <main className={styles.main}>{children}</main>
        </div>
      </div>
    </div>
  );
}

export default PageShell;
