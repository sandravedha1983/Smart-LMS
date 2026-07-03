from django.urls import path
from .views import ExplainConceptView, UserDoubtHistoryView

urlpatterns = [
    path('explain/', ExplainConceptView.as_view(), name='ai-explain'),
    path('history/', UserDoubtHistoryView.as_view(), name='user-doubt-history'),
]
