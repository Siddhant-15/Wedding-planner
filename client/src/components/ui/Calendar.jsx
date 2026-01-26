import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "../../styles/ui/Calendar.module.css";


import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; // ← keep the base style

export function Calendar({ className, ...props }) {
  return (
    <DayPicker
      className={`${styles.calendar} ${className}`}
      classNames={{
        day: styles.day,
        day_selected: styles.daySelected,
        day_today: styles.dayToday,
        day_disabled: styles.dayDisabled,
        day_outside: styles.dayOutside,
        caption: styles.caption,
        head_cell: styles.headCell,
        cell: styles.cell,
        nav_button: styles.navButton,
      }}
      modifiersClassNames={{
        today: styles.today,
      }}
      {...props}
    />
  );
}