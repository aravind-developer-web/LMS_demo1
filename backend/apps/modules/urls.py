from django.urls import path
from .views import ModuleListCreateView, ModuleDetailView, ResourceCreateView

urlpatterns = [
    path('', ModuleListCreateView.as_view(), name='module_list'),
    path('<int:pk>/', ModuleDetailView.as_view(), name='module_detail'),
    path('<int:module_id>/resources/', ResourceCreateView.as_view(), name='resource_create'),
]
