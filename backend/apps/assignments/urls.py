from django.urls import path
from .views import AssignmentListCreateView, AssignmentDetailView, AssignmentSubmitView

urlpatterns = [
    path('', AssignmentListCreateView.as_view(), name='assignment_list_create'),
    path('<int:pk>/', AssignmentDetailView.as_view(), name='assignment_detail'),
    path('modules/<int:module_id>/submit/', AssignmentSubmitView.as_view(), name='assignment_submit'),
    path('modules/<int:module_id>/submissions/', AssignmentSubmitView.as_view(), name='assignment_submissions'),
]
