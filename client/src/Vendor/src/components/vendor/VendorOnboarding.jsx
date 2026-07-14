import React, { useState } from "react";
import styles from "../../styles/VendorOnboarding.module.css";
import {
  Check,
  Briefcase,
  MapPin,
  UserCog,
  ClipboardCheck,
  Sparkles,
} from "lucide-react";
import logo from "../../../../assets/logo.png";
import { vendorService } from "../../../../utils/api/services/vendor.service";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../../../../utils/toast";

const steps = [
  { label: "Business Info", icon: <Briefcase size={16} /> },
  { label: "Address", icon: <MapPin size={16} /> },
  { label: "Professional", icon: <UserCog size={16} /> },
  { label: "Review", icon: <ClipboardCheck size={16} /> },
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
      if (!formData.business_name.trim())
        newErrors.business_name = "Business Name is required";
      if (!formData.business_description.trim())
        newErrors.business_description = "Business Description is required";
    } else if (currentStep === 1) {
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.country.trim()) newErrors.country = "Country is required";
      if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
    } else if (currentStep === 2) {
      if (!formData.experience_years)
        newErrors.experience_years = "Experience is required";
      if (!formData.website.trim()) newErrors.website = "Website is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStepValid = () => {
    if (currentStep === 0)
      return formData.business_name && formData.business_description;
    if (currentStep === 1)
      return (
        formData.city &&
        formData.state &&
        formData.country &&
        formData.pincode
      );
    if (currentStep === 2)
      return formData.experience_years && formData.website;
    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const nextStep = () =>
    validateStep() &&
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    if (validateStep()) {
      try {
        const res = await vendorService.onboarding(formData);
        showSuccess(res.message);
        navigate("/vendor/dashboard");
      } catch (err) {
        console.error("Onboarding failed", err);
        showError(err.response.data.message || "Something went wrong");
      }
    }
  };

  const isLast = currentStep === steps.length - 1;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <Sparkles size={20} />
          </div>
          <div className={styles.headerText}>
            <h2 className={styles.title}>Vendor Onboarding</h2>
            <p className={styles.subtitle}>
              Set up your business profile to start receiving leads
            </p>
          </div>
          <img src={logo} alt="Brand Logo" className={styles.logo} />
        </div>

        {/* Stepper */}
        <div className={styles.stepper}>
          {steps.map((step, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            const clickable = i <= currentStep;
            return (
              <React.Fragment key={step.label}>
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && setCurrentStep(i)}
                  className={`${styles.stepBtn} ${
                    isActive ? styles.stepBtnActive : ""
                  } ${isDone ? styles.stepBtnDone : ""}`}
                >
                  <span className={styles.stepBadge}>
                    {isDone ? <Check size={12} /> : i + 1}
                  </span>
                  <span className={styles.stepLabel}>{step.label}</span>
                </button>
                {i < steps.length - 1 && (
                  <span
                    className={`${styles.connector} ${
                      isDone ? styles.connectorDone : ""
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Body */}
        <div className={styles.body}>
          {currentStep === 0 && (
            <div className={styles.formGroup}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Business Name <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  name="business_name"
                  placeholder="e.g., Royal Events & Co."
                  className={`${styles.input} ${
                    errors.business_name ? styles.inputError : ""
                  }`}
                  value={formData.business_name}
                  onChange={handleChange}
                />
                {errors.business_name && (
                  <span className={styles.errorText}>
                    {errors.business_name}
                  </span>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  Business Description <span className={styles.req}>*</span>
                </label>
                <textarea
                  name="business_description"
                  placeholder="Tell customers what makes your business special..."
                  rows={4}
                  className={`${styles.textarea} ${
                    errors.business_description ? styles.inputError : ""
                  }`}
                  value={formData.business_description}
                  onChange={handleChange}
                />
                {errors.business_description && (
                  <span className={styles.errorText}>
                    {errors.business_description}
                  </span>
                )}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className={styles.formGroup}>
              <div className={styles.sectionHeading}>
                <MapPin size={16} /> Location Details
              </div>
              <div className={styles.grid}>
                <div className={styles.field}>
                  <label className={styles.label}>City <span className={styles.req}>*</span></label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    className={`${styles.input} ${errors.city ? styles.inputError : ""}`}
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>State <span className={styles.req}>*</span></label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    className={`${styles.input} ${errors.state ? styles.inputError : ""}`}
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Country <span className={styles.req}>*</span></label>
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    className={`${styles.input} ${errors.country ? styles.inputError : ""}`}
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Pincode <span className={styles.req}>*</span></label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Pincode"
                    className={`${styles.input} ${errors.pincode ? styles.inputError : ""}`}
                    value={formData.pincode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className={styles.formGroup}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Years of Experience <span className={styles.req}>*</span>
                </label>
                <input
                  type="number"
                  name="experience_years"
                  placeholder="e.g., 5"
                  className={`${styles.input} ${
                    errors.experience_years ? styles.inputError : ""
                  }`}
                  value={formData.experience_years}
                  onChange={handleChange}
                />
                {errors.experience_years && (
                  <span className={styles.errorText}>
                    {errors.experience_years}
                  </span>
                )}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  Website <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  name="website"
                  placeholder="https://yourbusiness.com"
                  className={`${styles.input} ${
                    errors.website ? styles.inputError : ""
                  }`}
                  value={formData.website}
                  onChange={handleChange}
                />
                {errors.website && (
                  <span className={styles.errorText}>{errors.website}</span>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className={styles.review}>
              <div className={styles.sectionHeading}>
                <ClipboardCheck size={16} /> Review Your Details
              </div>
              <dl className={styles.reviewList}>
                {Object.entries(formData).map(([k, v]) => (
                  <div key={k} className={styles.reviewRow}>
                    <dt className={styles.reviewKey}>{k.replace(/_/g, " ")}</dt>
                    <dd className={styles.reviewVal}>
                      {v?.toString() || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Back
          </button>
          <div className={styles.footerRight}>
            <span className={styles.stepCount}>
              Step {currentStep + 1} of {steps.length}
            </span>
            {isLast ? (
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleSubmit}
              >
                Finish Onboarding
              </button>
            ) : (
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={nextStep}
                disabled={!isStepValid()}
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorOnboarding;