from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'learner', views.AssignmentViewSet, basename='learner-assignments')
router.register(r'manager', views.ManagerAssignmentViewSet, basename='manager-assignments')

urlpatterns = [
    # New ViewSet routes
    path('', include(router.urls)),
    
    # Legacy routes for backward compatibility
    path('list/', views.AssignmentListCreateView.as_view(), name='assignment_list_create'),
    path('<int:pk>/', views.AssignmentDetailView.as_view(), name='assignment_detail'),
    path('modules/<int:module_id>/submit/', views.SubmissionCreateView.as_view(), name='submission_create'),
    path('modules/<int:module_id>/submissions/', views.SubmissionListView.as_view(), name='submission_list'),
]
