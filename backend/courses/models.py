from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

USER_ROLE_CHOICES = [
    ('student', 'Student'),
    ('professor', 'Professor'),
    ('admin', 'Admin'),
]

class Course(models.Model):
    """
    Model representing a learning course.
    """
    title = models.CharField(max_length=255, null=False, blank=False)
    description = models.TextField()
    category = models.CharField(max_length=100, default='General')
    difficulty = models.CharField(max_length=50, choices=[('Beginner', 'Beginner'), ('Intermediate', 'Intermediate'), ('Advanced', 'Advanced')], default='Beginner')
    language = models.CharField(max_length=50, default='English')
    thumbnail = models.ImageField(upload_to='courses/thumbnails/', null=True, blank=True)
    banner = models.ImageField(upload_to='courses/banners/', null=True, blank=True)
    duration = models.CharField(max_length=50, blank=True, help_text="e.g., 10 Hours")
    prerequisites = models.TextField(blank=True)
    learning_outcomes = models.TextField(blank=True)
    tags = models.CharField(max_length=255, blank=True, help_text="Comma separated tags")
    status = models.CharField(max_length=20, choices=[('Draft', 'Draft'), ('Published', 'Published'), ('Archived', 'Archived')], default='Draft')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_courses')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class Lesson(models.Model):
    """
    Model representing a lesson within a course.
    """
    course = models.ForeignKey(Course, related_name='lessons', on_delete=models.CASCADE)
    title = models.CharField(max_length=255, null=False, blank=False)
    video_url = models.URLField(max_length=500, blank=True, null=True)
    video_file = models.FileField(upload_to='lessons/videos/', null=True, blank=True)
    transcript = models.TextField(blank=True, null=True)
    lesson_order = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)

    transcription_status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('PROCESSING', 'Processing'),
            ('COMPLETED', 'Completed'),
            ('FAILED', 'Failed'),
        ],
        default='COMPLETED'
    )
    transcribed_at = models.DateTimeField(null=True, blank=True)
    transcription_error = models.TextField(null=True, blank=True)
    
    # AI Generated Fields
    ai_summary = models.TextField(blank=True, null=True)
    ai_key_concepts = models.JSONField(default=list, blank=True, null=True)
    ai_flashcards = models.JSONField(default=list, blank=True, null=True)
    ai_keywords = models.JSONField(default=list, blank=True, null=True)

    class Meta:
        ordering = ['lesson_order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    def save(self, *args, **kwargs):
        is_new_video = False
        if not self.pk:
            if self.video_file:
                is_new_video = True
                self.transcription_status = 'PENDING'
                self.transcription_error = None
        else:
            try:
                orig = Lesson.objects.get(pk=self.pk)
                if self.video_file and orig.video_file != self.video_file:
                    is_new_video = True
                    self.transcription_status = 'PENDING'
                    self.transcript = ""
                    self.transcription_error = None
                elif not self.video_file and orig.video_file:
                    # Video file removed
                    self.transcript = ""
                    self.transcription_status = 'COMPLETED'
                    self.transcription_error = None
            except Lesson.DoesNotExist:
                if self.video_file:
                    is_new_video = True
                    self.transcription_status = 'PENDING'
                    self.transcription_error = None

        # Enforce status logic rules
        if not self.transcript or len(self.transcript.strip()) == 0:
            if self.transcription_status not in ['PENDING', 'PROCESSING']:
                self.transcription_status = 'FAILED'
                if not self.transcription_error:
                    self.transcription_error = "Transcript is empty."
        else:
            # If transcript has content and status is not pending/processing, it's completed
            if self.transcription_status not in ['PENDING', 'PROCESSING']:
                self.transcription_status = 'COMPLETED'

        from django.db import transaction
        super().save(*args, **kwargs)

        if is_new_video:
            from ai_features.transcription_service import trigger_transcription
            transaction.on_commit(lambda: trigger_transcription(self.id))

class LessonResource(models.Model):
    RESOURCE_TYPES = [
        ('pdf', 'PDF'), ('ppt', 'PowerPoint'), ('doc', 'Word Document'),
        ('image', 'Image'), ('zip', 'ZIP File'), ('other', 'Other')
    ]
    lesson = models.ForeignKey(Lesson, related_name='resources', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='lessons/resources/')
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES, default='other')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class LiveClass(models.Model):
    course = models.ForeignKey(Course, related_name='live_classes', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    meeting_link = models.URLField(max_length=500)
    platform = models.CharField(max_length=50, choices=[('Zoom', 'Zoom'), ('Google Meet', 'Google Meet'), ('Microsoft Teams', 'Microsoft Teams'), ('Other', 'Other')], default='Zoom')
    date = models.DateField()
    time = models.TimeField()
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    max_students = models.PositiveIntegerField(default=100)
    status = models.CharField(max_length=20, choices=[('Scheduled', 'Scheduled'), ('Ongoing', 'Ongoing'), ('Completed', 'Completed'), ('Cancelled', 'Cancelled')], default='Scheduled')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.date}"

class Assignment(models.Model):
    course = models.ForeignKey(Course, related_name='assignments', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    deadline = models.DateTimeField()
    max_marks = models.PositiveIntegerField(default=100)
    late_submission_rules = models.TextField(blank=True)
    auto_close = models.BooleanField(default=False)
    question_paper = models.FileField(upload_to='assignments/questions/', null=True, blank=True)
    dataset = models.FileField(upload_to='assignments/datasets/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(Assignment, related_name='submissions', on_delete=models.CASCADE)
    student = models.ForeignKey(User, related_name='assignment_submissions', on_delete=models.CASCADE)
    submitted_at = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to='assignments/submissions/')
    score = models.PositiveIntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)

    class Meta:
        unique_together = ('assignment', 'student')

class Quiz(models.Model):
    lesson = models.OneToOneField(Lesson, related_name='quiz', on_delete=models.CASCADE)
    title = models.CharField(max_length=255, default="Practice Quiz")
    pass_percentage = models.PositiveIntegerField(default=80)
    time_limit = models.PositiveIntegerField(default=0, help_text="Time limit in minutes, 0 means unlimited")
    negative_marking = models.BooleanField(default=False)
    shuffle_questions = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Quiz for {self.lesson.title}"

class QuizQuestion(models.Model):
    QUESTION_TYPES = [
        ('MCQ', 'Multiple Choice'),
        ('MA', 'Multiple Answer'),
        ('TF', 'True/False'),
        ('FIB', 'Fill in Blank'),
        ('SA', 'Short Answer'),
        ('CODE', 'Coding Question'),
        ('IMG', 'Image Question'),
    ]
    quiz = models.ForeignKey(Quiz, related_name='questions', on_delete=models.CASCADE)
    question = models.CharField(max_length=512)
    question_type = models.CharField(max_length=10, choices=QUESTION_TYPES, default='MCQ')
    options = models.JSONField(default=list)
    correct_answer = models.CharField(max_length=255)
    explanation = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.quiz.title} - {self.question[:50]}"

class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveIntegerField(default=0)
    passed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.quiz.title} - {'Passed' if self.passed else 'Failed'}"

class Progress(models.Model):
    """
    Model to track user progress in each lesson.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='user_progress')
    completed = models.BooleanField(default=False)
    watched_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    last_watched_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Progress"
        unique_together = ('user', 'lesson')

    def __str__(self):
        return f"{self.user.username} - {self.lesson.title}"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=USER_ROLE_CHOICES, default='student')
    approved = models.BooleanField(default=False)
    preferred_language = models.CharField(max_length=30, default='English')
    preferred_difficulty = models.CharField(max_length=20, default='Beginner')
    points = models.PositiveIntegerField(default=0)
    learning_streak = models.PositiveIntegerField(default=0)
    total_learning_time = models.PositiveIntegerField(default=0, help_text='Minutes spent learning')
    ai_interactions = models.PositiveIntegerField(default=0)
    puzzle_points = models.PositiveIntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)
    puzzle_streak = models.PositiveIntegerField(default=0)
    last_puzzle_solved_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} profile"

class Certificate(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')
    completion_date = models.DateTimeField(auto_now_add=True)
    certificate_code = models.CharField(max_length=64, unique=True)

    class Meta:
        unique_together = ('user', 'course')
        ordering = ['-completion_date']

    def __str__(self):
        return f"Certificate {self.certificate_code} for {self.user.username}"

class PuzzleChallenge(models.Model):
    CATEGORY_CHOICES = [
        ('memory', 'Memory Puzzle'),
        ('word', 'Word Puzzle'),
        ('logic', 'Logic Puzzle'),
        ('iq', 'Quick IQ Challenge'),
    ]

    title = models.CharField(max_length=255)
    prompt = models.TextField()
    answer = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    points = models.PositiveIntegerField(default=15)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class PuzzleProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='puzzle_progress')
    puzzle = models.ForeignKey(PuzzleChallenge, on_delete=models.CASCADE, related_name='progress')
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(auto_now_add=True)
    points_awarded = models.PositiveIntegerField(default=0)
    solve_time_seconds = models.PositiveIntegerField(null=True, blank=True)
    hints_used = models.PositiveIntegerField(default=0)
    attempts_count = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('user', 'puzzle')
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.user.username} - {self.puzzle.title}"

class Achievement(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    required_xp = models.PositiveIntegerField()
    badge_icon_url = models.URLField(default='https://via.placeholder.com/100', blank=True, null=True)

    def __str__(self):
        return self.title

class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement')

    def __str__(self):
        return f"{self.user.username} - {self.achievement.title}"

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        profile, _ = UserProfile.objects.get_or_create(user=instance)
        profile.save()
