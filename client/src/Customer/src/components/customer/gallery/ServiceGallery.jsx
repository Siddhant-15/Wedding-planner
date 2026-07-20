import React from "react";
import ImageGallery from "./ImageGallery";
import MediaGallery from "./MediaGallery";
import styles from "../styles/ServiceGallery.module.css";

export default function ServiceGallery({ media = [], serviceName }) {
  return (
    <div className={styles.serviceGallery}>
      <div className={styles.mainGallery}>
        <ImageGallery media={media} serviceName={serviceName} />
      </div>
      <div className={styles.sideGallery}>
        <MediaGallery media={media} serviceName={serviceName} />
      </div>
    </div>
  );
}