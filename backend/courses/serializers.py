from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Course, Lesson, Progress, Quiz, QuizQuestion, QuizAttempt,
    UserProfile, Certificate, PuzzleChallenge, PuzzleProgress,
    Achievement, UserAchievement
)

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = '__all__'

class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)
    class Meta:
        model = UserAchievement
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = (
            'role',
            'approved',
            'preferred_language',
            'preferred_difficulty',
            'points',
            'learning_streak',
            'total_learning_time',
            'ai_interactions',
            'puzzle_points',
            'puzzle_streak',
            'last_puzzle_solved_date',
        )
        read_only_fields = ('approved', 'points', 'learning_streak', 'total_learning_time', 'ai_interactions', 'puzzle_points', 'puzzle_streak', 'last_puzzle_solved_date')

from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    role = serializers.ChoiceField(choices=[('student', 'Student'), ('professor', 'Professor')], default='student', write_only=True)
    preferred_language = serializers.CharField(default='English', write_only=True)
    preferred_difficulty = serializers.CharField(default='Beginner', write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'confirm_password', 'role', 'preferred_language', 'preferred_difficulty')

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        
        # Validate password against Django's validators (which checks length etc.)
        try:
            validate_password(data.get('password'))
        except serializers.ValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})

        return data

    def create(self, validated_data):
        role = validated_data.pop('role', 'student')
        preferred_language = validated_data.pop('preferred_language', 'English')
        preferred_difficulty = validated_data.pop('preferred_difficulty', 'Beginner')
        validated_data.pop('confirm_password', None) # Remove it before passing to create_user

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        profile = getattr(user, 'profile', None)
        if profile is None:
            profile = UserProfile.objects.create(user=user)
        profile.role = role
        profile.preferred_language = preferred_language
        profile.preferred_difficulty = preferred_difficulty
        profile.approved = True if role == 'student' else False
        profile.save()
        return user

class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ('id', 'question', 'options', 'correct_answer', 'explanation')

class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ('id', 'quiz', 'score', 'total_questions', 'passed', 'created_at')
        read_only_fields = ('user',)

class LessonSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    quiz_questions = serializers.SerializerMethodField()
    quiz_id = serializers.SerializerMethodField()
    best_quiz_score = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = '__all__'

    def get_quiz_questions(self, obj):
        if hasattr(obj, 'quiz'):
            return QuizQuestionSerializer(obj.quiz.questions.all(), many=True).data
        return []

    def get_quiz_id(self, obj):
        if hasattr(obj, 'quiz'):
            return obj.quiz.id
        return None

    def get_best_quiz_score(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated and hasattr(obj, 'quiz'):
            best_attempt = obj.quiz.attempts.filter(user=request.user).order_by('-score').first()
            if best_attempt:
                return {'score': best_attempt.score, 'total_questions': best_attempt.total_questions, 'passed': best_attempt.passed}
        return None

    def get_user_progress(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            progress = obj.user_progress.filter(user=request.user).first()
            if progress:
                return {
                    'completed': progress.completed,
                    'watched_percentage': float(progress.watched_percentage),
                }
        return {'completed': False, 'watched_percentage': 0.0}

class CourseSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    owner = serializers.CharField(source='created_by.username', read_only=True)
    owner_id = serializers.IntegerField(source='created_by.id', read_only=True)

    class Meta:
        model = Course
        fields = ('id', 'title', 'description', 'thumbnail', 'created_at', 'lessons', 'completion_percentage', 'owner', 'owner_id')

    def get_lessons(self, obj):
        request = self.context.get('request')
        lessons = obj.lessons.prefetch_related('quiz__questions', 'user_progress').all()
        return LessonSerializer(lessons, many=True, context={'request': request}).data

    def get_completion_percentage(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            lessons = obj.lessons.all()
            if not lessons.exists():
                return 0.0
            completed_count = Progress.objects.filter(
                user=request.user,
                lesson__in=lessons,
                completed=True
            ).count()
            return round((completed_count / lessons.count()) * 100, 2)
        return 0.0

class ProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Progress
        fields = '__all__'
        read_only_fields = ('user',)

    def create(self, validated_data):
        user = self.context['request'].user
        lesson = validated_data['lesson']
        
        existing_progress = Progress.objects.filter(user=user, lesson=lesson).first()
        
        watched_percentage = validated_data.get('watched_percentage', 0.0)
        completed = validated_data.get('completed', False)
        
        if existing_progress:
            watched_percentage = max(existing_progress.watched_percentage, watched_percentage)
            completed = existing_progress.completed or completed
            
        progress, created = Progress.objects.update_or_create(
            user=user,
            lesson=lesson,
            defaults={
                'watched_percentage': watched_percentage,
                'completed': completed
            }
        )
        return progress

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('preferred_language', 'preferred_difficulty')

class ProfessorRequestSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ('id', 'username', 'email', 'preferred_language', 'preferred_difficulty')

class CertificateSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Certificate
        fields = ('id', 'username', 'course_title', 'completion_date', 'certificate_code')

class PuzzleChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PuzzleChallenge
        fields = ('id', 'title', 'prompt', 'category', 'points', 'active')

class PuzzleProgressSerializer(serializers.ModelSerializer):
    puzzle_title = serializers.CharField(source='puzzle.title', read_only=True)

    class Meta:
        model = PuzzleProgress
        fields = ('id', 'puzzle', 'puzzle_title', 'completed', 'completed_at', 'points_awarded', 'solve_time_seconds', 'hints_used', 'attempts_count')
