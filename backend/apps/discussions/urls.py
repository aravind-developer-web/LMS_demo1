from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DiscussionViewSet, ReplyViewSet

router = DefaultRouter()
router.register(r'discussions', DiscussionViewSet, basename='discussion')
router.register(r'replies', ReplyViewSet, basename='reply')

urlpatterns = [
    path('', include(router.urls)),
]
