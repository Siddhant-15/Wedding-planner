# services/version_diff.py
from deepdiff import DeepDiff
from app.infrastructure.db.models.service_version import ServiceVersion


def compute_diff(old_version: ServiceVersion, new_version: ServiceVersion) -> dict:
    """
    Returns a structured diff for admin review.
    """
    diff = DeepDiff(
        old_version.snapshot,
        new_version.snapshot,
        ignore_order=True,
        verbose_level=2,
    )
    return {
        "changed_fields": list(diff.get("values_changed", {}).keys()),
        "added_fields": list(diff.get("dictionary_item_added", set())),
        "removed_fields": list(diff.get("dictionary_item_removed", set())),
        "raw_diff": diff.to_json(),
    }