// src/components/vendor/ServiceFormModal.jsx
import React, { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import useServiceForm from '../../hooks/useServiceForm';
import { FORM_STEPS } from '../../constants/serviceConstants';
import Stepper from './form/Stepper';
import StepBasicInfo from './form/StepBasicInfo';
import StepPricing from './form/StepPricing';
import StepSpecificDetails from './form/StepSpecificDetails';
import StepAmenitiesImages from './form/StepAmenitiesImages';
import StepReview from './form/StepReview';
import styles from '../../styles/ServiceFormModal.module.css';

const ServiceFormModal = ({ isOpen, onClose, initialData, onSubmit }) => {
  const isEdit = !!initialData?.id;
  const {
    currentStep, setCurrentStep, formData, submitting,
    updateField, updateGeo, updateVariant, addVariant, removeVariant,
    next, back, submit,
  } = useServiceForm(isOpen, initialData ?? null, async (data) => {
    await onSubmit(data);
    onClose();
  });

  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose();
    if (isOpen) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <StepBasicInfo formData={formData} updateField={updateField} updateGeo={updateGeo} />;
      case 1: return <StepPricing formData={formData} updateField={updateField} updateVariant={updateVariant} addVariant={addVariant} removeVariant={removeVariant} />;
      case 2: return <StepSpecificDetails formData={formData} updateField={updateField} />;
      case 3: return <StepAmenitiesImages formData={formData} updateField={updateField} />;
      case 4: return <StepReview formData={formData} goToStep={setCurrentStep} />;
      default: return null;
    }
  };

  const isLast = currentStep === FORM_STEPS.length - 1;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.icon}><Sparkles size={18} /></div>
          <div className={styles.headerText}>
            <h2>{isEdit ? 'Edit Service' : 'Create New Service'}</h2>
            <p>{isEdit ? 'Update your service details' : 'Add a new service to your portfolio'}</p>
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>

        <Stepper steps={FORM_STEPS} current={currentStep} onStepClick={setCurrentStep} />

        <div className={styles.body}>{renderStep()}</div>

        <footer className={styles.footer}>
          <button type="button" className={styles.btnGhost} onClick={back} disabled={currentStep === 0}>Back</button>
          <div className={styles.footerRight}>
            <span className={styles.stepHint}>Step {currentStep + 1} of {FORM_STEPS.length}</span>
            {isLast ? (
              <button type="button" className={styles.btnPrimary} onClick={submit} disabled={submitting}>
                {submitting ? 'Processing…' : isEdit ? 'Update Service' : 'Publish Service'}
              </button>
            ) : (
              <button type="button" className={styles.btnPrimary} onClick={next}>Next</button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ServiceFormModal;
