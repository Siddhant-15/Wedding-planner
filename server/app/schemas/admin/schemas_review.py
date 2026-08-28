# app/schemas/review.py

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, model_validator


class ReviewSectionEnum(str, Enum):
    basic_information = "basic_information"
    location = "location"
    media = "media"
    pricing_variants = "pricing_variants"
    service_details = "service_details"
    policies_metadata = "policies_metadata"


class ReviewItemStatusEnum(str, Enum):
    pending = "pending"
    approved = "approved"
    changes_requested = "changes_requested"


class SectionReviewUpdateRequest(BaseModel):
    status: ReviewItemStatusEnum
    comment: Optional[str] = None

    @model_validator(mode="after")
    def validate_status_comment_pair(self):
        if self.status == ReviewItemStatusEnum.pending:
            raise ValueError("status must be 'approved' or 'changes_requested'")
        if self.status == ReviewItemStatusEnum.changes_requested:
            if not self.comment or not self.comment.strip():
                raise ValueError(
                    "comment is required when requesting changes on a section"
                )
        return self


class SectionReviewResponse(BaseModel):
    section: ReviewSectionEnum
    status: ReviewItemStatusEnum
    comment: Optional[str] = None
    reviewed_by: Optional[int] = None
    reviewed_by_name: Optional[str] = None
    reviewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReviewProgressSummary(BaseModel):
    total_sections: int
    reviewed_sections: int
    approved_sections: int
    changes_requested_sections: int
    can_approve: bool
    can_request_changes: bool


class VersionChangeSummary(BaseModel):
    is_update_to_live: bool
    variants_added: int = 0
    variants_removed: int = 0
    variants_modified: int = 0
    media_added: int = 0
    media_removed: int = 0
    cover_changed: bool = False
    basic_information_changed: Optional[bool] = None
    location_changed: Optional[bool] = None


class ReviewDataResponse(BaseModel):
    service_id: int
    version_id: int
    version_number: Optional[int] = None
    version_status: str
    service_status: str
    is_update_to_live_service: bool
    sections: List[SectionReviewResponse]
    progress: ReviewProgressSummary
    change_summary: Optional[VersionChangeSummary] = None
    version_data: Dict[str, Any]
    live_version_data: Optional[Dict[str, Any]] = None


class ReviewFinalizeAction(str, Enum):
    approve = "approve"
    request_changes = "request_changes"
    reject = "reject"


class ReviewFinalizeRequest(BaseModel):
    action: ReviewFinalizeAction
    final_comment: Optional[str] = None

    @model_validator(mode="after")
    def require_comment_for_reject(self):
        if self.action == ReviewFinalizeAction.reject and (
            not self.final_comment or not self.final_comment.strip()
        ):
            raise ValueError("final_comment is required to reject a version")
        return self


class ReviewFinalizeResponse(BaseModel):
    message: str
    service_id: int
    version_id: int
    version_status: str
    service_status: str


class ReviewHistoryVersionEntry(BaseModel):
    version_id: int
    version_number: Optional[int]
    version_status: str
    reviewed_at: Optional[datetime]
    reviewed_by_name: Optional[str]
    sections: List[SectionReviewResponse]
    final_comment: Optional[str] = None


class ReviewHistoryResponse(BaseModel):
    service_id: int
    versions: List[ReviewHistoryVersionEntry]
