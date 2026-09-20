/**
 * Keep formData.existing_media_ids in sync when vendor removes an image
 * in StepAmenitiesImages.
 *
 * Call from removeImage after updating images array:
 *
 *   const updated = images.filter(...);
 *   updateField('images', updated);
 *   updateField('existing_media_ids', deriveExistingMediaIds(updated));
 */

export function deriveExistingMediaIds(images = []) {
  const ids = [];
  for (const img of images) {
    if (typeof img === 'object' && img != null) {
      if (typeof img.id === 'number') ids.push(img.id);
      else if (img.server_id != null) ids.push(Number(img.server_id));
    }
  }
  return ids;
}