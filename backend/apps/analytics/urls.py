from django.urls import path
from . import views

urlpatterns = [
    path('team-stats/', views.TeamStatsView.as_view(), name='team_stats'),
    path('stuck-learners/', views.StuckLearnersView.as_view(), name='stuck_learners'),
    path('module-stats/', views.ModuleStatsView.as_view(), name='module_stats'),
    path('team-velocity/', views.TeamVelocityView.as_view(), name='team_velocity'),
    path('recent-activity/', views.RecentActivityView.as_view(), name='recent_activity'),
]
