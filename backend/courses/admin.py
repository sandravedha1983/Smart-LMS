from django.contrib import admin
from .models import Course, Lesson, Progress, Quiz, QuizQuestion, QuizAttempt, UserProfile, Certificate, PuzzleChallenge, PuzzleProgress

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'created_at')
    search_fields = ('title', 'description')

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'lesson_order', 'created_at')
    list_filter = ('course',)
    search_fields = ('title',)

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'lesson', 'pass_percentage', 'created_at')
    search_fields = ('title',)

@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ('quiz', 'question', 'created_at')
    search_fields = ('question',)
    list_filter = ('quiz',)

@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'quiz', 'score', 'passed', 'created_at')
    list_filter = ('passed', 'quiz')

@admin.register(Progress)
class ProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'completed', 'watched_percentage', 'last_watched_at')
    list_filter = ('completed', 'user')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'approved', 'preferred_language', 'preferred_difficulty', 'points')
    list_filter = ('role', 'approved')
    search_fields = ('user__username', 'user__email')

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'completion_date', 'certificate_code')
    search_fields = ('user__username', 'course__title', 'certificate_code')

@admin.register(PuzzleChallenge)
class PuzzleChallengeAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'points', 'active', 'created_at')
    list_filter = ('category', 'active')
    search_fields = ('title',)

@admin.register(PuzzleProgress)
class PuzzleProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'puzzle', 'completed', 'completed_at', 'points_awarded')
    list_filter = ('completed', 'user')
