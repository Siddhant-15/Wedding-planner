import React, { forwardRef } from "react";
import styles from "../../styles/Card.module.css"

const Card = forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`${styles.card} ${className}`} {...props} />
));

const CardHeader = forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`${styles.cardHeader} ${className}`} {...props} />
));

const CardTitle = forwardRef(({ className = "", ...props }, ref) => (
  <h3 ref={ref} className={`${styles.cardTitle} ${className}`} {...props} />
));

const CardDescription = forwardRef(({ className = "", ...props }, ref) => (
  <p ref={ref} className={`${styles.cardDescription} ${className}`} {...props} />
));

const CardContent = forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`${styles.cardContent} ${className}`} {...props} />
));

const CardFooter = forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`${styles.cardFooter} ${className}`} {...props} />
));

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
