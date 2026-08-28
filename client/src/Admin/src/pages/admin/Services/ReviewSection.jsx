import { useEffect, useState } from "react";
import { formatINR, titleCase } from "../../../utils/format";
import styles from "./ReviewSection.module.css";

// -----------------------------------------------------------------------
// Content renderers per section. These read from `versionData` (the
// `version_data` object returned by GET /review) and, where useful, the
// `changeSummary` for "Update to Live Service" callouts.
// -----------------------------------------------------------------------

function BasicInfoContent({ v, changeSummary }) {
  return (
    <div>
      {changeSummary?.basic_information_changed && (
        <div className={styles.changedBadge}>Changed from live version</div>
      )}
      <h4 className={styles.fieldLabel}>Service name</h4>
      <p className={styles.fieldValue}>{v.service_name}</p>
      <h4 className={styles.fieldLabel}>Description</h4>
      <p className={styles.fieldValue}>{v.description || "—"}</p>
    </div>
  );
}

function LocationContent({ v, changeSummary }) {
  return (
    <div>
      {changeSummary?.location_changed && (
        <div className={styles.changedBadge}>Changed from live version</div>
      )}
      <p className={styles.fieldValue}>
        {v.add_line1}
        {v.add_line2 ? `, ${v.add_line2}` : ""}
        <br />
        {v.area ? `${v.area}, ` : ""}
        {v.city}, {v.state} - {v.pincode}
      </p>
    </div>
  );
}

function MediaContent({ v, changeSummary }) {
  if (!v.media?.length) return <p className={styles.empty}>No media on this version.</p>;
  return (
    <div>
      {changeSummary && (changeSummary.media_added || changeSummary.media_removed || changeSummary.cover_changed) && (
        <div className={styles.changedBadge}>
          {changeSummary.media_added > 0 && `${changeSummary.media_added} added `}
          {changeSummary.media_removed > 0 && `${changeSummary.media_removed} removed `}
          {changeSummary.cover_changed && "· cover image changed"}
        </div>
      )}
      <div className={styles.mediaGrid}>
        {v.media.map((m) => (
          <div key={m.id} className={styles.mediaItem}>
            {m.media_type === "image" ? (
              <img src={m.media_url} alt="" className={styles.mediaImg} />
            ) : (
              <div className={styles.mediaVideo}>Video</div>
            )}
            {m.is_cover && <span className={styles.coverBadge}>Cover</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingContent({ v, changeSummary }) {
  if (!v.variants?.length) return <p className={styles.empty}>No variants on this version.</p>;
  return (
    <div>
      {changeSummary && (changeSummary.variants_added || changeSummary.variants_removed || changeSummary.variants_modified) && (
        <div className={styles.changedBadge}>
          {changeSummary.variants_added > 0 && `${changeSummary.variants_added} added `}
          {changeSummary.variants_removed > 0 && `${changeSummary.variants_removed} removed `}
          {changeSummary.variants_modified > 0 && `${changeSummary.variants_modified} modified`}
        </div>
      )}
      {v.variants.map((variant) => (
        <div key={variant.id} className={styles.variantCard}>
          <strong>{variant.variant_name}</strong>
          {variant.description && <p>{variant.description}</p>}
          <div className={styles.variantPricing}>
            {variant.pricing?.veg_price && <>Veg: <strong>{formatINR(variant.pricing.veg_price)}</strong> </>}
            {variant.pricing?.non_veg_price && <>| Non-Veg: <strong>{formatINR(variant.pricing.non_veg_price)}</strong></>}
            {variant.pricing?.rental_price && <>| Rental: <strong>{formatINR(variant.pricing.rental_price)}</strong></>}
          </div>
          {variant.inclusions?.length > 0 && (
            <div className={styles.fieldValue}>Inclusions: {variant.inclusions.join(", ")}</div>
          )}
          {variant.exclusions?.length > 0 && (
            <div className={styles.fieldValue}>Exclusions: {variant.exclusions.join(", ")}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function ServiceDetailsContent({ v }) {
  if (!v.detail) return <p className={styles.empty}>No type-specific details on this version.</p>;
  const { type, data } = v.detail;
  return (
    <div>
      <h4 className={styles.fieldLabel}>{titleCase(type.replace("_", " "))} details</h4>
      <div className={styles.detailGrid}>
        {Object.entries(data)
          .filter(([k]) => !["id", "service_version_id", "created_at", "updated_at"].includes(k))
          .map(([k, val]) => (
            <div key={k} className={styles.detailRow}>
              <span className={styles.detailKey}>{titleCase(k.replace(/_/g, " "))}</span>
              <span className={styles.detailVal}>
                {val === null || val === undefined || val === ""
                  ? "—"
                  : typeof val === "object"
                  ? JSON.stringify(val)
                  : String(val)}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function PoliciesContent({ v }) {
  const tags = v.metadata?.tags || [];
  const amenities = v.metadata?.amenities || [];
  if (!tags.length && !amenities.length) {
    return <p className={styles.empty}>No policies/metadata on this version.</p>;
  }
  return (
    <div>
      {tags.length > 0 && (
        <div className={styles.tags}>
          <strong>Tags:</strong>
          {tags.map((t, i) => (
            <span key={i} className={styles.tag}>{t}</span>
          ))}
        </div>
      )}
      {amenities.length > 0 && (
        <div className={styles.tags}>
          <strong>Amenities:</strong>
          {amenities.map((a, i) => (
            <span key={i} className={styles.tag}>{a}</span>
          ))}
        </div>
      )}
    </div>
  );
}

const CONTENT_BY_SECTION = {
  basic_information: BasicInfoContent,
  location: LocationContent,
  media: MediaContent,
  pricing_variants: PricingContent,
  service_details: ServiceDetailsContent,
  policies_metadata: PoliciesContent,
};

// -----------------------------------------------------------------------

export default function ReviewSection({
  sectionKey,
  sectionData, // { status, comment, reviewed_by_name, reviewed_at }
  versionData,
  changeSummary,
  onSave, // async (section, { status, comment }) => void
}) {
  const [showCommentBox, setShowCommentBox] = useState(sectionData?.status === "changes_requested");
  const [comment, setComment] = useState(sectionData?.comment || "");
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error

  useEffect(() => {
    setComment(sectionData?.comment || "");
    setShowCommentBox(sectionData?.status === "changes_requested");
    setSaveState("idle");
  }, [sectionKey, sectionData?.status, sectionData?.comment]);

  const Content = CONTENT_BY_SECTION[sectionKey];
  const status = sectionData?.status || "pending";

  const save = async (nextStatus, nextComment) => {
    setSaveState("saving");
    try {
      await onSave(sectionKey, { status: nextStatus, comment: nextComment });
      setSaveState("saved");
    } catch (e) {
      setSaveState("error");
    }
  };

  const handleLooksGood = () => {
    setShowCommentBox(false);
    save("approved", null);
  };

  const handleRequestChangesClick = () => {
    setShowCommentBox(true);
  };

  const handleSubmitComment = () => {
    if (!comment.trim()) return;
    save("changes_requested", comment.trim());
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>{titleCase(sectionKey.replace(/_/g, " "))}</h3>
        <span className={`${styles.statusBadge} ${styles[status]}`}>
          {status === "pending" && "Not reviewed"}
          {status === "approved" && "Approved"}
          {status === "changes_requested" && "Changes requested"}
        </span>
      </div>

      <div className={styles.content}>
        {Content ? <Content v={versionData} changeSummary={changeSummary} /> : null}
      </div>

      {status === "changes_requested" && sectionData?.comment && (
        <div className={styles.reasonBox}>
          <strong>Reviewer comment:</strong> {sectionData.comment}
        </div>
      )}

      <div className={styles.controls}>
        {!showCommentBox ? (
          <>
            <button
              type="button"
              className={`${styles.btn} ${styles.success}`}
              onClick={handleLooksGood}
              disabled={saveState === "saving"}
            >
              {status === "approved" ? "Approved ✓" : "Looks Good"}
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.warn}`}
              onClick={handleRequestChangesClick}
              disabled={saveState === "saving"}
            >
              Request Changes
            </button>
          </>
        ) : (
          <div className={styles.commentBox}>
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="Explain what needs to change in this section..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className={styles.commentActions}>
              <button
                type="button"
                className={styles.btn}
                onClick={() => setShowCommentBox(false)}
                disabled={saveState === "saving"}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.warn}`}
                onClick={handleSubmitComment}
                disabled={saveState === "saving" || !comment.trim()}
              >
                {saveState === "saving" ? "Saving…" : "Submit"}
              </button>
            </div>
          </div>
        )}

        <span className={styles.saveState}>
          {saveState === "saving" && "Saving…"}
          {saveState === "saved" && "Saved"}
          {saveState === "error" && "Failed to save — try again"}
        </span>
      </div>
    </div>
  );
}
