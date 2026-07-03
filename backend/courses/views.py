from datetime import date
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.utils.crypto import get_random_string
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from .models import Course, Lesson, Progress, Quiz, QuizQuestion, QuizAttempt, UserProfile, Certificate, PuzzleChallenge, PuzzleProgress, Achievement, UserAchievement
from .serializers import (
    CourseSerializer, LessonSerializer, ProgressSerializer, UserSerializer,
    QuizQuestionSerializer, QuizAttemptSerializer, ProfileUpdateSerializer,
    CertificateSerializer, PuzzleChallengeSerializer, PuzzleProgressSerializer,
    UserAchievementSerializer, ProfessorRequestSerializer
)

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and getattr(request.user, 'is_staff', False)

class IsProfessorOrAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        profile = getattr(request.user, 'profile', None)
        return bool(request.user.is_authenticated and profile and profile.approved and profile.role in ['professor', 'admin'])

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class ProfileDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, 'profile', None)
        if profile is None:
            profile = UserProfile.objects.create(user=request.user)
        serializer = ProfileUpdateSerializer(profile)
        return Response({
            'username': request.user.username,
            'email': request.user.email,
            'role': profile.role,
            'approved': profile.approved,
            'preferred_language': profile.preferred_language,
            'preferred_difficulty': profile.preferred_difficulty,
            'points': profile.points,
            'learning_streak': profile.learning_streak,
            'total_learning_time': profile.total_learning_time,
            'ai_interactions': profile.ai_interactions,
            'puzzle_points': profile.puzzle_points,
        })

    def put(self, request):
        profile = getattr(request.user, 'profile', None)
        if profile is None:
            profile = UserProfile.objects.create(user=request.user)
        serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class PendingProfessorsView(generics.ListAPIView):
    queryset = UserProfile.objects.filter(role='professor', approved=False)
    serializer_class = ProfessorRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

class ApproveProfessorView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    def post(self, request, profile_id):
        profile = UserProfile.objects.filter(id=profile_id, role='professor').first()
        if not profile:
            return Response({'detail': 'Professor request not found.'}, status=status.HTTP_404_NOT_FOUND)
        profile.approved = True
        profile.save()
        return Response({'detail': f'{profile.user.username} approved as professor.'})

class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all().prefetch_related('lessons')
    serializer_class = CourseSerializer
    permission_classes = [IsProfessorOrAdminOrReadOnly]

    def get_queryset(self):
        qs = self.queryset
        if self.request.user.is_authenticated and self.request.query_params.get('owned') == 'true':
            qs = qs.filter(created_by=self.request.user)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all().prefetch_related('lessons')
    serializer_class = CourseSerializer
    permission_classes = [IsProfessorOrAdminOrReadOnly]

class LessonListCreateView(generics.ListCreateAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsProfessorOrAdminOrReadOnly]

    def get_queryset(self):
        qs = Lesson.objects.select_related('course').prefetch_related('quiz__questions', 'user_progress')
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save()

class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.select_related('course').prefetch_related('quiz__questions', 'user_progress')
    serializer_class = LessonSerializer
    permission_classes = [IsProfessorOrAdminOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class LessonQuizView(generics.ListCreateAPIView):
    serializer_class = QuizQuestionSerializer
    permission_classes = [IsProfessorOrAdminOrReadOnly]

    def get_queryset(self):
        lesson_id = self.kwargs.get('lesson_id')
        lesson = Lesson.objects.filter(id=lesson_id).first()
        if lesson and hasattr(lesson, 'quiz'):
            return QuizQuestion.objects.filter(quiz=lesson.quiz)
        return QuizQuestion.objects.none()

    def perform_create(self, serializer):
        lesson_id = self.kwargs.get('lesson_id')
        lesson = Lesson.objects.filter(id=lesson_id).first()
        if not lesson:
            return
        # Auto-create Quiz wrapper if it doesn't exist yet
        quiz, _ = Quiz.objects.get_or_create(
            lesson=lesson,
            defaults={'title': f"{lesson.title} Quiz"}
        )
        serializer.save(quiz=quiz)

class QuizQuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer
    permission_classes = [IsProfessorOrAdminOrReadOnly]

def check_achievements(user, profile):
    unlocked = False
    achievements = Achievement.objects.filter(required_xp__lte=profile.points)
    for ach in achievements:
        _, created = UserAchievement.objects.get_or_create(user=user, achievement=ach)
        if created:
            unlocked = True
    return unlocked

class QuizAttemptCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, quiz_id):
        from .models import Quiz, QuizAttempt
        quiz = Quiz.objects.filter(id=quiz_id).first()
        if not quiz:
            return Response({'detail': 'Quiz not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        score = request.data.get('score', 0)
        total_questions = request.data.get('total_questions', 0)
        
        # Calculate pass/fail
        percentage = (score / total_questions * 100) if total_questions > 0 else 0
        passed = percentage >= quiz.pass_percentage
        
        attempt = QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            score=score,
            total_questions=total_questions,
            passed=passed
        )
        
        # Optionally give points if passed and first time passing
        profile = getattr(request.user, 'profile', None)
        if profile and passed:
            # Check if previously passed
            previous_passes = QuizAttempt.objects.filter(user=request.user, quiz=quiz, passed=True).exclude(id=attempt.id).exists()
            if not previous_passes:
                profile.points += 20 # Reward for passing a quiz
                profile.save()
                check_achievements(request.user, profile)

        from .serializers import QuizAttemptSerializer
        return Response(QuizAttemptSerializer(attempt).data, status=status.HTTP_201_CREATED)


class ProgressListCreateView(generics.ListCreateAPIView):
    serializer_class = ProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Progress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        progress = serializer.save()
        profile = getattr(self.request.user, 'profile', None)
        if profile:
            if progress.completed:
                profile.points += 15
            profile.total_learning_time += 5
            today = date.today()
            if profile.last_active_date == today - timezone.timedelta(days=1):
                profile.learning_streak += 1
            elif profile.last_active_date != today:
                profile.learning_streak = 1
            profile.last_active_date = today
            profile.save()
            check_achievements(self.request.user, profile)
        return progress

class CertificateDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        course = Course.objects.filter(id=course_id).first()
        if not course:
            return Response({'detail': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

        lessons = course.lessons.all()
        completed = Progress.objects.filter(user=request.user, lesson__in=lessons, completed=True).count()
        if lessons.count() == 0 or completed != lessons.count():
            return Response({'detail': 'Course is not yet complete.'}, status=status.HTTP_400_BAD_REQUEST)

        certificate, created = Certificate.objects.get_or_create(
            user=request.user,
            course=course,
            defaults={'certificate_code': get_random_string(12).upper()}
        )
        serializer = CertificateSerializer(certificate)
        return Response(serializer.data)

class PuzzleListView(generics.ListAPIView):
    queryset = PuzzleChallenge.objects.filter(active=True)
    serializer_class = PuzzleChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        qs = self.queryset.all()
        if self.request.query_params.get('daily') == 'true':
            puzzles = list(qs)
            if puzzles:
                from random import choice
                return PuzzleChallenge.objects.filter(id=choice(puzzles).id)
        return qs

def check_puzzle_achievements(user, profile):
    unlocked_names = []
    
    # 1. Puzzle Beginner
    beginner_ach, _ = Achievement.objects.get_or_create(
        title="Puzzle Beginner", 
        defaults={"description": "Solved your first brain boost puzzle!", "required_xp": 0}
    )
    # Check if user has solved any puzzle
    completed_puzzles_count = PuzzleProgress.objects.filter(user=user, completed=True).count()
    if completed_puzzles_count >= 1:
        _, created = UserAchievement.objects.get_or_create(user=user, achievement=beginner_ach)
        if created:
            unlocked_names.append(beginner_ach.title)

    # 2. Logic Master
    logic_ach, _ = Achievement.objects.get_or_create(
        title="Logic Master", 
        defaults={"description": "Solved 3 logic puzzles in the Brain Boost Zone.", "required_xp": 0}
    )
    logic_solved = PuzzleProgress.objects.filter(
        user=user, 
        completed=True, 
        puzzle__category='logic'
    ).count()
    if logic_solved >= 3:
        _, created = UserAchievement.objects.get_or_create(user=user, achievement=logic_ach)
        if created:
            unlocked_names.append(logic_ach.title)

    # 3. Queens Champion
    queens_ach, _ = Achievement.objects.get_or_create(
        title="Queens Champion", 
        defaults={"description": "Successfully solved the Queens region puzzle.", "required_xp": 0}
    )
    queens_solved = PuzzleProgress.objects.filter(
        user=user, 
        completed=True, 
        puzzle__title__icontains='Queens'
    ).exists()
    if queens_solved:
        _, created = UserAchievement.objects.get_or_create(user=user, achievement=queens_ach)
        if created:
            unlocked_names.append(queens_ach.title)

    # 4. Sudoku Expert
    sudoku_ach, _ = Achievement.objects.get_or_create(
        title="Sudoku Expert", 
        defaults={"description": "Successfully solved the 6x6 Sudoku puzzle.", "required_xp": 0}
    )
    sudoku_solved = PuzzleProgress.objects.filter(
        user=user, 
        completed=True, 
        puzzle__title__icontains='Sudoku'
    ).exists()
    if sudoku_solved:
        _, created = UserAchievement.objects.get_or_create(user=user, achievement=sudoku_ach)
        if created:
            unlocked_names.append(sudoku_ach.title)

    # 5. Pinpoint Detective
    pinpoint_ach, _ = Achievement.objects.get_or_create(
        title="Pinpoint Detective", 
        defaults={"description": "Successfully guessed the category in the Pinpoint game.", "required_xp": 0}
    )
    pinpoint_solved = PuzzleProgress.objects.filter(
        user=user, 
        completed=True, 
        puzzle__title__icontains='Pinpoint'
    ).exists()
    if pinpoint_solved:
        _, created = UserAchievement.objects.get_or_create(user=user, achievement=pinpoint_ach)
        if created:
            unlocked_names.append(pinpoint_ach.title)

    # 6. 7-Day Brain Streak
    streak_ach, _ = Achievement.objects.get_or_create(
        title="7-Day Brain Streak", 
        defaults={"description": "Maintained a 7-day Brain Boost streak.", "required_xp": 0}
    )
    if profile.puzzle_streak >= 7:
        _, created = UserAchievement.objects.get_or_create(user=user, achievement=streak_ach)
        if created:
            unlocked_names.append(streak_ach.title)
            
    return unlocked_names

class PuzzleSolveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, puzzle_id):
        from datetime import date, timedelta
        from ai_features.services import ai_service

        puzzle = PuzzleChallenge.objects.filter(id=puzzle_id, active=True).first()
        if not puzzle:
            return Response({'detail': 'Puzzle not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Retrieve performance stats from payload
        solve_time = int(request.data.get('solve_time_seconds', 0))
        hints_used = int(request.data.get('hints_used', 0))
        attempts = int(request.data.get('attempts_count', 1))

        # Check solution correctness:
        # 1. Sudoku/Tango/Queens can be evaluated client-side and verified directly.
        # 2. Pinpoint category guess checks text input matching the database key.
        answer = request.data.get('answer', '').strip().lower()
        is_correct_from_client = request.data.get('correct') in [True, 'true', 'True']
        correct = is_correct_from_client or (answer == puzzle.answer.strip().lower())

        progress, created = PuzzleProgress.objects.get_or_create(user=request.user, puzzle=puzzle)
        
        # Always update the performance metrics of the attempt
        progress.solve_time_seconds = solve_time
        progress.hints_used = hints_used
        progress.attempts_count = attempts
        
        unlocked_achievements = []
        ai_feedback = ""

        if correct:
            is_new_solve = not progress.completed
            progress.completed = True
            progress.points_awarded = puzzle.points
            progress.save()

            profile = getattr(request.user, 'profile', None)
            if profile:
                # 1. Update points only on new solve
                if is_new_solve:
                    profile.points += puzzle.points
                    profile.puzzle_points += puzzle.points

                # 2. Calculate daily streak
                today = date.today()
                if not profile.last_puzzle_solved_date:
                    profile.puzzle_streak = 1
                elif profile.last_puzzle_solved_date == today:
                    # Already solved a puzzle today, streak holds
                    pass
                elif profile.last_puzzle_solved_date == today - timedelta(days=1):
                    # Solved yesterday, increment streak
                    profile.puzzle_streak += 1
                else:
                    # Solved longer ago, reset to 1
                    profile.puzzle_streak = 1
                
                profile.last_puzzle_solved_date = today
                profile.save()

                # 3. Check puzzle-specific achievements
                unlocked_achievements = check_puzzle_achievements(request.user, profile)
                
            # 4. Generate Dolphy AI Cognitive Feedback
            ai_feedback = ai_service.generate_puzzle_feedback(
                puzzle_title=puzzle.title,
                category=puzzle.category,
                solve_time=solve_time,
                hints_used=hints_used
            )
        else:
            progress.save()

        return Response({
            'correct': correct,
            'points_awarded': progress.points_awarded if correct else 0,
            'explanation': 'Great job!' if correct else 'Try again with a fresh strategy.',
            'puzzle_progress_id': progress.id,
            'ai_feedback': ai_feedback,
            'unlocked_achievements': unlocked_achievements,
            'puzzle_streak': request.user.profile.puzzle_streak if hasattr(request.user, 'profile') else 0
        })

class AdminAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    def get(self, request):
        total_users = UserProfile.objects.count()
        total_courses = Course.objects.count()
        total_lessons = Lesson.objects.count()
        total_quizzes = Quiz.objects.count()
        total_ai_interactions = sum(p.ai_interactions for p in UserProfile.objects.all())
        
        return Response({
            'total_users': total_users,
            'total_courses': total_courses,
            'total_lessons': total_lessons,
            'total_quizzes': total_quizzes,
            'total_ai_interactions': total_ai_interactions,
        })

class UserAchievementListView(generics.ListAPIView):
    serializer_class = UserAchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserAchievement.objects.filter(user=self.request.user).select_related('achievement')

class LessonRetryTranscriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        lesson = generics.get_object_or_404(Lesson, pk=pk)
        
        # Check permission: Only course creator or admin can trigger retry
        profile = getattr(request.user, 'profile', None)
        is_owner = lesson.course.created_by == request.user
        is_admin = request.user.is_staff or (profile and profile.role == 'admin')
        
        if not (is_owner or is_admin):
            return Response({'detail': 'You do not have permission to retry transcription.'}, status=status.HTTP_403_FORBIDDEN)
            
        # Reset and trigger transcription
        from ai_features.transcription_service import trigger_transcription
        lesson.transcription_status = 'PENDING'
        lesson.transcription_error = None
        lesson.save(update_fields=['transcription_status', 'transcription_error'])
        
        # Trigger background transcription task
        trigger_transcription(lesson.id)
        
        serializer = LessonSerializer(lesson, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
