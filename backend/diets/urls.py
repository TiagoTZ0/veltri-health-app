from django.urls import path
from . import views

urlpatterns = [
    path('recommendations/', views.get_diet_recommendations, name='diet_recommendations'),
    path('search/', views.search_foods, name='search_foods'),
]
