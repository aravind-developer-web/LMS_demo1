from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .serializers_and_views import (
    CertificationListCreateView, 
    ManagerNoticeListCreateView, 
    LearnerMessageListCreateView,
    BroadcastViewSet,
    LearnerManagementViewSet
)

router = DefaultRouter()
router.register(r'broadcasts', BroadcastViewSet, basename='broadcast')
router.register(r'learners', LearnerManagementViewSet, basename='learner-mgmt')

urlpatterns = [
    path('', include(router.urls)),
    path('certifications/', CertificationListCreateView.as_view(), name='certifications'),
    path('notices/', ManagerNoticeListCreateView.as_view(), name='notices'),
    path('messages/', LearnerMessageListCreateView.as_view(), name='messages'),
]
