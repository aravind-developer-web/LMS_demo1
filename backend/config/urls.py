from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authapp.urls')),
    path('api/modules/', include('apps.modules.urls')),
    path('api/quiz/', include('apps.quiz.urls')),
    path('api/assignments/', include('apps.assignments.urls')),
    path('api/notes/', include('apps.notes.urls')),
    # path('api/progress/', include('apps.progress.urls')),  # Removed: Progress now in modules
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/management/', include('apps.management.urls')),
    path('api/discussions/', include('apps.discussions.urls')),
    path('api/ai/', include('apps.ai_assistant.urls')),
]
