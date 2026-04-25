import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import styles from "./AdminLogin.module.css";

export default function AdminLogin() {
  const { login, isAuthed } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ FIX: useEffect for navigation
  useEffect(() => {
    if (isAuthed) {
      navigate(from, { replace: true });
    }
  }, [isAuthed, navigate, from]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      // navigation handled by useEffect
    } catch (err) {
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brandRow}>
          <div className={styles.logo}>A</div>
          <div className={styles.brandTitle}>Admin Console</div>
        </div>

        <h1 className={styles.heading}>Sign in to your account</h1>
        <p className={styles.sub}>
          Enter your credentials to access the admin dashboard.
        </p>

        <form onSubmit={onSubmit} className={styles.form} noValidate>
          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@platform.com"
              disabled={loading}
            />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <div className={styles.pwdWrap}>
              <input
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                className={styles.pwdToggle}
                onClick={() => setShowPwd((v) => !v)}
                tabIndex={-1}
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.submit}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div className={styles.hint}>
            Demo: <code>admin@platform.com</code> / <code>admin123</code>
          </div>
        </form>
      </div>
    </div>
  );
}