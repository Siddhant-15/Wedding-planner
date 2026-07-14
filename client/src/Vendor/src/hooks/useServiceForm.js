// src/hooks/useServiceForm.js
import { useEffect, useMemo, useState } from 'react';
import { createEmptyForm, createEmptyVariant, FORM_STEPS } from '../constants/serviceConstants';

export default function useServiceForm(open, initialData, onSubmit) {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(createEmptyForm);

  useEffect(() => {
    if (!open) return;
    setCurrentStep(0);
    setFormData(initialData ? { ...createEmptyForm(), ...initialData } : createEmptyForm());
  }, [open, initialData]);

  const updateField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const updateGeo = (field, value) =>
    setFormData((prev) => ({ ...prev, geo_point: { ...prev.geo_point, [field]: value } }));

  const updateVariant = (index, field, value) =>
    setFormData((prev) => {
      const variants = prev.variants.map((v, i) => {
        if (i !== index) return field === 'is_default' && value ? { ...v, is_default: false } : v;
        return { ...v, [field]: value };
      });
      return { ...prev, variants };
    });

  const addVariant = () =>
    setFormData((prev) => ({ ...prev, variants: [...prev.variants, createEmptyVariant(false)] }));

  const removeVariant = (index) =>
    setFormData((prev) => {
      const variants = prev.variants.filter((_, i) => i !== index);
      if (variants.length && !variants.some((v) => v.is_default)) variants[0].is_default = true;
      return { ...prev, variants };
    });

  const next = () => setCurrentStep((s) => Math.min(s + 1, FORM_STEPS.length - 1));
  const back = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    try {
      setSubmitting(true);
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  return useMemo(
    () => ({
      currentStep, setCurrentStep, formData, submitting,
      updateField, updateGeo, updateVariant, addVariant, removeVariant,
      next, back, submit,
    }),
    [currentStep, formData, submitting]
  );
}
