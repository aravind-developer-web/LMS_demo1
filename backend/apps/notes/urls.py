from django.urls import path
from .views import NoteListCreateView, NoteDetailView

urlpatterns = [
    path('list/', NoteListCreateView.as_view(), name='note_list_create'),
    path('<int:pk>/', NoteDetailView.as_view(), name='note_detail'),
    path('create/', NoteListCreateView.as_view(), name='note_create_alias'), # Support both paths
]
