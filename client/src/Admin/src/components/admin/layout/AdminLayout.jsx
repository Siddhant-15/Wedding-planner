import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAdminAuth } from "../../../context/AdminAuthContext";
import styles from "./AdminLayout.module.css";

const TITLES = {
  "/admin/dashboard": "Dashboard",
  "/admin/vendors": "Vendor Management",
  "/admin/services": "Service Moderation",
  "/admin/bookings": "Bookings",
  "/admin/reviews": "Review Moderation",
  "/admin/reports": "Reports & Flags",
  "/admin/featured": "Featured Services",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings",
};

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate("/admin/login", { replace: true }); };

  return (
    <div className="admin-root">
      <div className={styles.shell}>
        <Sidebar
          open={open}
          collapsed={collapsed}
          onClose={() => setOpen(false)}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          onLogout={handleLogout}
        />
        <div className={`${styles.main} ${collapsed ? styles.mainCollapsed : ""}`}>
          <Topbar
            onToggleSidebar={() => setOpen((v) => !v)}
            onLogout={handleLogout}
            title={TITLES[pathname] || "Admin"}
          />
          <main className={styles.content}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
