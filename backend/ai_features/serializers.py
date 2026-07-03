from rest_framework import serializers
from .models import HighlightedDoubt

LANGUAGE_CHOICES = [
    ('English', 'English'),
    ('Telugu', 'Telugu'),
    ('Hindi', 'Hindi'),
    ('Tamil', 'Tamil'),
    ('Kannada', 'Kannada'),
]

DIFFICULTY_CHOICES = [
    ('Beginner', 'Beginner'),
    ('Intermediate', 'Intermediate'),
    ('Advanced', 'Advanced'),
]

class ExplainRequestSerializer(serializers.Serializer):
    text = serializers.CharField(required=True, min_length=2, help_text="The highlighted text to explain.")
    course_title = serializers.CharField(required=False, allow_blank=True)
    lesson_title = serializers.CharField(required=False, allow_blank=True)
    transcript = serializers.CharField(required=False, allow_blank=True)
    context = serializers.CharField(required=False, allow_blank=True)
    lesson_id = serializers.IntegerField(required=False, allow_null=True)
    language = serializers.ChoiceField(choices=LANGUAGE_CHOICES, default='English')
    difficulty = serializers.ChoiceField(choices=DIFFICULTY_CHOICES, default='Beginner')
    follow_up_action = serializers.CharField(required=False, allow_blank=True)

    def validate_text(self, value):
        forbidden_keywords = ["ignore previous instructions", "system prompt", "as a developer"]
        for keyword in forbidden_keywords:
            if keyword in value.lower():
                raise serializers.ValidationError("Invalid content detected in text.")
        return value

class ExplanationResponseSerializer(serializers.Serializer):
    explanation = serializers.CharField()
    example = serializers.CharField()
    summary = serializers.CharField()
    follow_up_options = serializers.ListField(child=serializers.CharField(), required=False)
    quiz = serializers.ListField(child=serializers.DictField(child=serializers.CharField()), required=False)

class HighlightedDoubtSerializer(serializers.ModelSerializer):
    class Meta:
        model = HighlightedDoubt
        fields = ['id', 'user', 'lesson', 'selected_text', 'explanation', 'example', 'summary', 'created_at']
        read_only_fields = ['user', 'created_at']
