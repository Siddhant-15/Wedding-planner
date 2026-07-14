// src/components/vendor/form/StepPricing.jsx
import React from 'react';
import { Plus, Trash2, Star } from 'lucide-react';
import FieldLabel from '../../Common/FieldLabel';
import { getFieldDescription } from '../../../constants/fieldDescriptions';
import { SERVICE_CATEGORIES, PRICING_TYPES, VENUE_PRICING_MODES } from '../../../constants/serviceConstants';
import styles from '../../../styles/FormStep.module.css';

const StepPricing = ({ formData, updateField, updateVariant, addVariant, removeVariant }) => {
  const isCatering = formData.category === 'catering';
  const isVenue = formData.category === 'venue';
  const t = (k) => getFieldDescription(k, formData.category);

  return (
    <div className={styles.step}>
      <div className={styles.field}>
        <FieldLabel required tooltip={t('category')}>Service Category</FieldLabel>
        <select
          className={styles.select}
          value={formData.category}
          onChange={(e) => updateField('category', e.target.value)}
          disabled={!!formData.id}
        >
          <option value="">Select a category</option>
          {SERVICE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.headerRow}>
        <div>
          <h3>Pricing Packages</h3>
          <p>Add one or more packages</p>
        </div>
        <button type="button" className={styles.btn} onClick={addVariant}>
          <Plus size={14} /> Add Package
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {formData.variants.map((variant, index) => (
          <div key={variant.id} className={styles.variantCard}>
            <div className={styles.variantHeader}>
              <div style={{ flex: 1 }}>
                <FieldLabel tooltip={t('variant_name')}>Package Name</FieldLabel>
                <input
                  className={styles.input}
                  value={variant.variant_name}
                  onChange={(e) => updateVariant(index, 'variant_name', e.target.value)}
                  placeholder="e.g., Basic, Premium"
                />
                {variant.is_default && (
                  <span className={styles.badge}><Star size={11} /> Default</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 22 }}>
                {!variant.is_default && (
                  <button type="button" className={styles.btn} onClick={() => updateVariant(index, 'is_default', true)}>
                    Set default
                  </button>
                )}
                {formData.variants.length > 1 && (
                  <button type="button" className={styles.iconBtn} onClick={() => removeVariant(index)} aria-label="Remove package">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {isVenue ? (
              <div className={styles.field}>
                <FieldLabel tooltip={t('pricing_mode')}>Pricing Mode</FieldLabel>
                <select className={styles.select} value={variant.pricing_mode || ''} onChange={(e) => updateVariant(index, 'pricing_mode', e.target.value)}>
                  <option value="">Select pricing mode</option>
                  {VENUE_PRICING_MODES.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className={styles.field}>
                <FieldLabel tooltip={t('pricing_type')}>Pricing Type</FieldLabel>
                <select className={styles.select} value={variant.pricing_type || ''} onChange={(e) => updateVariant(index, 'pricing_type', e.target.value)}>
                  <option value="">Select pricing type</option>
                  {PRICING_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            )}

            {(isCatering || isVenue) && (
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={!!variant.is_veg_only}
                  onChange={(e) => updateVariant(index, 'is_veg_only', e.target.checked)}
                />
                Veg only
              </label>
            )}

            {isCatering ? (
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <FieldLabel tooltip={t('veg_price')}>Veg price (per plate) ₹</FieldLabel>
                  <input type="number" className={styles.input} value={variant.veg_price || ''} onChange={(e) => updateVariant(index, 'veg_price', e.target.value)} />
                </div>
                {!variant.is_veg_only && (
                  <div className={styles.field}>
                    <FieldLabel tooltip={t('non_veg_price')}>Non-veg price (per plate) ₹</FieldLabel>
                    <input type="number" className={styles.input} value={variant.non_veg_price || ''} onChange={(e) => updateVariant(index, 'non_veg_price', e.target.value)} />
                  </div>
                )}
              </div>
            ) : isVenue ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(variant.pricing_mode === 'per_plate' || variant.pricing_mode === 'both') && (
                  <div className={styles.grid2}>
                    <div className={styles.field}>
                      <FieldLabel tooltip={t('veg_price')}>Veg price (per plate) ₹</FieldLabel>
                      <input type="number" className={styles.input} value={variant.veg_price || ''} onChange={(e) => updateVariant(index, 'veg_price', e.target.value)} />
                    </div>
                    {!variant.is_veg_only && (
                      <div className={styles.field}>
                        <FieldLabel tooltip={t('non_veg_price')}>Non-veg price (per plate) ₹</FieldLabel>
                        <input type="number" className={styles.input} value={variant.non_veg_price || ''} onChange={(e) => updateVariant(index, 'non_veg_price', e.target.value)} />
                      </div>
                    )}
                  </div>
                )}
                {(variant.pricing_mode === 'rental' || variant.pricing_mode === 'both') && (
                  <div className={styles.field}>
                    <FieldLabel tooltip={t('rental_price')}>Rental price (per day) ₹</FieldLabel>
                    <input type="number" className={styles.input} value={variant.rental_price || ''} onChange={(e) => updateVariant(index, 'rental_price', e.target.value)} />
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <FieldLabel required tooltip={t('price')}>Price ₹</FieldLabel>
                  <input type="number" className={styles.input} value={variant.price || ''} onChange={(e) => updateVariant(index, 'price', e.target.value)} />
                </div>
                {formData.category === 'photography' && formData.videography_available && (
                  <div className={styles.field}>
                    <FieldLabel tooltip="Extra price if video is included">Price with Video ₹</FieldLabel>
                    <input type="number" className={styles.input} value={variant.price_with_video || ''} onChange={(e) => updateVariant(index, 'price_with_video', e.target.value)} />
                  </div>
                )}
              </div>
            )}

            <div className={styles.field}>
              <FieldLabel tooltip={t('inclusions')}>Inclusions</FieldLabel>
              <input
                className={styles.input}
                value={variant.inclusions || ''}
                onChange={(e) => updateVariant(index, 'inclusions', e.target.value)}
                placeholder="Comma separated (e.g. Decor, DJ, Buffet)"
              />
            </div>
          </div>
        ))}

        {formData.variants.length === 0 && (
          <div className={styles.empty}>No packages added. Click "Add Package" to start.</div>
        )}
      </div>
    </div>
  );
};

export default StepPricing;
