import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api';
import { showSuccess, showError } from '../utils/toast';
import styles from "../styles/Login.module.css"
import jwtDecode from "jwt-decode";


export default function Login() {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'customer';

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const res = await authAPI.login(formData);
    
          const { access_token, refresh_token } = res.data;
    
          // Store tokens
          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);
    
          // Decode user info and update AuthContext
          const decodedUser = jwtDecode(access_token);
          setUser(decodedUser);
      showSuccess('Welcome back!', 'Login Successful');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Please check your credentials';
      showError(errorMessage, 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {userType === 'customer' ? 'Customer Login' : 'Vendor Login'}
          </h1>
          <p className={styles.subtitle}>
            Sign in to your {userType} account
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              required
              className={styles.input}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className={styles.input}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter your password"
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${styles.button} ${loading ? styles.loading : ''}`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Don't have an account?{' '}
            <Link to={`/register?type=${userType}`} className={styles.link}>
              Sign up
            </Link>
          </p>
          <p>
            {userType === 'customer' ? (
              <Link to="/login?type=vendor" className={styles.link}>
                Login as Vendor
              </Link>
            ) : (
              <Link to="/login?type=customer" className={styles.link}>
                Login as Customer
              </Link>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
