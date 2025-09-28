import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { showSuccess, showError } from '../utils/toast';
import styles from "../styles/Login.module.css";
import jwtDecode from "jwt-decode";
import { GoogleLogin } from '@react-oauth/google';
import weddingImage from "../assets/slide-1.jpg";

// Google logo (official SVG)
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" width="18" height="18">
    <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.4H272v95.4h147.2c-6.4 34.7-25.9 64-55.2 83.7v69.3h89.2c52.2-48.1 80.3-118.9 80.3-197.9z"/>
    <path fill="#34A853" d="M272 544.3c73.6 0 135.2-24.3 180.2-66.2l-89.2-69.3c-24.8 16.6-56.5 26.4-91 26.4-70 0-129.3-47.2-150.5-110.9H30.8v69.7c44.7 88.3 136.8 150.3 241.2 150.3z"/>
    <path fill="#FBBC05" d="M121.5 323.6c-11.3-33.7-11.3-69.9 0-103.6V150.3H30.8c-23 45.5-30.8 97.9-22.5 150.2s32.2 104.7 69.5 143.7l73.7-56.9z"/>
    <path fill="#EA4335" d="M272 107.7c39.9-.6 77.8 13.8 107 39.8l80.1-80.1C407.3 24.9 342.8 0 272 0 167.6 0 75.5 62 30.8 150.3l90.7 69.7c21.1-63.7 80.5-110.9 150.5-110.9z"/>
  </svg>
);

export default function Login() {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'customer';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authAPI.login({ ...formData, role: userType });
      const { access_token, refresh_token } = res.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      const decoded = jwtDecode(access_token);
      setUser({
        id: decoded.sub,
        email: formData.email,
        type: decoded.role,
        exp: decoded.exp,
      });

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

  // Google login handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;

      // send to backend for verification + JWT issue
      const res = await authAPI.googleLogin({ token: idToken, role: userType });
      const { access_token, refresh_token } = res.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      const decoded = jwtDecode(access_token);
      setUser({
        id: decoded.sub,
        email: decoded.email,
        type: decoded.role,
        exp: decoded.exp,
      });

      showSuccess('Welcome with Google!', 'Login Successful');
      navigate('/');
    } catch (err) {
      console.error("Google login error:", err);
      showError('Google login failed', 'Error');
    }
  };

  const handleGoogleFailure = () => {
    showError('Google login cancelled or failed', 'Error');
  };

  return (
    <div className={styles.container}>
      {/* Left Image */}
      <div className={styles.left}>
        <div 
          className={styles.image} 
          style={{ backgroundImage: `url(${weddingImage})` }}
        />
        <div className={styles.overlay} />
        <div className={styles.leftContent}>
          <h1 className={styles.title}>
            Celebrate Your Perfect
            <span className={styles.highlight}>Wedding Day</span>
          </h1>
          <p className={styles.subtitle}>
            Join thousands of couples who found their dream wedding through Mangalam
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className={styles.right}>
        <div className={styles.formWrapper}>
          <div className={styles.card}>
            <div className={styles.header}>
              <h2>Welcome Back</h2>
              <p>Sign in to your {userType} account</p>
            </div>

            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />

            <div className={styles.divider}>
              <span>or continue with email</span>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <Label htmlFor="email">Email address</Label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.icon} />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <Label htmlFor="password">Password</Label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.icon} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
            </form>

            <div className={styles.footer}>
              <p>
                Don't have an account? <Link to={`/register?type=${userType}`}>Sign up</Link>
              </p>
              <p>
                {userType === 'customer' ? (
                  <Link to="/login?type=vendor">Login as Vendor</Link>
                ) : (
                  <Link to="/login?type=customer">Login as Customer</Link>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}