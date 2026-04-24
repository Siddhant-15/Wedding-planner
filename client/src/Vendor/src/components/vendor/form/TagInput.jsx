// src/components/vendor/form/TagInput.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import styles from "../../../styles/TagInput.module.css";

const TagInput = ({ values = [], onChange, placeholder }) => {
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setDraft('');
  };

  const remove = (t) => onChange(values.filter((x) => x !== t));

  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.tags}>
        {values.map((t) => (
          <span key={t} className={styles.tag}>
            {t}
            <button type="button" onClick={() => remove(t)} aria-label={`Remove ${t}`}>
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={add}
          placeholder={values.length ? '' : placeholder}
          className={styles.input}
        />
      </div>
    </div>
  );
};

export default TagInput;
