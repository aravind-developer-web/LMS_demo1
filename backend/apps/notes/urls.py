from django.urls import path
from .views import NoteListCreateView, NoteDetailView, ModuleNoteView

urlpatterns = [
    path('list/', NoteListCreateView.as_view(), name='note_list_create'),
    path('<int:pk>/', NoteDetailView.as_view(), name='note_detail'),
    path('create/', NoteListCreateView.as_view(), name='note_create_alias'),
    path('module/<int:module_id>/', ModuleNoteView.as_view(), name='module_note_detail'),
    path('module/<int:module_id>/save/', ModuleNoteView.as_view(), name='module_note_save'),
]
