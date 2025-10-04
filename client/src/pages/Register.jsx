import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from "../context/AuthContext"
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
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
        formData.password,
        userType
      );
      showSuccess(`Welcome to Mangalam!`, "Registration Successful");
      if (userType === "vendor") {
        navigate("/vendor/onboarding");
      } else {
        navigate("/"); // customer
      }
    } catch (error) {
      const errMsg = error.response?.data?.detail || error.message || "An unexpected error occurred";
      showError(errMsg, "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left side */}
      <div 
        className={styles.leftPanel} 
        style={{ backgroundImage: `url(${weddingImage})` }}
      >
        <div className={styles.leftOverlay} />
        <div className={styles.leftContent}>
          <h1 className={styles.heading}>
            Start Your Journey
            <span className={styles.goldText}>To Forever</span>
          </h1>
          <p className={styles.subHeading}>
            Create your account and discover the perfect wedding services
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className={styles.rightPanel}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h2>Create Account</h2>
            <p>Join as a {userType}</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Name fields */}
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="firstName">First Name</label>
                <div className={styles.inputIconWrapper}>
                  <User className={styles.icon} />
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="First"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="lastName">Last Name</label>
                <div className={styles.inputIconWrapper}>
                  <User className={styles.icon} />
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Last"
                  />
                </div>
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
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
            </div>

            {/* Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.inputIconWrapper}>
                <Lock className={styles.icon} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password"
                />
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className={styles.inputIconWrapper}>
                <Lock className={styles.icon} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
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