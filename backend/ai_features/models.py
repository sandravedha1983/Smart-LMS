from django.db import models
from django.contrib.auth.models import User
from courses.models import Lesson

class HighlightedDoubt(models.Model):
    """
    Model to store user doubts and AI-generated explanations.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='doubts')
    lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True, related_name='doubts')
    selected_text = models.TextField()
    explanation = models.TextField()
    example = models.TextField()
    summary = models.TextField()
    language = models.CharField(max_length=30, default='English')
    difficulty = models.CharField(max_length=20, default='Beginner')
    follow_up_action = models.CharField(max_length=64, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Doubt by {self.user.username} on '{self.selected_text[:30]}...'"
