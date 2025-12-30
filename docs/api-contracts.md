# API Contracts

## Base URL

- Development: `http://localhost:8000`
- Production: TBD

## Authentication

**Temporary**: Use `X-User-Id` header
- Student: `X-User-Id: student-1`
- Admin: `X-User-Id: admin-1`

## Endpoints

### Syllabus

#### GET /blocks

Get all blocks, optionally filtered by year.

**Query Parameters:**
- `year` (optional): Filter by year (1 or 2)

**Response:**
```json
[
  {
    "id": "A",
    "name": "Anatomy",
    "year": 1,
    "description": "Human anatomy and structure"
  }
]
```

#### GET /themes

Get all themes, optionally filtered by block.

**Query Parameters:**
- `block_id` (optional): Filter by block ID

**Response:**
```json
[
  {
    "id": 1,
    "block_id": "A",
    "name": "Cardiovascular System",
    "description": "Theme: Cardiovascular System"
  }
]
```

### Admin - Questions

#### GET /admin/questions

List all questions (admin only).

**Query Parameters:**
- `skip` (default: 0): Pagination offset
- `limit` (default: 100): Page size
- `published` (optional): Filter by published status (true/false)

**Headers:**
- `X-User-Id`: Must be admin user

**Response:**
```json
[
  {
    "id": 1,
    "theme_id": 1,
    "question_text": "Which of the following...",
    "options": ["Option A", "Option B", "Option C", "Option D", "Option E"],
    "correct_option_index": 0,
    "explanation": "Explanation text",
    "tags": ["tag1", "tag2"],
    "difficulty": "medium",
    "is_published": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": null
  }
]
```

#### POST /admin/questions

Create a new question (admin only).

**Headers:**
- `X-User-Id`: Must be admin user

**Request Body:**
```json
{
  "theme_id": 1,
  "question_text": "Question text here",
  "options": ["A", "B", "C", "D", "E"],
  "correct_option_index": 0,
  "explanation": "Optional explanation",
  "tags": ["tag1", "tag2"],
  "difficulty": "medium"
}
```

**Validation:**
- `options` must have exactly 5 items
- `correct_option_index` must be 0-4
- `tags` required before publishing

**Response:** Question object

#### GET /admin/questions/{id}

Get a question by ID (admin only).

**Response:** Question object

#### PUT /admin/questions/{id}

Update a question (admin only).

**Request Body:** Partial question object (all fields optional)

**Response:** Updated question object

#### POST /admin/questions/{id}/publish

Publish a question (admin only).

**Validation:**
- Question must have tags

**Response:**
```json
{
  "message": "Question published",
  "question_id": 1
}
```

#### POST /admin/questions/{id}/unpublish

Unpublish a question (admin only).

**Response:**
```json
{
  "message": "Question unpublished",
  "question_id": 1
}
```

### Student - Practice

#### GET /questions

Get published questions (student access).

**Query Parameters:**
- `theme_id` (optional): Filter by theme
- `block_id` (optional): Filter by block
- `limit` (default: 50): Maximum results

**Response:** Array of Question objects (published only)

#### POST /sessions

Create a practice session.

**Headers:**
- `X-User-Id`: Student user ID

**Request Body:**
```json
{
  "theme_id": 1,
  "block_id": "A",
  "question_count": 30,
  "time_limit_minutes": 60
}
```

**Note:** Provide either `theme_id` OR `block_id`, not both.

**Response:**
```json
{
  "id": 1,
  "user_id": "student-1",
  "question_count": 30,
  "time_limit_minutes": 60,
  "question_ids": [1, 2, 3, ...],
  "is_submitted": false,
  "started_at": "2024-01-01T00:00:00Z",
  "submitted_at": null
}
```

#### GET /sessions/{id}

Get a session by ID.

**Response:** Session object

#### POST /sessions/{id}/answer

Submit an answer for a question in a session.

**Request Body:**
```json
{
  "question_id": 1,
  "selected_option_index": 0,
  "is_marked_for_review": false
}
```

**Response:**
```json
{
  "message": "Answer submitted",
  "is_correct": true
}
```

#### POST /sessions/{id}/submit

Submit/finalize a session.

**Response:**
```json
{
  "message": "Session submitted",
  "score": 25,
  "total": 30,
  "percentage": 83.33
}
```

#### GET /sessions/{id}/review

Get review data for a submitted session.

**Response:**
```json
{
  "session_id": 1,
  "total_questions": 30,
  "correct_count": 25,
  "incorrect_count": 5,
  "score_percentage": 83.33,
  "questions": [
    {
      "question_id": 1,
      "question_text": "Question text",
      "options": ["A", "B", "C", "D", "E"],
      "correct_option_index": 0,
      "selected_option_index": 0,
      "is_correct": true,
      "explanation": "Explanation",
      "is_marked_for_review": false
    }
  ]
}
```

### Utility

#### POST /seed

Seed the database with demo data (development only).

**Response:**
```json
{
  "message": "Database seeded successfully"
}
```

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message here"
}
```

**Status Codes:**
- `200`: Success
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid X-User-Id)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

Not implemented yet. Planned for production.

## Versioning

Current version: `v1.0.0`

API versioning strategy: TBD (headers or URL path)

