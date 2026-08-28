import { useEffect, useState } from "react";
import Modal from "../../../components/admin/ui/Modal";
import Loader from "../../../components/admin/ui/Loader";
import { adminService } from "../../../../../utils/api/services/adminService";
import ReviewSidebar from "./ReviewSidebar";
import ReviewSection from "./ReviewSection";
import ReviewSummary from "./ReviewSummary";
import { REVIEW_SECTIONS } from "./reviewSections";
import styles from "./ServiceReviewModal.module.css";

export default function ServiceReviewModal({ serviceId, isOpen, onClose, onFinalized }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeKey, setActiveKey] = useState(REVIEW_SECTIONS[0].key);
  const [confirmReject, setConfirmReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [finalizing, setFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState("");

  useEffect(() => {
    if (!isOpen || !serviceId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, serviceId]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminService.getServiceReview(serviceId);
      setData(res);
      setActiveKey(res.sections?.[0]?.section || REVIEW_SECTIONS[0].key);
    } catch (e) {
      setError(e.message || "Failed to load review data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSave = async (section, payload) => {
    const updated = await adminService.updateReviewSection(serviceId, section, payload);
    setData((prev) => {
      if (!prev) return prev;
      const nextSections = prev.sections.map((s) =>
        s.section === section ? { ...s, ...updated } : s
      );
      const approved = nextSections.filter((s) => s.status === "approved").length;
      const changesRequested = nextSections.filter((s) => s.status === "changes_requested").length;
      const reviewed = approved + changesRequested;
      return {
        ...prev,
        sections: nextSections,
        progress: {
          ...prev.progress,
          approved_sections: approved,
          changes_requested_sections: changesRequested,
          reviewed_sections: reviewed,
          can_approve: reviewed === nextSections.length && changesRequested === 0,
          can_request_changes: changesRequested > 0,
        },
      };
    });
  };

  const finalize = async (action, finalComment) => {
    setFinalizing(true);
    setFinalizeError("");
    try {
      const res = await adminService.finalizeServiceReview(serviceId, {
        action,
        final_comment: finalComment,
      });
      onFinalized?.(res);
      onClose();
    } catch (e) {
      if (e.status === 409 || e.response?.status === 409) {
        setFinalizeError(
          "This version was already reviewed or changed by another reviewer. Please refresh."
        );
      } else {
        setFinalizeError(e.message || "Failed to finalize review.");
      }
    } finally {
      setFinalizing(false);
    }
  };

  const handleApprove = () => {
    if (!data?.progress?.can_approve) return;
    finalize("approve");
  };

  const handleRequestChanges = () => {
    if (!data?.progress?.can_request_changes) return;
    finalize("request_changes");
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) return;
    finalize("reject", rejectReason.trim());
    setConfirmReject(false);
  };

  const activeSectionData = data?.sections?.find((s) => s.section === activeKey);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Service" size="xl">
      {loading ? (
        <Loader />
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : data ? (
        <div className={styles.workspace}>
          {data.is_update_to_live_service && (
            <div className={styles.updateBanner}>
              Update to Live Service — reviewing version{" "}
              {data.version_number ?? data.version_id}, currently live version stays visible to
              customers until this is approved.
            </div>
          )}

          <div className={styles.body}>
            <ReviewSidebar
              sections={data.sections}
              activeKey={activeKey}
              onSelect={setActiveKey}
              progress={data.progress}
            />

            <div className={styles.contentArea}>
              <ReviewSection
                sectionKey={activeKey}
                sectionData={activeSectionData}
                versionData={data.version_data}
                changeSummary={data.change_summary}
                onSave={handleSectionSave}
              />
            </div>
          </div>

          <div className={styles.summaryRow}>
            <ReviewSummary sections={data.sections} />
          </div>

          {finalizeError && <div className={styles.finalizeError}>{finalizeError}</div>}

          <div className={styles.actionBar}>
            <span className={styles.progressLabel}>
              {data.progress.reviewed_sections}/{data.progress.total_sections} sections reviewed
            </span>
            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.danger}`}
                onClick={() => setConfirmReject(true)}
                disabled={finalizing}
              >
                Reject
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.warn}`}
                onClick={handleRequestChanges}
                disabled={finalizing || !data.progress.can_request_changes}
              >
                Request Changes
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.success}`}
                onClick={handleApprove}
                disabled={finalizing || !data.progress.can_approve}
              >
                {finalizing ? "Saving…" : "Approve"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmReject && (
        <Modal
          isOpen={confirmReject}
          onClose={() => setConfirmReject(false)}
          title="Reject this version?"
          size="sm"
          footer={
            <>
              <button onClick={() => setConfirmReject(false)} disabled={finalizing}>
                Cancel
              </button>
              <button onClick={handleRejectConfirm} disabled={finalizing || !rejectReason.trim()}>
                {finalizing ? "Rejecting…" : "Reject"}
              </button>
            </>
          }
        >
          <p>
            Rejecting applies to this version only
            {data?.is_update_to_live_service ? " — the currently live version stays published." : "."}
          </p>
          <textarea
            className={styles.textarea}
            rows={4}
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </Modal>
      )}
    </Modal>
  );
}
