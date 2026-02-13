from django.urls import path
from .views import AssignmentListCreateView, AssignmentDetailView

urlpatterns = [
    path('', AssignmentListCreateView.as_view(), name='assignment_list_create'),
    path('<int:pk>/', AssignmentDetailView.as_view(), name='assignment_detail'),
]
