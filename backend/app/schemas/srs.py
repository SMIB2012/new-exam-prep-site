"""Pydantic schemas for SRS (Spaced Repetition System)."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

# ============================================================================
# SRS Queue Schemas
# ============================================================================


class SRSQueueItemResponse(BaseModel):
    """Single concept in the SRS queue."""

    concept_id: UUID
    due_at: datetime
    stability: float
    difficulty: float
    retrievability: float | None
    priority_score: float = Field(..., description="Priority (0-1, higher = more urgent)")
    is_overdue: bool
    days_overdue: float | None
    bucket: str = Field(..., description="Time bucket: overdue, today, tomorrow, day_N, later")

    # Optional joined data (if available)
    concept_name: str | None = None
    theme_id: UUID | None = None
    theme_name: str | None = None
    block_id: UUID | None = None
    block_name: str | None = None


class SRSQueueResponse(BaseModel):
    """Response for SRS queue endpoint."""

    scope: str  # "today" or "week"
    total_due: int
    items: list[SRSQueueItemResponse]


class SRSUserStatsResponse(BaseModel):
    """User's SRS statistics."""

    total_concepts: int
    due_today: int
    due_this_week: int
    total_reviews: int
    has_personalized_weights: bool
    last_trained_at: datetime | None


# ============================================================================
# SRS Update Schemas
# ============================================================================


class SRSUpdateRequest(BaseModel):
    """Request to update SRS state from an attempt (internal use)."""

    user_id: UUID
    concept_ids: list[UUID]
    correct: bool
    occurred_at: datetime
    telemetry: dict | None = None
    raw_attempt_id: UUID | None = None
    session_id: UUID | None = None


class SRSUpdateResponse(BaseModel):
    """Response for SRS update."""

    concept_id: UUID
    stability: float
    difficulty: float
    due_at: datetime
    retrievability: float
    rating: int = Field(..., ge=1, le=4, description="FSRS rating 1-4")


# ============================================================================
# Training Schemas
# ============================================================================


class SRSTrainUserRequest(BaseModel):
    """Request to train user-specific FSRS weights."""

    user_id: UUID | None = Field(
        None, description="User ID (admin only, defaults to current user for students)"
    )
    min_logs: int = Field(300, ge=50, description="Minimum review logs required")
    val_split: float = Field(0.2, ge=0.1, le=0.4, description="Validation split ratio")
    shrinkage_alpha: float | None = Field(
        None, ge=0.0, le=1.0, description="Shrinkage factor (auto-computed if None)"
    )


class SRSTrainBatchRequest(BaseModel):
    """Request to train multiple users (admin only)."""

    user_ids: list[UUID] | None = Field(
        None, description="Specific user IDs, or None for top N active users"
    )
    top_n: int = Field(
        100, ge=1, le=1000, description="Number of top users to train (if user_ids not provided)"
    )
    min_logs: int = Field(300, ge=50)
    val_split: float = Field(0.2, ge=0.1, le=0.4)


class SRSTrainingSummary(BaseModel):
    """Summary of training run."""

    user_id: UUID
    success: bool
    message: str
    n_logs: int
    val_logloss: float | None = None
    val_brier: float | None = None
    baseline_logloss: float | None = None
    improvement: float | None = None  # Percentage improvement over baseline
    shrinkage_alpha: float | None = None
    optimal_retention: float | None = None


class SRSTrainUserResponse(BaseModel):
    """Response for training a single user."""

    ok: bool
    run_id: UUID
    algo: dict
    params_id: UUID
    summary: SRSTrainingSummary


class SRSTrainBatchResponse(BaseModel):
    """Response for batch training."""

    ok: bool
    total_users: int
    successful: int
    failed: int
    summaries: list[SRSTrainingSummary]


# ============================================================================
# Concept State Schemas
# ============================================================================


class SRSConceptStateResponse(BaseModel):
    """Current SRS state for a concept."""

    user_id: UUID
    concept_id: UUID
    stability: float
    difficulty: float
    last_reviewed_at: datetime | None
    due_at: datetime | None
    last_retrievability: float | None
    updated_at: datetime

    class Config:
        from_attributes = True


class SRSReviewLogResponse(BaseModel):
    """Review log entry."""

    id: UUID
    user_id: UUID
    concept_id: UUID
    reviewed_at: datetime
    rating: int = Field(..., ge=1, le=4)
    correct: bool
    delta_days: float
    time_spent_ms: int | None
    change_count: int | None
    predicted_retrievability: float | None
    session_id: UUID | None

    class Config:
        from_attributes = True
