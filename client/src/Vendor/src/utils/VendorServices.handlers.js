/**
 * Drop-in handlers for VendorServices.jsx
 *
 * Replace handleSubmit and add handleSaveDraft.
 * Wire both into ServiceFormModal.
 */

import { serviceService } from '../../../utils/api/services/service.service';
import { buildServiceFormData } from '../utils/buildServiceFormData';

/**
 * @param {object} deps
 * @param {object|null} deps.editing
 * @param {() => Promise} deps.fetchServices
 * @param {(v: boolean) => void} deps.setFormOpen
 * @param {(v: null) => void} deps.setEditing
 */
export function createServiceHandlers({
  editing,
  fetchServices,
  setFormOpen,
  setEditing,
}) {
  const handleSubmit = async (data) => {
    const formData = buildServiceFormData(data, { saveAsDraft: false });

    if (editing?.id) {
      await serviceService.update(editing.id, formData);
    } else {
      await serviceService.create(formData);
    }

    await fetchServices();
    setFormOpen(false);
    setEditing(null);
  };

  const handleSaveDraft = async (data) => {
    const formData = buildServiceFormData(data, { saveAsDraft: true });

    if (editing?.id) {
      await serviceService.update(editing.id, formData);
    } else {
      // Create as draft — backend must honor save_as_draft=true
      await serviceService.create(formData);
    }

    await fetchServices();
    // Keep modal open after draft save so vendor can continue editing
    // Optionally close: setFormOpen(false); setEditing(null);
  };

  return { handleSubmit, handleSaveDraft };
}