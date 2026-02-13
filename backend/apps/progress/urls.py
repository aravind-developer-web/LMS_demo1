from django.urls import path
from .views import ProgressUpdateView, ProgressListView

urlpatterns = [
    path('', ProgressListView.as_view(), name='progress_list'),
    path('<int:module_id>/', ProgressUpdateView.as_view(), name='progress_update'),
]
