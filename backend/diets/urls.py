from django.urls import path
from . import views

urlpatterns = [
    path('scan/', views.scan_food, name='scan_food'),
    path('stats/', views.get_user_stats, name='user_stats'),
]
