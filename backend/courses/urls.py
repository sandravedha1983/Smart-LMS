from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, ProfileDetailView, PendingProfessorsView, ApproveProfessorView,
    CourseListCreateView, CourseDetailView, LessonListCreateView, LessonDetailView,
    LessonQuizView, QuizQuestionDetailView, QuizAttemptCreateView, ProgressListCreateView, CertificateDetailView,
    PuzzleListView, PuzzleSolveView, AdminAnalyticsView, UserAchievementListView, LessonRetryTranscriptionView
)

urlpatterns = [
    # Auth Endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', ProfileDetailView.as_view(), name='profile'),
    path('auth/professor-requests/', PendingProfessorsView.as_view(), name='pending-professors'),
    path('auth/professor-requests/<int:profile_id>/approve/', ApproveProfessorView.as_view(), name='approve-professor'),

    # Course Endpoints
    path('courses/', CourseListCreateView.as_view(), name='course-list'),
    path('courses/<int:pk>/', CourseDetailView.as_view(), name='course-detail'),

    # Lesson Endpoints
    path('lessons/', LessonListCreateView.as_view(), name='lesson-list'),
    path('lessons/<int:pk>/', LessonDetailView.as_view(), name='lesson-detail'),
    path('lessons/<int:pk>/retry-transcription/', LessonRetryTranscriptionView.as_view(), name='lesson-retry-transcription'),
    path('lessons/<int:lesson_id>/quiz/', LessonQuizView.as_view(), name='lesson-quiz'),
    path('quizzes/<int:quiz_id>/attempt/', QuizAttemptCreateView.as_view(), name='quiz-attempt'),
    path('quizzes/questions/<int:pk>/', QuizQuestionDetailView.as_view(), name='quiz-question-detail'),

    # Progress Endpoints
    path('progress/', ProgressListCreateView.as_view(), name='progress-list'),

    # Certificate & Gamification Endpoints
    path('certificates/<int:course_id>/', CertificateDetailView.as_view(), name='certificate-detail'),
    path('puzzles/', PuzzleListView.as_view(), name='puzzle-list'),
    path('puzzles/<int:puzzle_id>/solve/', PuzzleSolveView.as_view(), name='puzzle-solve'),
    path('achievements/', UserAchievementListView.as_view(), name='achievement-list'),
    path('admin/analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
]
