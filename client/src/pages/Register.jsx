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
    firstName: '',
    lastName: '',
    phone: '',
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
      await register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.phone,
        formData.password,
        userType
      );
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
          {/* First Name */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>First Name</label>
            <input
              type="text"
              required
              className={styles.input}
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Enter your first name"
            />
          </div>

          {/* Last Name */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Last Name</label>
            <input
              type="text"
              required
              className={styles.input}
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Enter your last name"
            />
          </div>

          {/* Phone */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Phone Number</label>
            <input
              type="tel"
              required
              className={styles.input}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter your phone number"
            />
          </div>

          {/* Email */}
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

          {/* Password */}
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

          {/* Confirm Password */}
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
