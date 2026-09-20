import { useEffect, useMemo, useState, useCallback } from 'react';
import { createEmptyForm, createEmptyVariant, FORM_STEPS } from '../constants/serviceConstants';
import { validateService } from '../utils/serviceValidation';

export default function useServiceForm(open, initialData, onSubmit, onSaveDraft) {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [formData, setFormData] = useState(createEmptyForm);
  const [errors, setErrors] = useState({});
  const [stepErrors, setStepErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [draftErrorSummary, setDraftErrorSummary] = useState(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setCurrentStep(0);
    setErrors({});
    setStepErrors({});
    setSubmitAttempted(false);
    setDraftErrorSummary(null);
    setFormData(initialData ? { ...createEmptyForm(), ...initialData } : createEmptyForm());
  }, [open, initialData]);

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change after submit attempt
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const updateGeo = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      geo_point: { ...prev.geo_point, [field]: value },
    }));
    const path = `geo_point.${field}`;
    setErrors((prev) => {
      if (!prev[path]) return prev;
      const next = { ...prev };
      delete next[path];
      return next;
    });
  }, []);

  const updateVariant = useCallback((index, field, value) => {
    setFormData((prev) => {
      const variants = prev.variants.map((v, i) => {
        if (i !== index) {
          // Selecting a new default unsets others
          if (field === 'is_default' && value) {
            return { ...v, is_default: false };
          }
          return v;
        }
        return { ...v, [field]: value };
      });
      return { ...prev, variants };
    });
    const path = `variants.${index}.${field}`;
    setErrors((prev) => {
      if (!prev[path] && !prev.variants) return prev;
      const next = { ...prev };
      delete next[path];
      delete next.variants;
      return next;
    });
  }, []);

  const addVariant = useCallback(() => {
    setFormData((prev) => {
      const hasDefault = (prev.variants || []).some((v) => v.is_default);
      // If no default exists, new package becomes default
      const next = createEmptyVariant(!hasDefault);
      return { ...prev, variants: [...(prev.variants || []), next] };
    });
  }, []);

  const removeVariant = useCallback((index) => {
    setFormData((prev) => {
      const variants = prev.variants.filter((_, i) => i !== index);
      // If removed was default, assign first remaining as default
      if (variants.length && !variants.some((v) => v.is_default)) {
        variants[0] = { ...variants[0], is_default: true };
      }
      return { ...prev, variants };
    });
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith('variants.')) delete next[k];
      });
      delete next.variants;
      return next;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setStepErrors({});
    setDraftErrorSummary(null);
  }, []);

  const applyValidationResult = useCallback((result, { navigateToError = false } = {}) => {
    setErrors(result.errors || {});
    setStepErrors(result.stepErrors || {});
    if (navigateToError && result.firstErrorStep != null) {
      setCurrentStep(result.firstErrorStep);
    }
    return result;
  }, []);

  const next = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, FORM_STEPS.length - 1));
  }, []);

  const back = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  /**
   * Save draft — permissive validation only.
   * Does not require business fields. Rejects only malformed values.
   */
  const saveDraft = useCallback(async () => {
    if (savingDraft || submitting) return { ok: false, reason: 'busy' };

    const result = validateService(formData, { mode: 'draft' });
    if (!result.isValid) {
      applyValidationResult(result, { navigateToError: true });
      setDraftErrorSummary(
        `Please fix ${Object.keys(result.errors).length} issue${
          Object.keys(result.errors).length === 1 ? '' : 's'
        } before saving draft.`
      );
      return { ok: false, result };
    }

    setDraftErrorSummary(null);
    setErrors({});
    setStepErrors({});

    if (!onSaveDraft) {
      // Fallback: if parent only has onSubmit, still allow local “draft” path
      // by calling onSubmit with a flag if supported; otherwise no-op success for UX.
      return { ok: true, result };
    }

    try {
      setSavingDraft(true);
      await onSaveDraft(formData);
      return { ok: true, result };
    } catch (err) {
      // Map backend errors if present
      const message =
        err?.response?.data?.detail?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Unable to save draft. Please try again.';
      setDraftErrorSummary(message);
      return { ok: false, error: err };
    } finally {
      setSavingDraft(false);
    }
  }, [formData, onSaveDraft, savingDraft, submitting, applyValidationResult]);

  /**
   * Submit / Resubmit for review — full business validation.
   */
  const submit = useCallback(async () => {
    if (submitting || savingDraft) return { ok: false, reason: 'busy' };

    setSubmitAttempted(true);
    const result = validateService(formData, { mode: 'submit' });

    if (!result.isValid) {
      applyValidationResult(result, { navigateToError: true });
      const n = Object.keys(result.errors).length;
      setDraftErrorSummary(
        `Please fix ${n} issue${n === 1 ? '' : 's'} before submitting for review.`
      );
      // API is NOT called
      return { ok: false, result };
    }

    setErrors({});
    setStepErrors({});
    setDraftErrorSummary(null);

    try {
      setSubmitting(true);
      await onSubmit(formData);
      return { ok: true };
    } catch (err) {
      // Preserve backend validation errors when possible
      const detail = err?.response?.data?.detail;
      if (detail && typeof detail === 'object' && detail.field) {
        setErrors({ [detail.field]: detail.message || 'Invalid value' });
        const step = result.firstErrorStep ?? 0;
        setCurrentStep(step);
      } else {
        const message =
          (typeof detail === 'string' && detail) ||
          err?.response?.data?.message ||
          err?.message ||
          'Unable to submit service for review. Please try again.';
        setDraftErrorSummary(message);
      }
      return { ok: false, error: err };
    } finally {
      setSubmitting(false);
    }
  }, [formData, onSubmit, submitting, savingDraft, applyValidationResult]);

  // Recompute step error counts when errors change (for stepper badges)
  useEffect(() => {
    if (!submitAttempted && Object.keys(errors).length === 0) {
      setStepErrors({});
      return;
    }
    const result = validateService(formData, {
      mode: submitAttempted ? 'submit' : 'draft',
    });
    // Only refresh step counts if we already have errors displayed
    if (Object.keys(errors).length > 0) {
      setStepErrors(result.stepErrors || {});
    }
  }, [formData, submitAttempted]); // eslint-disable-line react-hooks/exhaustive-deps

  return useMemo(
    () => ({
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
      clearErrors,
    }),
    [
      currentStep,
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
      clearErrors,
    ]
  );
}
