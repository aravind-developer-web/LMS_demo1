from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'api', views.NoteViewSet, basename='notes-api')
router.register(r'manager', views.ManagerNoteAnalyticsViewSet, basename='manager-notes')

urlpatterns = [
    # New ViewSet routes
    path('', include(router.urls)),
    
    # Legacy routes for backward compatibility
    path('list/', views.NoteListView.as_view(), name='note_list'),
    path('module/<int:module_id>/', views.NoteRetrieveUpdateView.as_view(), name='note_detail'),
]
