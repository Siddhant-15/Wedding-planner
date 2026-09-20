import React, { useEffect, useMemo } from 'react';
import { X, Sparkles, AlertTriangle, ChevronRight } from 'lucide-react';
import useServiceForm from '../../hooks/useServiceForm';
import { FORM_STEPS } from '../../constants/serviceConstants';
import Stepper from './form/Stepper';
import StepBasicInfo from './form/StepBasicInfo';
import StepPricing from './form/StepPricing';
import StepSpecificDetails from './form/StepSpecificDetails';
import StepAmenitiesImages from './form/StepAmenitiesImages';
import StepReview from './form/StepReview';
import RevisionSectionNote from './form/RevisionSectionNote';
import styles from '../../styles/ServiceFormModal.module.css';

/** Which review sections belong to which form step */
const STEP_SECTIONS = {
  0: ['basic_information', 'location'],
  1: ['pricing_variants'],
  2: ['service_details'],
  3: ['media', 'policies_metadata'],
  4: [], // review — show all remaining via summary only
};

const SECTION_TO_STEP = {
  basic_information: 0,
  location: 0,
  pricing_variants: 1,
  service_details: 2,
  media: 3,
  policies_metadata: 3,
};

const SECTION_LABELS = {
  basic_information: 'Basic information',
  location: 'Location',
  media: 'Photos & videos',
  pricing_variants: 'Pricing & packages',
  service_details: 'Service details',
  policies_metadata: 'Policies & metadata',
};

const formatSection = (section) =>
  SECTION_LABELS[section] ||
  String(section || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const ServiceFormModal = ({ isOpen, onClose, initialData, onSubmit, onSaveDraft }) => {
  const isEdit = !!initialData?.id;

  const {
    currentStep,
    setCurrentStep,
    formData,
    submitting,
    savingDraft,
    errors,
    stepErrors,
    submitAttempted,
    draftErrorSummary,
    updateField,
    updateGeo,
    updateVariant,
    addVariant,
    removeVariant,
    next,
    back,
    saveDraft,
    submit,
  } = useServiceForm(isOpen, initialData ?? null, onSubmit, onSaveDraft);

  const revisionFeedback = useMemo(() => {
    const list = initialData?.revision_feedback ?? [];
    return Array.isArray(list) ? list : [];
  }, [initialData]);

  const needsRevision =
    initialData?.status === 'needs_revision' || revisionFeedback.length > 0;

  /** Feedback that belongs to the step the vendor is on right now */
  const stepNotes = useMemo(() => {
    const sections = STEP_SECTIONS[currentStep] || [];
    if (!sections.length) return [];
    return revisionFeedback.filter((item) => sections.includes(item.section));
  }, [revisionFeedback, currentStep]);

  /** On open: jump to first step that has a change request */
  useEffect(() => {
    if (!isOpen || !isEdit || !revisionFeedback.length) return;
    const first = revisionFeedback.find(
      (item) => SECTION_TO_STEP[item.section] != null
    );
    if (first) {
      setCurrentStep(SECTION_TO_STEP[first.section]);
    }
  }, [isOpen, isEdit]); // intentionally once when modal opens with this edit

  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose();
    if (isOpen) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const goToSection = (section) => {
    const step = SECTION_TO_STEP[section];
    if (typeof step === 'number') setCurrentStep(step);
  };

  const errorCount = Object.keys(errors || {}).length;
  const showValidationBanner =
    (submitAttempted && errorCount > 0) || (!!draftErrorSummary && errorCount > 0);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepBasicInfo
            formData={formData}
            updateField={updateField}
            updateGeo={updateGeo}
            errors={errors}
          />
        );
      case 1:
        return (
          <StepPricing
            formData={formData}
            updateField={updateField}
            updateVariant={updateVariant}
            addVariant={addVariant}
            removeVariant={removeVariant}
            errors={errors}
          />
        );
      case 2:
        return (
          <StepSpecificDetails
            formData={formData}
            updateField={updateField}
            errors={errors}
          />
        );
      case 3:
        return (
          <StepAmenitiesImages
            formData={formData}
            updateField={updateField}
            errors={errors}
          />
        );
      case 4:
        return (
          <StepReview
            formData={formData}
            goToStep={setCurrentStep}
            errors={errors}
            submitAttempted={submitAttempted}
          />
        );
      default:
        return null;
    }
  };

  const isLast = currentStep === FORM_STEPS.length - 1;
  const busy = submitting || savingDraft;

  const primaryLabel = (() => {
    if (submitting) return 'Processing…';
    if (isEdit) {
      return needsRevision ? 'Resubmit for Review' : 'Update & Submit for Review';
    }
    return 'Submit for Review';
  })();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.icon}>
            <Sparkles size={18} />
          </div>
          <div className={styles.headerText}>
            <h2>{isEdit ? 'Edit Service' : 'Create New Service'}</h2>
            <p>
              {needsRevision && isEdit
                ? 'Address the requested changes, then resubmit for review'
                : isEdit
                  ? 'Update your service details'
                  : 'Add a new service to your portfolio'}
            </p>
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        {/* Compact summary of ALL change requests — always visible while editing */}
        {isEdit && needsRevision && revisionFeedback.length > 0 && (
          <div
            className={styles.revisionBar}
            role="region"
            aria-label="Requested changes"
          >
            <div className={styles.revisionBarHead}>
              <div className={styles.revisionBarIcon}>
                <AlertTriangle size={15} />
              </div>
              <div className={styles.revisionBarTitles}>
                <strong>Changes requested by review team</strong>
                <span>
                  {revisionFeedback.length} section
                  {revisionFeedback.length > 1 ? 's' : ''} flagged — open a
                  step to fix it in place
                </span>
              </div>
            </div>

            <ul className={styles.revisionItems}>
              {revisionFeedback.map((item, i) => {
                const stepIdx = SECTION_TO_STEP[item.section];
                const isCurrent =
                  typeof stepIdx === 'number' && stepIdx === currentStep;

                return (
                  <li
                    key={`${item.section}-${i}`}
                    className={`${styles.revisionItem} ${
                      isCurrent ? styles.revisionItemActive : ''
                    }`}
                  >
                    <div className={styles.revisionItemMain}>
                      <span className={styles.revisionSection}>
                        {formatSection(item.section)}
                      </span>
                      {item.comment ? (
                        <p className={styles.revisionComment}>{item.comment}</p>
                      ) : (
                        <p className={styles.revisionCommentMuted}>
                          No specific note — review carefully.
                        </p>
                      )}
                    </div>
                    {typeof stepIdx === 'number' && (
                      <button
                        type="button"
                        className={styles.revisionJump}
                        onClick={() => goToSection(item.section)}
                      >
                        {isCurrent ? 'This step' : 'Go to step'}
                        {!isCurrent && <ChevronRight size={14} />}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <Stepper
          steps={FORM_STEPS}
          current={currentStep}
          onStepClick={setCurrentStep}
          stepErrors={stepErrors}
          showErrors={submitAttempted || errorCount > 0}
        />

        <div className={styles.body}>
          {/* Validation summary banner */}
          {showValidationBanner && (
            <div className={styles.validationBanner} role="alert">
              <AlertTriangle size={16} />
              <span>
                {draftErrorSummary ||
                  `Please fix ${errorCount} issue${
                    errorCount === 1 ? '' : 's'
                  } before submitting.`}
              </span>
            </div>
          )}

          {/* ── Per-step note: only the feedback for THIS section ── */}
          {isEdit && needsRevision && (
            <RevisionSectionNote notes={stepNotes} />
          )}

          {renderStep()}
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={back}
            disabled={currentStep === 0 || busy}
          >
            Back
          </button>

          <div className={styles.footerRight}>
            <span className={styles.stepHint}>
              Step {currentStep + 1} of {FORM_STEPS.length}
            </span>

            <button
              type="button"
              className={styles.btnPrimary}
              onClick={saveDraft}
              disabled={busy}
              aria-label="Save draft"
            >
              {savingDraft ? 'Saving…' : 'Save Draft'}
            </button>

            {isLast ? (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={submit}
                disabled={busy}
              >
                {primaryLabel}
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={next}
                disabled={busy}
              >
                Next
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ServiceFormModal;