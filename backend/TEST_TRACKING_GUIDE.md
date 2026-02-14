# Real-Time Learner Tracking - Manual Test Guide

## Prerequisites
1. Backend server running on `localhost:8000`
2. Frontend server running on `localhost:3000`
3. Mock data purged (completed via `clear_tracking_data.py`)

## Test Scenarios

### Scenario 1: Video Progress Tracking
**Goal**: Verify that watching a video updates the session heartbeat and ModuleProgress.

**Steps**:
1. Login as a learner (e.g., `aravind.guggilla`)
2. Navigate to **any module** (e.g., Module ID 20)
3. Play the embedded YouTube video for **at least 10 seconds**
4. Wait **30 seconds** for the heartbeat to fire
5. Check backend database:
   ```sql
   SELECT * FROM analytics_activitylog WHERE user_id=1 ORDER BY timestamp DESC LIMIT 5;
   SELECT * FROM analytics_learningsession WHERE user_id=1 ORDER BY start_time DESC LIMIT 1;
   SELECT * FROM progress_moduleprogress WHERE user_id=1 AND module_id=20;
   ```

**Expected**:
- `analytics_activitylog` should have a new row with `activity_type='video_progress'` and `metadata={'progress_pct': <5-15>}`
- `analytics_learningsession` should show `focus_duration_seconds >= 30`
- `progress_moduleprogress` should have `status='in_progress'`

---

### Scenario 2: Quiz Submission Tracking
**Goal**: Verify that passing a quiz marks the module as 'completed'.

**Steps**:
1. Login as a learner
2. Navigate to a module with a quiz (e.g., Module ID 20)
3. Click "Take Quiz" button
4. Answer all questions correctly (to pass)
5. Submit quiz
6. Check database:
   ```sql
   SELECT * FROM quiz_quizattempt WHERE user_id=1 ORDER BY attempted_at DESC LIMIT 1;
   SELECT * FROM progress_moduleprogress WHERE user_id=1 AND module_id=20;
   ```

**Expected**:
- `quiz_quizattempt` should show `score=100` and `passed=1`
- `progress_moduleprogress` should show `status='completed'` with `completed_at` timestamp

---

### Scenario 3: Assignment Submission Tracking
**Goal**: Verify that submitting an assignment marks the module as 'completed'.

**Steps**:
1. Login as a learner
2. Navigate to a module with an assignment (e.g., Module ID 20)
3. Click "Access Protocol" (Assignment button)
4. Write some assignment content
5. Click "Submit Assignment"
6. Check database:
   ```sql
   SELECT * FROM assignments_assignment WHERE user_id=1 ORDER BY submitted_at DESC LIMIT 1;
   SELECT * FROM progress_moduleprogress WHERE user_id=1 AND module_id=20;
   ```

**Expected**:
- `assignments_assignment` should show `status='completed'` and `submitted_at` timestamp
- `progress_moduleprogress` should show `status='completed'`

---

### Scenario 4: Manager Dashboard Real-Time Display
**Goal**: Verify that Manager Dashboard reflects the real tracking data.

**Steps**:
1. Perform Scenarios 1-3 as a learner
2. Logout and login as **Manager** (or open in a new incognito window)
3. Navigate to **Manager Dashboard**
4. Observe the learner grid

**Expected**:
- Learner should show:
  - **Time Invested**: `0h 1m` (at least 30s from heartbeat)
  - **Video Progress**: `5-10%` (depends on how much of the video was watched)
  - **Quiz Progress**: `5%` (1 quiz passed out of 20 total)
  - **Assignment Progress**: `5%` (1 assignment submitted out of 20 total)
  - **Status**: `active` (if logged in recently)

---

## Quick Database Verification Commands

```bash
# From backend directory
python manage.py shell
```

```python
from apps.analytics.models import ActivityLog, LearningSession
from apps.progress.models import ModuleProgress
from apps.quiz.models import QuizAttempt
from apps.assignments.models import Assignment
from django.contrib.auth import get_user_model

User = get_user_model()
learner = User.objects.get(username='aravind.guggilla')

# Check video logs
ActivityLog.objects.filter(user=learner, activity_type='video_progress').count()

# Check sessions
LearningSession.objects.filter(user=learner).last().focus_duration_seconds

# Check module progress
ModuleProgress.objects.filter(user=learner, status='completed').count()
```

---

## Success Criteria
✅ Video progress heartbeat fires every 30s with accurate `progress_pct`  
✅ Quiz submission marks module as 'completed'  
✅ Assignment submission marks module as 'completed'  
✅ Manager Dashboard displays real metrics (not zeros or fake data)  
✅ No hardcoded values in heartbeat (e.g., `progress_pct: 10`)
