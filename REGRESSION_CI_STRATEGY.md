# LMS Tracking Regression & CI Strategy

This strategy ensures that any changes to the codebase do not break the analytics data pipeline.

## 1. Automated Regression Scenarios

### Scenario A: Token Expiration Mid-Pulse
- **Test**: Mock 401 response on 3rd pulse.
- **Expected**: Frontend `Telemetry` utility log warns. Application does not crash. Session data remains up-to-date up to Pulse 2.

### Scenario B: Multi-Tab Focus Contention
- **Test**: Two tabs open same video, different positions.
- **Expected**: Backend uses `F()` expressions or "Latest Wins" strategy. Atomic focus time must not double-count (15s real time = 15s recorded time across all tabs).

### Scenario C: Backend Restart Recovery
- **Test**: Shutdown Django mid-pulse, restart.
- **Expected**: Frontend retries or fails gracefully. On next heartbeat (Pulse + 1), absolute `watch_time` resyncs the state.

### Scenario D: Rapid Resource Switching
- **Test**: User clicks 5 resources in 2 seconds.
- **Expected**: 5 separate pulses recorded. Module progress reflects the latest state accurately.

---

## 2. CI/CD Gating (GitHub Actions)

Analytics correctness is a **Blocking Requirement** for all PRs.

### Pipeline Steps:
1. **Linting**: Check for `api.post` calls to tracking endpoints that aren't wrapped in `Telemetry.track`.
2. **Backend Unit Tests**: Run `pytest apps/modules/tests_tracking.py`.
3. **Integration Tests**: Verify end-to-end completion flow (A user watches video -> passes quiz -> module marked complete).

### Sample Gating Config:
```yaml
name: LMS Tracking Guard
on: [pull_request]

jobs:
  validate-analytics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Tracking Contract Tests
        run: |
          pytest backend/apps/modules/tests_tracking.py
      - name: Assert Zero Silent Swallows
        run: |
          grep -r "api.post.*complete" frontend/src || exit 0
          echo "Error: Unwrapped tracking call found."
```

## 3. Analytics Confidence Score Calculation
Weekly audit script `backend/audit_telemetry.py` must run to compare `ResourceProgress` vs `LearningSession` totals.
- **Goal**: Discrepancy < 2%.
- **Action**: If > 5%, block production deployments until root cause is fixed.
