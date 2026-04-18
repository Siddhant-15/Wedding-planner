import React, { useState, useEffect } from "react";
import styles from "../../styles/VendorOnboarding.module.css";
import {
  Building2,
  MapPin,
  UserCog,
  ClipboardCheck,
  ChevronRight,
  ChevronLeft,
  Check,
  AlignLeft,
  Map,
  Globe,
  Briefcase,
  User,
  Hash
} from "lucide-react";
import logo from "../../assets/logo.png";
import { vendorService } from "../../utils/api/services/vendor.service";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../../utils/toast";

const steps = [
  { label: "Business Details" },
  { label: "Address Info" },
  { label: "Experience" },
  { label: "Review" },
];

const VendorOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    business_name: "",
    business_description: "",
    add_line1: "",
    add_line2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    experience_years: "",
    contact_person: "",
    website: "",
  });
  const [errors, setErrors] = useState({});
  const [isPinFetching, setIsPinFetching] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      if (formData.country.toLowerCase() === 'india' && formData.pincode.length === 6) {
        setIsPinFetching(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
          const data = await res.json();
          if (data && data[0] && data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            setFormData(prev => ({
              ...prev,
              city: postOffice.District,
              state: postOffice.State
            }));
            setErrors(prev => ({ ...prev, city: "", state: "" }));
          }
        } catch (error) {
          console.error("Failed to fetch location from pin");
        } finally {
          setIsPinFetching(false);
        }
      }
    };

    fetchLocation();
  }, [formData.pincode, formData.country]);

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 0) {
      if (!formData.business_name.trim()) newErrors.business_name = "Business Name is required";
      if (!formData.business_description.trim()) newErrors.business_description = "Business Description is required";
    } else if (currentStep === 1) {
      if (!formData.add_line1.trim()) newErrors.add_line1 = "Address Line 1 is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.country.trim()) newErrors.country = "Country is required";
      if (!formData.pincode.trim()) {
        newErrors.pincode = "Pincode is required";
      } else if (formData.country.toLowerCase() === 'india' && !/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = "Enter a valid 6-digit Pincode";
      }
    } else if (currentStep === 2) {
      if (!formData.contact_person.trim()) newErrors.contact_person = "Contact Person Name is required";
      if (formData.experience_years === "" || formData.experience_years < 0) {
        newErrors.experience_years = "Valid experience in years is required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStepValid = () => {
    if (currentStep === 0) return formData.business_name && formData.business_description;
    if (currentStep === 1) return formData.add_line1 && formData.city && formData.state && formData.country && formData.pincode && (formData.country.toLowerCase() !== 'india' || /^\d{6}$/.test(formData.pincode));
    if (currentStep === 2) return formData.contact_person && formData.experience_years !== "";
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const nextStep = () => validateStep() && setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    if (validateStep()) {
      try {
        const payload = { ...formData, experience_years: parseInt(formData.experience_years) || 0 };
        const res = await vendorService.onboarding(payload);
        showSuccess(res.data.message || "Onboarding successful!");
        navigate("/vendor/dashboard");
      } catch (err) {
        console.error("Onboarding failed", err);
        showError(err.response?.data?.message || "Something went wrong.");
      }
    }
  };

  const renderInput = (name, label, IconComp, type = "text", wrapperClass = "") => {
    const isTextarea = type === "textarea";
    const Element = isTextarea ? "textarea" : "input";

    return (
      <div className={wrapperClass}>
        <div className={`${styles.inputWrapper} ${isTextarea ? styles.textareaWrapper : ""}`}>
          {IconComp && <span className={`${styles.inputIcon} ${isTextarea ? styles.textareaIcon : ""}`}>{IconComp}</span>}
          <Element
            type={isTextarea ? undefined : type}
            name={name}
            id={name}
            className={`
              ${isTextarea ? styles.textarea : styles.input} 
              ${IconComp ? styles.inputWithIcon : ""} 
              ${errors[name] ? styles.inputError : ""}
            `}
            placeholder=" "
            value={formData[name]}
            onChange={handleChange}
          />
          <label
            htmlFor={name}
            className={`${styles.floatingLabel} ${IconComp ? styles.labelWithIcon : ""}`}
          >
            {label}
          </label>
        </div>
        {errors[name] && <span className={styles.errorText}>{errors[name]}</span>}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <img src={logo} alt="Brand Logo" className={styles.logo} />
          <h1 className={styles.title}>Vendor Onboarding</h1>
          <p className={styles.subtitle}>Complete your profile to start receiving bookings.</p>
        </div>

        {/* Mobile Progress Text */}
        <div className={styles.mobileProgress}>
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].label}
        </div>

        {/* Desktop Stepper */}
        <div className={styles.progressWrapper}>
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
              <div key={index} className={styles.stepWrapper}>
                <div
                  className={`
                    ${styles.stepCircle} 
                    ${isActive ? styles.activeStep : ""} 
                    ${isCompleted ? styles.completedStep : ""}
                  `}
                >
                  {isCompleted ? <Check size={18} /> : index + 1}
                </div>
                <p className={`${styles.stepLabel} ${isActive ? styles.activeLabel : ""}`}>
                  {step.label}
                </p>
                {index < steps.length - 1 && (
                  <div className={`${styles.connector} ${isCompleted ? styles.activeConnector : ""}`}></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className={styles.stepContent}>
          {currentStep === 0 && (
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}><Building2 className={styles.titleIcon} /> Business Details</h2>
              <div className={styles.formGroup}>
                {renderInput("business_name", "Business Name", <Briefcase size={20} />)}
                {renderInput("business_description", "Business Description", <AlignLeft size={20} />, "textarea")}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}><MapPin className={styles.titleIcon} /> Address Information</h2>
              <div className={styles.formGroup}>
                {renderInput("add_line1", "Address Line 1", <Map size={20} />)}
                {renderInput("add_line2", "Address Line 2 (Optional)", <Map size={20} />)}

                <div className={styles.grid}>
                  {renderInput("pincode", "Pincode", <Hash size={20} />)}
                  {renderInput("country", "Country", <Globe size={20} />)}
                </div>

                <div className={styles.grid}>
                  {renderInput("city", isPinFetching ? "Fetching..." : "City", <Building2 size={20} />)}
                  {renderInput("state", isPinFetching ? "Fetching..." : "State", <MapPin size={20} />)}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}><UserCog className={styles.titleIcon} /> Contact & Experience</h2>
              <div className={styles.formGroup}>
                {renderInput("contact_person", "Contact Person Name", <User size={20} />)}
                <div className={styles.grid}>
                  {renderInput("experience_years", "Years of Experience", <Briefcase size={20} />, "number")}
                  {renderInput("website", "Website URL (Optional)", <Globe size={20} />)}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}><ClipboardCheck className={styles.titleIcon} /> Review Your Details</h2>
              <div className={styles.reviewBox}>
                <div className={styles.reviewGrid}>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Business Name</span>
                    <span className={styles.reviewValue}>{formData.business_name}</span>
                  </div>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Contact Person</span>
                    <span className={styles.reviewValue}>{formData.contact_person}</span>
                  </div>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Experience</span>
                    <span className={styles.reviewValue}>{formData.experience_years} Years</span>
                  </div>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Location</span>
                    <span className={styles.reviewValue}>{formData.city}, {formData.state}</span>
                  </div>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Address</span>
                    <span className={styles.reviewValue}>{formData.add_line1} {formData.add_line2 && `, ${formData.add_line2}`}</span>
                  </div>
                  {formData.website && (
                    <div className={styles.reviewItem}>
                      <span className={styles.reviewLabel}>Website</span>
                      <span className={styles.reviewValue}>{formData.website}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className={styles.navigation}>
          {currentStep > 0 ? (
            <button className={`${styles.btn} ${styles.backBtn}`} onClick={prevStep}>
              <ChevronLeft size={20} /> Back
            </button>
          ) : (
            <div></div> // Spacing placeholder
          )}

          {currentStep < steps.length - 1 ? (
            <button className={`${styles.btn} ${styles.continueBtn}`} onClick={nextStep} disabled={!isStepValid()}>
              Continue <ChevronRight size={20} />
            </button>
          ) : (
            <button className={`${styles.btn} ${styles.finishBtn}`} onClick={handleSubmit} disabled={!isStepValid()}>
              Complete Onboarding <Check size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorOnboarding;
