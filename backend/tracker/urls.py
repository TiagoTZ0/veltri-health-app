from django.urls import path
from . import views

urlpatterns = [
    path('daily-stats/', views.get_daily_stats, name='daily_stats'),
    path('log-food/', views.log_food, name='log_food'),
    path('log-water/', views.log_water, name='log_water'),
]
