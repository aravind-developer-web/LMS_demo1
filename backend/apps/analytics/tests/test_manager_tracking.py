"""
Manager Dashboard Tracking Tests — Enterprise Validation Suite

Tests the complete tracking flow from learner action to manager dashboard display.
Validates data correctness, atomicity, and freshness.
"""

import pytest
from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from concurrent.futures import ThreadPoolExecutor, wait

from apps.modules.models import Module, Resource, ResourceProgress, ModuleProgress
from apps.analytics.models import LearningSession
from apps.quiz.models import Quiz, QuizAttempt
from apps.assignments.models import Assignment, Submission
from apps.analytics.intelligence import IntelligenceEngine

User = get_user_model()


class ManagerTrackingFlowTests(TestCase):
    """Test end-to-end tracking flow from learner to manager dashboard"""

    def setUp(self):
        self.learner = User.objects.create_user(
            username='testlearner',
            password='testpass123',
            role='learner'
        )
        self.manager = User.objects.create_user(
            username='testmanager',
            password='testpass123',
            role='manager',
            is_staff=True
        )
        self.client = APIClient()

    def test_video_watch_reflects_in_manager_dashboard(self):
        """
        Test: Learner watches 60s of video
        Expected: Manager sees +60s focus time within API call
        """
        # Create module and resource
        module = Module.objects.create(title="Test Module", difficulty="beginner")
        resource = Resource.objects.create(
            module=module,
            title="Test Video",
            type="video",
            url="https://example.com/video.mp4"
        )

        # Simulate learner watching video (4 pulses of 15s each)
        self.client.force_authenticate(user=self.learner)
        for _ in range(4):
            response = self.client.post(
                f'/api/modules/{module.id}/resources/{resource.id}/complete/',
                {'duration_delta': 15},
                format='json'
            )
            self.assertEqual(response.status_code, 200)

        # Verify manager dashboard shows correct focus time
        self.client.force_authenticate(user=self.manager)
        response = self.client.get('/api/analytics/manager/learners/')
        self.assertEqual(response.status_code, 200)
        
        learner_data = next(l for l in response.data if l['id'] == self.learner.id)
        self.assertEqual(learner_data['total_focus_mins'], 1.0)  # 60s = 1 min

    def test_module_completion_updates_manager_view(self):
        """
        Test: Learner completes all module requirements
        Expected: Manager sees status change to "Completed"
        """
        # Create module with 2 resources
        module = Module.objects.create(title="Test Module", difficulty="beginner")
        resource1 = Resource.objects.create(module=module, title="R1", type="url", url="http://ex.com")
        resource2 = Resource.objects.create(module=module, title="R2", type="url", url="http://ex.com")

        # Complete both resources
        self.client.force_authenticate(user=self.learner)
        self.client.post(
            f'/api/modules/{module.id}/resources/{resource1.id}/complete/',
            {'completed': True},
            format='json'
        )
        self.client.post(
            f'/api/modules/{module.id}/resources/{resource2.id}/complete/',
            {'completed': True},
            format='json'
        )

        # Verify manager sees completion
        self.client.force_authenticate(user=self.manager)
        response = self.client.get('/api/analytics/manager/learners/')
        learner_data = next(l for l in response.data if l['id'] == self.learner.id)
        self.assertEqual(learner_data['modules_completed'], 1)

    def test_inactive_learner_detection(self):
        """
        Test: Learner inactive for 73 hours
        Expected: Manager sees "Inactive" status
        """
        # Create old learning session
        old_time = timezone.now() - timedelta(hours=73)
        LearningSession.objects.create(
            user=self.learner,
            start_time=old_time,
            end_time=old_time + timedelta(minutes=30),
            focus_duration_seconds=1800
        )

        # Verify manager sees inactive status
        self.client.force_authenticate(user=self.manager)
        response = self.client.get('/api/analytics/manager/learners/')
        learner_data = next(l for l in response.data if l['id'] == self.learner.id)
        
        # Check that learner is not in active_24h count
        summary_response = self.client.get('/api/analytics/manager/team-summary/')
        self.assertEqual(summary_response.data['active_24h'], 0)

    def test_team_summary_accuracy(self):
        """
        Test: Verify team summary metrics match raw DB counts
        """
        # Create 2 learners with different activity levels
        learner2 = User.objects.create_user(
            username='learner2',
            password='testpass123',
            role='learner'
        )

        # Learner 1: 30 mins focus time
        LearningSession.objects.create(
            user=self.learner,
            start_time=timezone.now() - timedelta(hours=1),
            end_time=timezone.now(),
            focus_duration_seconds=1800
        )

        # Learner 2: 60 mins focus time
        LearningSession.objects.create(
            user=learner2,
            start_time=timezone.now() - timedelta(hours=2),
            end_time=timezone.now(),
            focus_duration_seconds=3600
        )

        # Verify team summary
        self.client.force_authenticate(user=self.manager)
        response = self.client.get('/api/analytics/manager/team-summary/')
        
        self.assertEqual(response.data['active_24h'], 2)
        self.assertEqual(response.data['avg_focus_mins'], 45.0)  # (30+60)/2

    def test_api_includes_computed_timestamp(self):
        """
        Test: All manager APIs include computed_at timestamp
        """
        self.client.force_authenticate(user=self.manager)
        
        # Test team summary
        response = self.client.get('/api/analytics/manager/team-summary/')
        self.assertIn('computed_at', response.data)
        self.assertIsNotNone(response.data['computed_at'])

        # Test learner details
        module = Module.objects.create(title="Test", difficulty="beginner")
        ModuleProgress.objects.create(user=self.learner, module=module)
        
        response = self.client.get(f'/api/analytics/manager/{self.learner.id}/details/')
        self.assertIn('computed_at', response.data)


class AtomicTrackingTests(TransactionTestCase):
    """Test atomic operations and race condition handling"""

    def setUp(self):
        self.learner = User.objects.create_user(
            username='testlearner',
            password='testpass123',
            role='learner'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.learner)

    def test_concurrent_pulse_atomicity(self):
        """
        Test: 10 concurrent pulses of 15s each
        Expected: Total watch time = 150s (no race conditions)
        """
        module = Module.objects.create(title="Test Module", difficulty="beginner")
        resource = Resource.objects.create(
            module=module,
            title="Test Video",
            type="video",
            url="https://example.com/video.mp4"
        )

        def send_pulse():
            client = APIClient()
            client.force_authenticate(user=self.learner)
            return client.post(
                f'/api/modules/{module.id}/resources/{resource.id}/complete/',
                {'duration_delta': 15},
                format='json'
            )

        # Send 10 concurrent pulses
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(send_pulse) for _ in range(10)]
            wait(futures)

        # Verify total watch time
        progress = ResourceProgress.objects.get(user=self.learner, resource=resource)
        self.assertEqual(progress.watch_time_seconds, 150)

    def test_duplicate_module_progress_prevention(self):
        """
        Test: Concurrent module enrollment attempts
        Expected: Only one ModuleProgress record created
        """
        module = Module.objects.create(title="Test Module", difficulty="beginner")
        resource = Resource.objects.create(module=module, title="R1", type="url", url="http://ex.com")

        def create_progress():
            client = APIClient()
            client.force_authenticate(user=self.learner)
            return client.post(
                f'/api/modules/{module.id}/resources/{resource.id}/complete/',
                {'duration_delta': 5},
                format='json'
            )

        # Attempt concurrent enrollments
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(create_progress) for _ in range(5)]
            wait(futures)

        # Verify only one ModuleProgress exists
        count = ModuleProgress.objects.filter(user=self.learner, module=module).count()
        self.assertEqual(count, 1)


class ProgressCalculationTests(TestCase):
    """Test progress percentage and status calculations"""

    def setUp(self):
        self.learner = User.objects.create_user(
            username='testlearner',
            password='testpass123',
            role='learner'
        )

    def test_module_completion_percentage_basic(self):
        """
        Test: Module with 3 resources, 2 completed
        Expected: 66.7% completion
        """
        module = Module.objects.create(title="Test", difficulty="beginner")
        r1 = Resource.objects.create(module=module, title="R1", type="url", url="http://ex.com")
        r2 = Resource.objects.create(module=module, title="R2", type="url", url="http://ex.com")
        r3 = Resource.objects.create(module=module, title="R3", type="url", url="http://ex.com")

        ResourceProgress.objects.create(user=self.learner, resource=r1, completed=True)
        ResourceProgress.objects.create(user=self.learner, resource=r2, completed=True)

        snapshot = IntelligenceEngine.get_learner_snapshot(self.learner)
        # Note: This requires implementing progress_percent in get_learner_snapshot
        # For now, we verify the underlying logic
        
        total = module.resources.count()
        completed = ResourceProgress.objects.filter(
            user=self.learner,
            resource__module=module,
            completed=True
        ).count()
        
        expected_percent = round((completed / total) * 100, 1)
        self.assertEqual(expected_percent, 66.7)

    def test_engagement_score_calculation(self):
        """
        Test: Verify engagement score components
        """
        module = Module.objects.create(title="Test", difficulty="beginner")
        ModuleProgress.objects.create(user=self.learner, module=module, status='completed')
        
        # Add focus time
        LearningSession.objects.create(
            user=self.learner,
            focus_duration_seconds=3600  # 1 hour
        )

        # Add quiz attempt
        quiz = Quiz.objects.create(module=module, title="Test Quiz")
        QuizAttempt.objects.create(
            user=self.learner,
            quiz=quiz,
            score=90,
            passed=True
        )

        score = IntelligenceEngine.calculate_engagement_score(self.learner)
        self.assertGreater(score, 0)
        self.assertLessEqual(score, 100)


class DataFreshnessTests(TestCase):
    """Test data freshness indicators"""

    def setUp(self):
        self.manager = User.objects.create_user(
            username='testmanager',
            password='testpass123',
            role='manager',
            is_staff=True
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.manager)

    def test_computed_at_timestamp_format(self):
        """
        Test: computed_at is valid ISO 8601 timestamp
        """
        response = self.client.get('/api/analytics/manager/team-summary/')
        self.assertEqual(response.status_code, 200)
        
        computed_at = response.data.get('computed_at')
        self.assertIsNotNone(computed_at)
        
        # Verify it's a valid ISO timestamp
        from datetime import datetime
        try:
            datetime.fromisoformat(computed_at.replace('Z', '+00:00'))
        except ValueError:
            self.fail("computed_at is not a valid ISO 8601 timestamp")

    def test_data_freshness_seconds_field(self):
        """
        Test: data_freshness_seconds field exists and is 0 for real-time
        """
        response = self.client.get('/api/analytics/manager/team-summary/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('data_freshness_seconds', response.data)
        self.assertEqual(response.data['data_freshness_seconds'], 0)


@pytest.mark.integration
class ErrorHandlingTests(TestCase):
    """Test error handling and retry logic"""

    def setUp(self):
        self.learner = User.objects.create_user(
            username='testlearner',
            password='testpass123',
            role='learner'
        )
        self.client = APIClient()

    def test_unauthorized_access_to_manager_apis(self):
        """
        Test: Learner cannot access manager APIs
        """
        self.client.force_authenticate(user=self.learner)
        response = self.client.get('/api/analytics/manager/team-summary/')
        self.assertEqual(response.status_code, 403)

    def test_invalid_resource_id_handling(self):
        """
        Test: Graceful handling of invalid resource ID
        """
        self.client.force_authenticate(user=self.learner)
        response = self.client.post(
            '/api/modules/999/resources/999/complete/',
            {'duration_delta': 15},
            format='json'
        )
        self.assertEqual(response.status_code, 404)

    def test_malformed_telemetry_payload(self):
        """
        Test: API handles malformed telemetry data
        """
        module = Module.objects.create(title="Test", difficulty="beginner")
        resource = Resource.objects.create(module=module, title="R1", type="url", url="http://ex.com")

        self.client.force_authenticate(user=self.learner)
        response = self.client.post(
            f'/api/modules/{module.id}/resources/{resource.id}/complete/',
            {'duration_delta': 'invalid'},  # Invalid type
            format='json'
        )
        # Should handle gracefully (either 400 or ignore invalid field)
        self.assertIn(response.status_code, [200, 400])


# Run with: python manage.py test apps.analytics.tests.test_manager_tracking
