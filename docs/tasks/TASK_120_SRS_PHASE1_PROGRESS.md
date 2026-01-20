# TASK 120: FSRS-based Forgetting Model - Phase 1 Progress

This document summarizes the progress on implementing the production-grade FSRS-based spaced repetition system with per-user tuning.

## ✅ Phase 1 Deliverables (40% Complete)

### 1. Dependencies Added
- `fsrs[optimizer]==4.3.1` added to `backend/requirements.txt`
- Includes py-fsrs library with optimizer for EM training

### 2. Database Schema Created

**Files Created:**
- `backend/app/models/srs.py` (NEW, 162 lines)
- `backend/alembic/versions/015_add_srs_tables.py` (NEW, 101 lines)
- `backend/app/models/__init__.py` (MODIFIED, imported SRS models)

**Tables:**

#### `srs_user_params`
Stores per-user FSRS parameters and training metadata.
- `user_id` (PK, FK to users)
- `fsrs_version` (default "fsrs-6")
- `weights_json` (nullable, 19 FSRS-6 weights)
- `desired_retention` (default 0.90)
- `n_review_logs` (count of review logs)
- `last_trained_at` (timestamp of last training)
- `metrics_json` (training metrics: logloss, brier, ece, etc.)
- Indexes on `last_trained_at` and `n_review_logs`

#### `srs_concept_state`
Tracks per-user per-concept memory state using FSRS.
- `user_id`, `concept_id` (composite PK)
- `stability` (memory stability in days)
- `difficulty` (item difficulty [0, 10])
- `last_reviewed_at` (timestamp)
- `due_at` (next review due date)
- `last_retrievability` (probability at last review)
- Indexes on `(user_id, due_at)`, `due_at`, `(user_id, concept_id)`

#### `srs_review_log`
Append-only log of all review attempts.
- `id` (UUID PK)
- `user_id`, `concept_id`
- `reviewed_at` (timestamp)
- `rating` (1-4: Again, Hard, Good, Easy)
- `correct` (boolean)
- `delta_days` (days since last review)
- `time_spent_ms`, `change_count` (optional telemetry)
- `predicted_retrievability` (FSRS prediction at review time)
- `raw_attempt_id`, `session_id` (traceability)
- Indexes on `(user_id, reviewed_at)`, `(user_id, concept_id, reviewed_at)`, `session_id`

### 3. FSRS Adapter Implemented

**File Created:**
- `backend/app/learning_engine/srs/fsrs_adapter.py` (NEW, 284 lines)

**Components:**

#### `get_default_parameters()`
- Returns FSRS-6 default weights (19 parameters)
- Default desired retention: 0.90

#### `compute_next_state_and_due()`
- Main state update function
- Takes current S/D, rating, delta_days, weights
- Returns new (stability, difficulty, due_at, retrievability)
- Handles first reviews (cold start)
- Includes numerical stability guards (NaN checks, bounds validation)

#### `create_review_log_from_state()`
- Creates FSRS ReviewLog objects for training
- Converts our data format to py-fsrs format

#### `validate_weights()`
- Validates FSRS-6 weights (19 parameters)
- Checks for finite values and reasonable ranges

#### `compute_optimal_retention()`
- Heuristic for optimal retention target
- Based on user's struggle rate (Again/Hard frequency)
- Range: [0.70, 0.95]

**Key Features:**
- Wraps py-fsrs Scheduler and Card objects
- Numerical stability guards (isfinite, bounds checking)
- Graceful fallbacks for edge cases
- First review handling (cold start)
- Deterministic computations

### 4. Rating Mapper Implemented

**File Created:**
- `backend/app/learning_engine/srs/rating_mapper.py` (NEW, 171 lines)

**Components:**

#### `map_attempt_to_rating()`
Deterministic mapping from MCQ attempt to FSRS rating (1-4):

**Rules:**
1. Incorrect → 1 (Again)
2. Correct + marked for review → 2 (Hard)
3. Correct + many changes (>0) → 2 (Hard)
4. Correct + very slow (>90s) → 2 (Hard)
5. Correct + fast (<15s) + no changes → 4 (Easy)
6. Correct (default) → 3 (Good)

**Inputs:**
- `correct`: boolean
- `time_spent_ms`: optional time spent (ms)
- `change_count`: optional answer changes
- `marked_for_review`: optional flag

#### `explain_rating()`
- Human-readable explanation for each rating assignment
- Useful for debugging and user feedback

#### `get_rating_thresholds()`
- Returns current classification thresholds
- Fast answer: 15 seconds
- Slow answer: 90 seconds
- Max changes for confident: 0

#### `validate_telemetry()`
- Sanitizes telemetry data
- Detects suspicious values (negative, extreme)
- Returns cleaned data + warnings

#### `set_rating_thresholds()`
- Override thresholds (mainly for testing)
- Configurable fast/slow boundaries

**Key Features:**
- Deterministic mapping (no randomness)
- Handles missing telemetry gracefully
- Configurable thresholds
- Explainable ratings

## 📊 Implementation Statistics

### Files Created: 4
1. `backend/app/models/srs.py` (162 lines)
2. `backend/alembic/versions/015_add_srs_tables.py` (101 lines)
3. `backend/app/learning_engine/srs/fsrs_adapter.py` (284 lines)
4. `backend/app/learning_engine/srs/rating_mapper.py` (171 lines)

### Files Modified: 2
1. `backend/requirements.txt` (added fsrs dependency)
2. `backend/app/models/__init__.py` (imported SRS models)

### Total Lines Added: ~718 lines

## 🚧 Remaining Work (60% - Phase 2)

### Critical Path:
1. **Service Layer** (`service.py`):
   - `get_user_params()` - fetch/create user params
   - `update_from_attempt()` - core update logic
   - Upsert `srs_concept_state`
   - Append to `srs_review_log`
   - Update `n_review_logs` counter

2. **Queue API** (`GET /v1/learning/srs/queue`):
   - Query due concepts by `due_at <= now`
   - Join concept/theme/block names
   - Return bucketed by day (today/this week)
   - Compute priority (low retrievability, low BKT mastery)

3. **Training Pipeline** (`training.py`):
   - Build ReviewLog list from `srs_review_log`
   - Minimum 300 logs threshold
   - Train/val split (last 20% for validation)
   - Run `Optimizer().compute_optimal_parameters()`
   - Apply shrinkage: `alpha * user_weights + (1-alpha) * global_weights`
   - Evaluate metrics (logloss, Brier)
   - Persist to `srs_user_params`

4. **Admin Training API**:
   - `POST /v1/admin/learning/srs/train-user/{user_id}`
   - `POST /v1/admin/learning/srs/train-batch`
   - Algo_runs logging

5. **Session Integration**:
   - Hook into `POST /v1/sessions/{id}/submit`
   - Extract `concept_id` from questions
   - Call `update_from_attempt()` for each answer
   - Best-effort (non-blocking)

6. **Tests**:
   - Rating mapper deterministic tests
   - FSRS adapter state validity tests
   - Update creates log + updates due_at
   - Training pipeline thresholds/shrinkage
   - Queue endpoint buckets

7. **Documentation**:
   - Update `docs/algorithms.md` with FSRS section
   - State variables (S, D, R)
   - Cold start + tuning
   - Rating mapping
   - Training guardrails

## 🎯 Design Decisions

### Cold Start Strategy
- Use global FSRS-6 default weights initially
- No blocking if personalized weights unavailable
- Graceful fallback to defaults

### Per-User Tuning Guardrails
- Minimum 300 review logs before training
- Train/val split for validation
- Shrinkage toward global weights (alpha increases with data)
- Reject regressions (worse val metrics than baseline)
- Log all training runs in `algo_runs`

### Numerical Stability
- Validate all FSRS outputs (isfinite, bounds)
- Fallback to previous values on invalid outputs
- Ensure `due_at` always in future
- Cap extreme telemetry values

### Auditability
- Every state change logged in `srs_review_log`
- Training runs logged in `algo_runs`
- Reproducible with same weights + same logs

### Integration Philosophy
- Best-effort updates (don't block session submission)
- Graceful handling of missing `concept_id`
- Log warnings, don't crash

## ✅ Completed Tasks (4/10)

- [x] Add fsrs[optimizer] dependency
- [x] Create DB tables (3 tables, 7 indexes)
- [x] Implement FSRS adapter (state computation, scheduling)
- [x] Implement rating mapper (MCQ → FSRS rating 1-4)
- [ ] Implement service layer (update_from_attempt)
- [ ] Implement queue API
- [ ] Implement training pipeline
- [ ] Add admin training endpoints
- [ ] Integrate into session flow
- [ ] Add comprehensive tests

## 📝 Next Steps

**Phase 2 will implement:**
1. Service layer (core update logic)
2. Queue generation API
3. Training pipeline with optimizer
4. Admin endpoints
5. Session integration
6. Tests
7. Documentation

**Estimated Time:** 3-4 hours for Phase 2

---

**Phase 1 Status:** ✅ 40% COMPLETE

**Commit Ready:** Yes (no linter errors, migrations created)

**Next:** Continue with Phase 2 (service layer + queue API)
