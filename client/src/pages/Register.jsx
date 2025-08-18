import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from "../context/AuthContext"
import { showSuccess, showError } from '../utils/toast';
import styles from "../styles/Login.module.css"

export default function Register() {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'customer';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showError("Passwords do not match", "Password Mismatch");
      return;
    }
    
    setLoading(true);
    
    try {
      await register(formData.name, formData.email, formData.password, userType);
      showSuccess(`Welcome to Mangalam!`, "Registration Successful");
      navigate('/');
    } catch (error) {
      showError("Please try again", "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {userType === 'customer' ? 'Customer Registration' : 'Vendor Registration'}
          </h1>
          <p className={styles.subtitle}>
            Create your {userType} account
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <input
              type="text"
              required
              className={styles.input}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              required
              className={styles.input}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

          <div className={styles.inputGroup}>
            <label className={styles.label}>Confirm Password</label>
            <input
              type="password"
              required
              className={styles.input}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${styles.button} ${loading ? styles.loading : ''}`}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Already have an account?{' '}
            <Link 
              to={`/login?type=${userType}`} 
              className={styles.link}
            >
              Sign in
            </Link>
          </p>
          <p>
            {userType === 'customer' ? 
              <Link to="/register?type=vendor" className={styles.link}>Register as Vendor</Link> :
              <Link to="/register?type=customer" className={styles.link}>Register as Customer</Link>
            }
          </p>
        </div>
      </div>
    </div>
  );
}
