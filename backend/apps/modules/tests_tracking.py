import pytest
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.modules.models import Module, Resource, ModuleProgress, ResourceProgress
from apps.analytics.models import LearningSession
from apps.assignments.models import Assignment
from rest_framework.test import APIClient

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def learner(db):
    return User.objects.create_user(username='tester', password='pass', role='learner')

@pytest.fixture
def module(db):
    return Module.objects.create(title="Track Test", description="Desc", duration=10)

@pytest.fixture
def resource(db, module):
    return Resource.objects.create(module=module, title="Vid", type="video", url="http://y.t/v")

@pytest.mark.django_db
class TestTelemetryTracking:
    
    def test_video_focus_pulse_increments_both_metrics(self, api_client, learner, module, resource):
        """
        Verify that a 15s pulse updates internal watch time AND global sessions.
        """
        api_client.force_authenticate(user=learner)
        url = reverse('resource_complete', kwargs={'module_id': module.id, 'resource_id': resource.id})
        
        # Pulse 1
        response = api_client.post(url, {'duration_delta': 15}, format='json')
        assert response.status_code == 200
        
        res_progress = ResourceProgress.objects.get(user=learner, resource=resource)
        session = LearningSession.objects.filter(user=learner).first()
        
        assert res_progress.watch_time_seconds == 15
        assert session.focus_duration_seconds == 15
        
        # Pulse 2
        api_client.post(url, {'duration_delta': 15}, format='json')
        res_progress.refresh_from_db()
        session.refresh_from_db()
        
        assert res_progress.watch_time_seconds == 30
        assert session.focus_duration_seconds == 30

    def test_atomic_auto_enrollment(self, api_client, learner, module):
        """
        Verify that submitting an assignment for an unassigned module auto-enrolls safely once.
        """
        api_client.force_authenticate(user=learner)
        url = reverse('submission_create', kwargs={'module_id': module.id})
        payload = {'content': 'My Solution'}
        
        # Concurrent enrollment simulation (logic level)
        response = api_client.post(url, payload, format='json')
        assert response.status_code == 201
        
        assert Assignment.objects.filter(user=learner, module=module).count() == 1
        
        # Second submission should not create a second assignment record
        api_client.post(url, payload, format='json')
        assert Assignment.objects.filter(user=learner, module=module).count() == 1

    def test_module_completion_requirements(self, api_client, learner, module, resource):
        """
        Verify module only completes when ALL requirements (resource + manual flag) are met.
        """
        api_client.force_authenticate(user=learner)
        url = reverse('resource_complete', kwargs={'module_id': module.id, 'resource_id': resource.id})
        
        # Engage resource without completing
        api_client.post(url, {'duration_delta': 10}, format='json')
        mod_progress = ModuleProgress.objects.get(user=learner, module=module)
        assert mod_progress.status == 'in_progress'
        
        # Signal completion
        api_client.post(url, {'completed': True}, format='json')
        mod_progress.refresh_from_db()
        assert mod_progress.status == 'completed'
        assert mod_progress.completed_at is not None

@pytest.mark.django_db
def test_idempotent_pulse_with_absolute_time(api_client, learner, module, resource):
    """
    Verify that providing absolute watch_time rewrites instead of increments (for resyncing).
    """
    api_client.force_authenticate(user=learner)
    url = reverse('resource_complete', kwargs={'module_id': module.id, 'resource_id': resource.id})
    
    # Send absolute sync
    api_client.post(url, {'watch_time': 100}, format='json')
    res_progress = ResourceProgress.objects.get(user=learner, resource=resource)
    assert res_progress.watch_time_seconds == 100
    
    # Repeat - should remain 100, not 200
    api_client.post(url, {'watch_time': 100}, format='json')
    res_progress.refresh_from_db()
    assert res_progress.watch_time_seconds == 100
