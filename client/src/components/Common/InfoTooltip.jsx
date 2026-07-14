// src/components/Common/InfoTooltip.jsx

import React, { useState, useRef } from 'react';
import styles from './InfoTooltip.module.css';

const InfoTooltip = ({ text }) => {
    const [show, setShow] = useState(false);
    const [position, setPosition] = useState('bottom-right');
    const wrapperRef = useRef(null);

    const handleMouseEnter = () => {
        if (!wrapperRef.current) return;

        const rect = wrapperRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const tooltipWidth = 250;
        const tooltipHeight = 90;

        let newPos = 'bottom-right';

        const spaceRight = viewportWidth - rect.right;
        const spaceLeft = rect.left;
        const spaceBottom = viewportHeight - rect.bottom;
        const spaceTop = rect.top;

        // Smart flip logic
        if (spaceBottom < tooltipHeight && spaceTop > tooltipHeight) {
            newPos = spaceLeft > tooltipWidth / 2 ? 'top-left' : 'top-right';
        } else if (spaceRight < tooltipWidth) {
            newPos = spaceBottom > tooltipHeight ? 'bottom-left' : 'top-left';
        } else if (spaceLeft < tooltipWidth / 2) {
            newPos = spaceBottom > tooltipHeight ? 'bottom-right' : 'top-right';
        }

        setPosition(newPos);
        setShow(true);
    };

    const handleMouseLeave = () => {
        setShow(false);
    };

    return (
        <span
            ref={wrapperRef}
            className={styles.tooltipWrapper}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <sup className={styles.infoBtn}>i</sup>

            {show && (
                <span className={`${styles.tooltip} ${styles[position]}`}>
                    {text}
                </span>
            )}
        </span>
    );
};

export default InfoTooltip;