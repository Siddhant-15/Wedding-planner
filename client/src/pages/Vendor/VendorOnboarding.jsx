import React, { useState } from "react";
import styles from "../../styles/VendorOnboarding.module.css";
import { CheckCircle, Briefcase, MapPin, UserCog, ClipboardCheck } from "lucide-react";
import logo from "../../assets/logo.png";
import { vendorAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../../utils/toast";

const steps = [
  { label: "Business Info", icon: <Briefcase size={20} /> },
  { label: "Address Info", icon: <MapPin size={20} /> },
  { label: "Professional", icon: <UserCog size={20} /> },
  { label: "Review", icon: <ClipboardCheck size={20} /> },
];

const VendorOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    business_name: "",
    business_description: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    experience_years: "",
    website: "",
  });  
  const [errors, setErrors] = useState({});

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 0) {
      if (!formData.business_name.trim()) newErrors.business_name = "Business Name is required";
      if (!formData.business_description.trim()) newErrors.business_description = "Business Description is required";
    } else if (currentStep === 1) {
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.country.trim()) newErrors.country = "Country is required";
      if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
    } else if (currentStep === 2) {
      if (!formData.experience_years) newErrors.experience_years = "Experience is required";
      if (!formData.website.trim()) newErrors.website = "Website is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStepValid = () => {
    if (currentStep === 0) return formData.business_name && formData.business_description;
    if (currentStep === 1) return formData.city && formData.state && formData.country && formData.pincode;
    if (currentStep === 2) return formData.experience_years && formData.website;
    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const nextStep = () => validateStep() && setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    if (validateStep()) {
      try {
        const res = await vendorAPI.onboarding(formData);
        showSuccess(res.data.message);
        console.log(res.data);
        navigate("/vendor/dashboard");
      } catch (err) {
        console.error("Onboarding failed", err);
        showError(err.response.data.message);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoHeader}>
          <img src={logo} alt="Brand Logo" className={styles.logo} />
        </div>

        {/* Stepper */}
        <div className={styles.progressWrapper}>
          {steps.map((step, index) => (
            <div key={index} className={styles.stepWrapper}>
              <div
                className={`${styles.stepCircle} ${index <= currentStep ? styles.activeStep : ""}`}
              >
                {index < currentStep ? <CheckCircle size={20} /> : steps[index].icon}
              </div>
              <p className={`${styles.stepLabel} ${index <= currentStep ? styles.activeLabel : ""}`}>
                {step.label}
              </p>
              {index < steps.length - 1 && (
                <div className={`${styles.connector} ${index < currentStep ? styles.activeConnector : ""}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className={styles.stepContent}>
          {currentStep === 0 && (
            <div className={styles.formGroup}>
              <input type="text" name="business_name" placeholder="Business Name" className={styles.input} value={formData.business_name} onChange={handleChange}/>
              <textarea name="business_description" placeholder="Business Description" className={styles.textarea} value={formData.business_description} onChange={handleChange}/>
            </div>
          )}
          {currentStep === 1 && (
            <div className={styles.formGroup}>
              <div className={styles.grid}>
                <input type="text" name="city" placeholder="City" className={styles.input} value={formData.city} onChange={handleChange}/>
                <input type="text" name="state" placeholder="State" className={styles.input} value={formData.state} onChange={handleChange}/>
              </div>
              <div className={styles.grid}>
                <input type="text" name="country" placeholder="Country" className={styles.input} value={formData.country} onChange={handleChange}/>
                <input type="text" name="pincode" placeholder="Pincode" className={styles.input} value={formData.pincode} onChange={handleChange}/>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className={styles.formGroup}>
              <input type="number" name="experience_years" placeholder="Experience (Years)" className={styles.input} value={formData.experience_years} onChange={handleChange}/>
              <input type="text" name="website" placeholder="Website" className={styles.input} value={formData.website} onChange={handleChange}/>
              {/* <label className={styles.checkbox}><input type="checkbox" name="is_verified" checked={formData.is_verified} onChange={handleChange}/> Verified Business</label> */}
            </div>
          )}
          {currentStep === 3 && (
            <div className={styles.reviewBox}>
              <h3>Review Your Details</h3>
              <ul>
                {Object.entries(formData).map(([k, v]) => (
                  <li key={k}><strong>{k.replace(/_/g, " ")}:</strong> {v?.toString() || "-"}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className={styles.navigation}>
          {currentStep > 0 && <button className={styles.backBtn} onClick={prevStep}>Back</button>}
          {currentStep < steps.length - 1 ? (
            <button className={styles.continueBtn} onClick={nextStep} disabled={!isStepValid()}>Continue</button>
          ) : (
            <button className={styles.finishBtn} onClick={handleSubmit}>Finish</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorOnboarding;
