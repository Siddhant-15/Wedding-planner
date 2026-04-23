// src/components/Common/FieldLabel.jsx
import React from 'react';
import InfoTooltip from './InfoTooltip';
import styles from './FieldLabel.module.css';

const FieldLabel = ({ children, required, tooltip, htmlFor }) => (
  <label htmlFor={htmlFor} className={styles.label}>
    <span>{children}</span>
    {required && <span className={styles.required}>*</span>}
    {tooltip && <InfoTooltip text={tooltip} />}
  </label>
);

export default FieldLabel;
