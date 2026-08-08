import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import { showSuccess, showError } from '../utils/toast';
import styles from "../styles/pages/Register.module.css";
import weddingImage from "../assets/slide-1.jpg";

export default function Register() {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'customer';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // ---------- Regex ----------
  const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;          // letters only (no numbers)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;                     // exactly 10 digits
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) return 'This field is required';
        if (!nameRegex.test(value.trim())) {
          return 'Only letters allowed (no numbers). Min 2 characters';
        }
        return '';

      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!emailRegex.test(value.trim())) return 'Enter a valid email address';
        return '';

      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!phoneRegex.test(value.trim())) {
          return 'Phone must be exactly 10 digits (numbers only)';
        }
        return '';

      case 'password':
        if (!value) return 'Password is required';
        if (!passwordRegex.test(value)) {
          return 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number & 1 special character';
        }
        return '';

      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';

      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    // Extra protection: block non-digits from phone field while typing
    if (id === 'phone') {
      const onlyDigits = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: onlyDigits }));
      
      if (errors.phone) {
        setErrors((prev) => ({
          ...prev,
          phone: validateField('phone', onlyDigits)
        }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [id]: value }));

    // Live clear/update error after first submit
    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: validateField(id, value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Please fix the errors in the form', 'Validation Failed');
      return;
    }

    setLoading(true);
    try {
      await register(
        formData.firstName.trim(),
        formData.lastName.trim(),
        formData.email.trim(),
        formData.phone.trim(),
        formData.password,
        userType
      );
      showSuccess(`Welcome to Mangalam!`, 'Registration Successful');
      navigate(userType === 'vendor' ? '/vendor/onboarding' : '/');
    } catch (error) {
      let errMsg = error.response?.data?.detail || error.message || 'An unexpected error occurred';
      if (Array.isArray(errMsg)) {
        errMsg = errMsg.map((e) => e.msg).join(', ');
      }
      showError(errMsg, 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Panel */}
      <div
        className={styles.leftPanel}
        style={{ backgroundImage: `url(${weddingImage})` }}
      >
        <h1>Start Your Journey</h1>
        <h2>To Forever</h2>
        <p>Create your account and discover the perfect wedding services</p>
      </div>

      {/* Right Panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h2>Create Account</h2>
            <p>Join as a {userType}</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* Name Row */}
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="firstName">First Name</label>
                <div className={styles.inputIconWrapper}>
                  <User className={styles.icon} />
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First"
                    className={errors.firstName ? styles.inputError : ''}
                  />
                </div>
                {errors.firstName && (
                  <span className={styles.errorText}>{errors.firstName}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="lastName">Last Name</label>
                <div className={styles.inputIconWrapper}>
                  <User className={styles.icon} />
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last"
                    className={errors.lastName ? styles.inputError : ''}
                  />
                </div>
                {errors.lastName && (
                  <span className={styles.errorText}>{errors.lastName}</span>
                )}
              </div>
            </div>

            {/* Email */}
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <div className={styles.inputIconWrapper}>
                <Mail className={styles.icon} />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  className={errors.email ? styles.inputError : ''}
                />
              </div>
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            {/* Phone */}
            <div className={styles.inputGroup}>
              <label htmlFor="phone">Phone Number</label>
              <div className={styles.inputIconWrapper}>
                <Phone className={styles.icon} />
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  maxLength={10}
                  className={errors.phone ? styles.inputError : ''}
                />
              </div>
              {errors.phone && (
                <span className={styles.errorText}>{errors.phone}</span>
              )}
            </div>

            {/* Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.inputIconWrapper}>
                <Lock className={styles.icon} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={errors.password ? styles.inputError : ''}
                />
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && (
                <span className={styles.errorText}>{errors.password}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className={styles.inputIconWrapper}>
                <Lock className={styles.icon} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className={errors.confirmPassword ? styles.inputError : ''}
                />
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className={styles.errorText}>{errors.confirmPassword}</span>
              )}
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className={styles.footer}>
            <p>
              Already have an account?{' '}
              <Link to={`/login?type=${userType}`}>Sign in</Link>
            </p>
            <p>
              {userType === 'customer' ? (
                <Link to="/register?type=vendor">Register as Vendor</Link>
              ) : (
                <Link to="/register?type=customer">Register as Customer</Link>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}