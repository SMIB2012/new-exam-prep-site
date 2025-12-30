# Algorithms & Logic Documentation

## Overview

This document describes the algorithms, business logic, and computational approaches used in the Medical Exam Platform.

## Current Implementation (Phase 1: Skeleton)

### Question Selection Algorithm

**Location:** `backend/main.py` - `POST /sessions`

**Current Logic:**
```python
# Simple random selection
query = db.query(Question).filter(Question.is_published == True)
if theme_id:
    query = query.filter(Question.theme_id == theme_id)
elif block_id:
    query = query.join(Theme).filter(Theme.block_id == block_id)

questions = query.limit(question_count).all()
```

**Algorithm:**
1. Filter by published status
2. Apply theme or block filter
3. Limit to requested count
4. Return questions in database order

**Limitations:**
- No difficulty balancing
- No adaptive selection
- No question deduplication (same question can appear multiple times)

**Future Enhancement:**
- Weighted random selection based on difficulty
- Adaptive difficulty adjustment
- Spaced repetition scheduling
- Question deduplication per user

---

### Answer Correctness Computation

**Location:** `backend/main.py` - `POST /sessions/{id}/answer`

**Current Logic:**
```python
is_correct = answer.selected_option_index == question.correct_option_index
```

**Algorithm:**
1. Compare `selected_option_index` with `correct_option_index`
2. Store boolean result in `is_correct`
3. Return immediate feedback

**Future Enhancement:**
- Partial credit for multi-select questions
- Confidence scoring
- Time-based scoring adjustments

---

### Score Calculation

**Location:** `backend/main.py` - `POST /sessions/{id}/submit`

**Current Logic:**
```python
answers = db.query(AttemptAnswer).filter(AttemptAnswer.session_id == session_id).all()
correct_count = sum(1 for a in answers if a.is_correct)
total_count = len(answers)
percentage = (correct_count / total_count * 100) if total_count > 0 else 0
```

**Algorithm:**
1. Fetch all answers for session
2. Count correct answers
3. Calculate percentage: `(correct / total) * 100`
4. Round to 2 decimal places

**Limitations:**
- Simple percentage only
- No weighted scoring
- No time-based adjustments

**Future Enhancement:**
- Weighted scoring by difficulty
- Time bonus/penalty
- Partial credit support
- Percentile ranking

---

## Planned Algorithms (Not Implemented)

### Adaptive Question Selection

**Purpose:** Select questions based on student performance

**Algorithm Concept:**
1. Track student performance per theme/difficulty
2. Identify weak areas
3. Prioritize questions from weak areas
4. Gradually increase difficulty as performance improves

**Implementation Approach:**
- Maintain performance metrics per user/theme
- Use weighted selection based on:
  - Weak area priority (higher weight)
  - Difficulty progression (adaptive)
  - Spaced repetition schedule

**Data Requirements:**
- User performance history
- Question difficulty ratings
- Concept mastery scores

---

### Spaced Repetition Scheduling

**Purpose:** Optimize review timing based on forgetting curve

**Algorithm Concept:**
1. Track when student last saw a question
2. Track correctness history
3. Calculate next review date using:
   - Ebbinghaus forgetting curve
   - SM-2 algorithm (or similar)
   - Performance-based intervals

**Implementation Approach:**
```python
def calculate_next_review(last_review, correctness_history, difficulty):
    # SM-2 algorithm
    if all(correct for correct in correctness_history[-3:]):
        interval = previous_interval * ease_factor
    else:
        interval = previous_interval * 0.5  # Reset
    
    return last_review + timedelta(days=interval)
```

**Data Requirements:**
- Review history per question
- Correctness timeline
- Interval tracking

---

### Weak Area Detection

**Purpose:** Identify themes/concepts where student struggles

**Algorithm Concept:**
1. Calculate accuracy per theme:
   ```
   theme_accuracy = correct_answers_in_theme / total_answers_in_theme
   ```
2. Compare to average accuracy
3. Flag themes below threshold (e.g., 20% below average)
4. Prioritize flagged themes in practice sessions

**Implementation Approach:**
- Aggregate `AttemptAnswer` data by `theme_id`
- Calculate accuracy metrics
- Rank themes by performance
- Generate recommendations

**Data Requirements:**
- User answer history
- Theme performance aggregations
- Threshold configuration

---

### Performance Prediction

**Purpose:** Predict student performance on future questions

**Algorithm Concept:**
1. Extract features:
   - Historical accuracy per theme
   - Time spent per question
   - Difficulty of attempted questions
   - Recent performance trends
2. Train model (ML approach):
   - Logistic regression
   - Random forest
   - Neural network
3. Predict probability of correctness

**Implementation Approach:**
- Feature engineering from `AttemptAnswer` data
- Model training on historical data
- Real-time prediction during sessions
- Continuous model retraining

**Data Requirements:**
- Large dataset of historical attempts
- Question metadata (difficulty, tags)
- User performance metrics

---

### Question Difficulty Calibration

**Purpose:** Automatically determine question difficulty

**Algorithm Concept:**
1. Collect performance data:
   - Percentage of students who answered correctly
   - Average time to answer
   - Distractor analysis
2. Apply Item Response Theory (IRT):
   - 3PL model: difficulty, discrimination, guessing
   - Calculate difficulty parameter
3. Update question difficulty rating

**Implementation Approach:**
```python
def calculate_difficulty(question_id):
    answers = get_all_answers_for_question(question_id)
    correct_rate = sum(a.is_correct for a in answers) / len(answers)
    
    # Convert to IRT difficulty scale
    if correct_rate > 0.8:
        return "easy"
    elif correct_rate > 0.5:
        return "medium"
    else:
        return "hard"
```

**Data Requirements:**
- Sufficient answer data per question (minimum ~50 answers)
- Statistical analysis tools
- Calibration dataset

---

### Concept Mastery Calculation

**Purpose:** Determine student mastery level for each concept

**Algorithm Concept:**
1. Map questions to concepts (via tags or Neo4j graph)
2. Calculate concept-level performance:
   ```
   concept_mastery = weighted_average(
       question_performance for all questions in concept
   )
   ```
3. Apply mastery thresholds:
   - 0-40%: Novice
   - 40-70%: Developing
   - 70-90%: Proficient
   - 90-100%: Mastered

**Implementation Approach:**
- Concept-question mapping (tags or graph)
- Performance aggregation per concept
- Threshold-based classification
- Visualization in analytics dashboard

**Data Requirements:**
- Concept taxonomy (Neo4j graph)
- Question-concept relationships
- User performance history

---

## Algorithm Complexity

### Current Algorithms

| Algorithm | Time Complexity | Space Complexity | Notes |
|-----------|----------------|------------------|-------|
| Question Selection | O(n) | O(k) | n = total questions, k = selected count |
| Answer Validation | O(1) | O(1) | Simple comparison |
| Score Calculation | O(m) | O(1) | m = number of answers |

### Future Algorithms

| Algorithm | Expected Complexity | Optimization Strategy |
|-----------|---------------------|----------------------|
| Adaptive Selection | O(n log n) | Pre-compute performance metrics |
| Spaced Repetition | O(log m) | Index by next review date |
| Weak Area Detection | O(t) | t = number of themes, cache results |
| Performance Prediction | O(f) | f = feature count, batch processing |
| Difficulty Calibration | O(a) | a = answers per question, batch updates |

---

## Performance Considerations

### Optimization Strategies

1. **Caching**
   - Cache question lists per theme/block
   - Cache user performance metrics
   - Invalidate on new answers

2. **Precomputation**
   - Pre-calculate theme performance scores
   - Pre-compute difficulty ratings
   - Batch update algorithms

3. **Indexing**
   - Index on `is_published`, `theme_id` for question queries
   - Index on `user_id`, `is_submitted` for session queries
   - Composite indexes for common query patterns

4. **Batch Processing**
   - Process analytics in background jobs
   - Update difficulty ratings asynchronously
   - Generate recommendations offline

---

## Testing Strategy

### Unit Tests (Future)

- Question selection logic
- Score calculation edge cases
- Answer validation rules

### Integration Tests (Future)

- End-to-end session flow
- Performance metric calculations
- Adaptive selection behavior

### Algorithm Validation (Future)

- Compare predicted vs actual performance
- Validate difficulty calibration accuracy
- Test spaced repetition effectiveness

---

## Research & References

### Spaced Repetition
- SM-2 Algorithm (SuperMemo)
- Anki's algorithm
- Leitner System

### Item Response Theory
- 3PL Model (3-Parameter Logistic)
- Difficulty, Discrimination, Guessing parameters

### Adaptive Testing
- Computerized Adaptive Testing (CAT)
- Maximum Information Criterion
- Content Balancing

### Performance Prediction
- Logistic Regression for binary outcomes
- Collaborative Filtering for recommendations
- Deep Learning for complex patterns

---

## Implementation Roadmap

### Phase 1 (Current)
- ✅ Basic question selection
- ✅ Simple correctness checking
- ✅ Percentage scoring

### Phase 2 (Next)
- ⏳ Weak area detection
- ⏳ Basic difficulty balancing
- ⏳ Performance metrics

### Phase 3 (Future)
- ⏳ Spaced repetition
- ⏳ Adaptive selection
- ⏳ Performance prediction

### Phase 4 (Advanced)
- ⏳ IRT difficulty calibration
- ⏳ Concept mastery
- ⏳ ML-based recommendations

