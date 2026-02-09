from django.urls import path
from .views import QuizDetailView, QuizSubmitView, QuizListView

urlpatterns = [
    path('', QuizListView.as_view(), name='quiz_list'),
    path('<int:module_id>/', QuizDetailView.as_view(), name='quiz_detail'),
    path('<int:module_id>/submit/', QuizSubmitView.as_view(), name='quiz_submit'),
]
