# ─────────────────────────────────────────────────────────────────────────────
# Alembic migration: add versioning tables
# alembic/versions/003_add_versioning.py
# ─────────────────────────────────────────────────────────────────────────────
VERSIONING_MIGRATION_SQL = """
-- Run this migration to add the versioning system
 
CREATE TYPE version_state_enum AS ENUM (
    'draft', 'pending_review', 'approved', 'rejected',
    'published', 'archived', 'pending_update_review',
    'update_approved', 'update_rejected', 'suspended'
);
 
CREATE TABLE service_versions (
    id                  BIGSERIAL PRIMARY KEY,
    service_id          BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    version_number      INT NOT NULL,
    state               version_state_enum NOT NULL DEFAULT 'draft',
    snapshot            JSONB NOT NULL,
    submitted_at        TIMESTAMPTZ,
    reviewed_at         TIMESTAMPTZ,
    published_at        TIMESTAMPTZ,
    reviewer_id         BIGINT,
    rejection_reason    TEXT,
    moderation_notes    TEXT,
    created_by          BIGINT NOT NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (service_id, version_number)
);
 
CREATE INDEX idx_service_versions_service ON service_versions(service_id);
CREATE INDEX idx_service_versions_state   ON service_versions(state);
CREATE INDEX idx_service_versions_pending ON service_versions(submitted_at)
    WHERE state IN ('pending_review', 'pending_update_review');
 
-- Add version pointers to services
ALTER TABLE services
    ADD COLUMN current_published_version_id BIGINT
        REFERENCES service_versions(id) ON DELETE SET NULL,
    ADD COLUMN pending_version_id           BIGINT
        REFERENCES service_versions(id) ON DELETE SET NULL;
 
CREATE INDEX idx_services_published_version
    ON services(current_published_version_id)
    WHERE current_published_version_id IS NOT NULL;
 
-- Audit log
CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id   BIGINT NOT NULL,
    actor_id    BIGINT NOT NULL,
    actor_role  VARCHAR(30) NOT NULL,
    action      VARCHAR(50) NOT NULL,
    payload     JSONB,
    ip_address  VARCHAR(45),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
 
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_actor  ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_time   ON audit_logs USING BRIN(created_at);
 
-- Backfill: create v1 versions for existing services
INSERT INTO service_versions (
    service_id, version_number, state, snapshot, created_by, created_at
)
SELECT
    id,
    1,
    CASE
        WHEN status = 'published' THEN 'published'::version_state_enum
        WHEN status = 'draft'     THEN 'draft'::version_state_enum
        ELSE 'pending_review'::version_state_enum
    END,
    COALESCE(metadata, '{}')::jsonb,
    vendor_id,
    created_at
FROM services;
 
-- Wire up published services
UPDATE services s
SET current_published_version_id = sv.id
FROM service_versions sv
WHERE sv.service_id = s.id
  AND sv.state = 'published';
"""
 
if __name__ == "__main__":
    print(VERSIONING_MIGRATION_SQL)