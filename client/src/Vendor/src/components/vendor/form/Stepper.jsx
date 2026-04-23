// src/components/vendor/form/Stepper.jsx
import React from 'react';
import { Check } from 'lucide-react';
import styles from '../../../styles/Stepper.module.css';

const Stepper = ({ steps, current, onStepClick }) => (
  <div className={styles.stepper}>
    {steps.map((label, i) => {
      const state = i < current ? 'done' : i === current ? 'active' : 'todo';
      return (
        <React.Fragment key={label}>
          <button
            type="button"
            onClick={() => onStepClick && i <= current && onStepClick(i)}
            className={`${styles.step} ${styles[state]}`}
            disabled={i > current}
          >
            <span className={styles.circle}>
              {state === 'done' ? <Check size={14} /> : i + 1}
            </span>
            <span className={styles.label}>{label}</span>
          </button>
          {i < steps.length - 1 && <span className={`${styles.bar} ${i < current ? styles.barDone : ''}`} />}
        </React.Fragment>
      );
    })}
  </div>
);

export default Stepper;
