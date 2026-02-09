from django.urls import path
from .views import ModuleListCreateView, ModuleDetailView, ModuleProgressView, UpdateResourceProgressView, UpdateVideoProgressView, ResourceCreateView, AssignModuleView

urlpatterns = [
    path('', ModuleListCreateView.as_view(), name='module_list_create'),
    path('<int:pk>/', ModuleDetailView.as_view(), name='module_detail'),
    path('<int:pk>/progress/', ModuleProgressView.as_view(), name='module_progress'),
    path('<int:module_id>/resources/<int:resource_id>/complete/', UpdateResourceProgressView.as_view(), name='resource_complete'),
    path('<int:module_id>/resources/<int:resource_id>/update-progress/', UpdateVideoProgressView.as_view(), name='video_progress'),
    path('<int:module_id>/resources/', ResourceCreateView.as_view(), name='resource_create'),
    path('<int:module_id>/assign/', AssignModuleView.as_view(), name='module_assign'),
]
