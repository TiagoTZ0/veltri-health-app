from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.analyze_image, name='analyze_image'),
]
