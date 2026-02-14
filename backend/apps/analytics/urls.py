from django.urls import path
from .views import ManagerLearnerProgressView, ManagerLearnerDetailsView, VideoProgressUpdateView, SessionPingView

urlpatterns = [
    path('manager/learner-progress/', ManagerLearnerProgressView.as_view(), name='manager_learner_progress'),
    path('manager/<int:user_id>/learner_details/', ManagerLearnerDetailsView.as_view(), name='manager_learner_details'),
    path('progress/video-update/', VideoProgressUpdateView.as_view(), name='video_progress_update'),
    path('session/ping/', SessionPingView.as_view(), name='session_ping'),
]
