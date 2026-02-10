# LMS Telemetry & Tracking Event Contract

This document defines the strict data contract for all tracking events in the LMS. Any deviation from this contract is considered a critical regression.

## 1. Core Principles
- **Idempotency**: All pulse and status updates must be idempotent or use atomic increments (F expressions).
- **Atomic Enrollment**: Auto-enrollment must use `get_or_create` to prevent duplicates.
- **Session Continuity**: Fragmented pulses must aggregate into 1-hour `LearningSession` windows.

## 2. Event Registry

### 1. `module_viewed`
- **Trigger**: Learner enters `ModulePlayer` page.
- **Endpoint**: `GET /api/modules/{id}/progress/` (Auto-creates `ModuleProgress` if missing)
- **Tables**: `apps.modules.models.ModuleProgress`
- **Payload**: None
- **Effect**: Sets `status` to `in_progress` if `not_started`. Updates `last_accessed`.

### 2. `video_focus_pulse`
- **Trigger**: Heartbeat every 15s during video playback.
- **Endpoint**: `POST /api/modules/{module_id}/resources/{resource_id}/complete/`
- **Payload**: `{ "duration_delta": 15, "watch_time": current_sec, "completed": bool }`
- **Tables**: `ResourceProgress` (watch_time), `LearningSession` (focus_duration)
- **Effect**: Atomic increment of `watch_time_seconds` and `focus_duration_seconds`.

### 3. `resource_engaged`
- **Trigger**: Learner clicks a PDF or URL resource.
- **Endpoint**: `POST /api/modules/{module_id}/resources/{resource_id}/complete/`
- **Payload**: `{ "completed": true }`
- **Tables**: `ResourceProgress`
- **Effect**: Marks `completed = True`. Triggers module completion check.

### 4. `quiz_submitted`
- **Trigger**: Click "Submit Quiz".
- **Endpoint**: `POST /api/quiz/{module_id}/submit/`
- **Payload**: `{ "answers": { "q_id": "a_id" } }`
- **Tables**: `QuizAttempt`
- **Effect**: Records score and pass/fail. Triggers `module_completed` check if `passed=True`.

### 5. `auto_enrolled`
- **Trigger**: Learner submits an assignment for an unassigned module.
- **Endpoint**: `POST /api/assignments/modules/{module_id}/submissions/`
- **Tables**: `Assignment`, `Submission`
- **Effect**: Creates `Assignment` record with `assigned_by = user`.

### 6. `module_completed`
- **Trigger**: Final requirement (Quiz, Assignment, or last Resource) is met.
- **Execution**: Backend internal logic (via `check_completion()`).
- **Tables**: `ModuleProgress`
- **Effect**: Sets `status = 'completed'`, `completed_at = now()`.

---

## 3. Data Integrity Constraints
| Metric | Constraint |
|---|---|
| Duplicate Enrollments | `(user_id, module_id)` must be unique in `Assignment`. |
| Focus Attribution | `LearningSession.focus_duration_seconds` must match sum of `ResourceProgress.watch_time_seconds` for active users. |
| Completion Order | `ResourceProgress` cannot be `completed` without `ModuleProgress` being at least `in_progress`. |
