from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ModuleViewSet, ResourceViewSet, StreamView

router = DefaultRouter()
router.register(r'', ModuleViewSet)
router.register(r'resources', ResourceViewSet)

urlpatterns = [
    path('stream/upload/', StreamView.as_view(), name='stream_upload'),
    path('', include(router.urls)),
]
