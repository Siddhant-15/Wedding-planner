import React from 'react';
import { Check } from 'lucide-react';
import styles from '../../../styles/Stepper.module.css';

const Stepper = ({ steps, current, onStepClick, stepErrors = {}, showErrors = false }) => (
  <div className={styles.stepper}>
    {steps.map((label, i) => {
      const state = i < current ? 'done' : i === current ? 'active' : 'todo';
      const errCount = showErrors ? stepErrors[i] || 0 : 0;
      const hasErrors = errCount > 0;

      return (
        <React.Fragment key={label}>
          <button
            type="button"
            onClick={() => onStepClick && onStepClick(i)}
            className={`${styles.step} ${styles[state]} ${hasErrors ? styles.hasErrors : ''}`}
            aria-current={i === current ? 'step' : undefined}
            aria-label={
              hasErrors
                ? `${label}, ${errCount} error${errCount === 1 ? '' : 's'}`
                : label
            }
          >
            <span className={styles.circle}>
              {state === 'done' && !hasErrors ? <Check size={14} /> : i + 1}
            </span>
            <span className={styles.label}>{label}</span>
            {hasErrors && (
              <span className={styles.errorBadge} title={`${errCount} issue${errCount === 1 ? '' : 's'}`}>
                {errCount}
              </span>
            )}
          </button>
          {i < steps.length - 1 && (
            <span className={`${styles.bar} ${i < current ? styles.barDone : ''}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

export default Stepper;