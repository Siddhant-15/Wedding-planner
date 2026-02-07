// Frontend: ProfileSettings.jsx
import React, { useState, useEffect } from "react";
import { User, MapPin, Phone, Mail, Camera, CheckCircle, AlertCircle, Loader2, Save } from "lucide-react";
import styles from "../styles/ProfileSettings.module.css";  // Module CSS below
import { useAuth } from "../context/AuthContext";
// import { userAPI } from "../utils/api";  
import Navbar from "../components/Navbar";

export default function ProfileSettings() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    location: "",
    phone: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        location: user.location || "",
        phone: user.phone || "",
      });
      setAvatarPreview(user.avatar || "");
    }
  }, [user]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("first_name", form.first_name);
    formData.append("last_name", form.last_name);
    formData.append("location", form.location);
    formData.append("phone", form.phone);
    if (avatarFile) formData.append("avatar", avatarFile);

    try {
      // const response = await userAPI.updateProfile(formData);  // Assume PUT /users/me
      // setUser(response.data);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    setError(null);
    try {
      // await userAPI.sendVerification();  // POST /users/send-verification
      setSuccess("Verification code sent (check console/logs for OTP).");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send verification code.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);
    try {
      // const response = await userAPI.verify({ code: otp });  // POST /users/verify
      setUser(response.data);
      setSuccess("Email verified successfully!");
      setOtp("");
    } catch (err) {
      setError(err.response?.data?.detail || "Verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
    <Navbar />
    <div className={styles.container}>
      <h1 className={styles.title}>Profile Settings</h1>
      
      {error && <div className={styles.alertError}><AlertCircle size={16} /> {error}</div>}
      {success && <div className={styles.alertSuccess}><CheckCircle size={16} /> {success}</div>}
      
      <form onSubmit={handleSaveProfile} className={styles.section}>
        <h2 className={styles.sectionTitle}><User size={20} /> Personal Information</h2>
        
        <div className={styles.avatarContainer}>
          <div className={styles.avatarPreview}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className={styles.avatarImage} />
            ) : (
              <User size={64} className={styles.avatarPlaceholder} />
            )}
          </div>
          <label className={styles.avatarUpload}>
            <Camera size={20} />
            Change Avatar
            <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </label>
        </div>
        
        <div className={styles.inputGroup}>
          <label className={styles.label}>First Name</label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleInputChange}
            className={styles.input}
            required
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label className={styles.label}>Last Name</label>
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleInputChange}
            className={styles.input}
            required
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label className={styles.label}><MapPin size={16} /> Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="City, Country"
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label className={styles.label}><Phone size={16} /> Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="+1-123-456-7890"
            pattern="^\+?[1-9]\d{1,14}$"
          />
        </div>
        
        <button type="submit" disabled={isSaving} className={styles.saveButton}>
          {isSaving ? <Loader2 className={styles.spinner} /> : <Save size={18} />}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </form>
      
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}><Mail size={20} /> Email Verification</h2>
        <p className={styles.emailDisplay}>{user?.email} {user?.is_verified ? "(Verified)" : "(Not Verified)"}</p>
        
        {!user?.is_verified && (
          <>
            <button onClick={handleSendOtp} disabled={isSendingOtp} className={styles.actionButton}>
              {isSendingOtp ? <Loader2 className={styles.spinner} /> : null}
              {isSendingOtp ? "Sending..." : "Send Verification Code"}
            </button>
            
            <form onSubmit={handleVerifyOtp} className={styles.otpForm}>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={styles.otpInput}
                placeholder="Enter 6-digit code"
                maxLength={6}
                pattern="\d{6}"
                required
              />
              <button type="submit" disabled={isVerifying} className={styles.verifyButton}>
                {isVerifying ? <Loader2 className={styles.spinner} /> : null}
                {isVerifying ? "Verifying..." : "Verify"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
    </>
  );
}