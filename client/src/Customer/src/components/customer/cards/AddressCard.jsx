import React, { useState } from "react";
import { MapPin, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "../../../../../components/ui/Button.jsx";
import styles from "../styles/AddressCard.module.css";

export default function AddressCard({
  addressLine1,
  addressLine2,
  city,
  state,
  pincode,
}) {
  const [copied, setCopied] = useState(false);

  const fullAddress = [
    addressLine1,
    addressLine2,
    `${city}, ${state} - ${pincode}`,
  ]
    .filter(Boolean)
    .join(", ");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDirections = () => {
    const encodedAddress = encodeURIComponent(fullAddress);
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`,
      "_blank"
    );
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.heading}>
        <MapPin className={styles.icon} />
        Location & Address
      </h3>

      <div className={styles.address}>
        <p className={styles.primary}>{addressLine1}</p>

        {addressLine2 && (
          <p className={styles.secondary}>{addressLine2}</p>
        )}

        <p className={styles.primaryBold}>
          {city}, {state} - {pincode}
        </p>
      </div>

      <div className={styles.actions}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className={styles.button}
        >
          {copied ? (
            <>
              <Check className={styles.successIcon} />
              Copied!
            </>
          ) : (
            <>
              <Copy className={styles.smallIcon} />
              Copy Address
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDirections}
          className={styles.button}
        >
          <ExternalLink className={styles.smallIcon} />
          Get Directions
        </Button>
      </div>
    </div>
  );
}
