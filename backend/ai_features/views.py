import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.throttling import UserRateThrottle
from django.core.cache import cache
from drf_spectacular.utils import extend_schema

from .serializers import ExplainRequestSerializer, ExplanationResponseSerializer
from .services import ai_service
from .models import HighlightedDoubt

logger = logging.getLogger(__name__)

class AIExplainThrottle(UserRateThrottle):
    rate = '10/hour'  # Prevent API abuse

class ExplainConceptView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=ExplainRequestSerializer,
        responses={200: ExplanationResponseSerializer},
        description="Get a tailored AI explanation for highlighted transcript text."
    )
    def post(self, request, *args, **kwargs):
        serializer = ExplainRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        highlighted_text = data['text']
        course_title = data.get('course_title')
        lesson_title = data.get('lesson_title')
        transcript = data.get('context') or data.get('transcript')
        lesson_id = data.get('lesson_id')
        language = data.get('language', 'English')
        difficulty = data.get('difficulty', 'Beginner')
        follow_up_action = data.get('follow_up_action', '')

        cache_key = f"explain_{hash((highlighted_text, course_title, lesson_title, language, difficulty, follow_up_action))}"
        cached_response = cache.get(cache_key)
        if cached_response:
            logger.info(f"Serving cached explanation for text: {highlighted_text[:20]}...")
            return Response(cached_response, status=status.HTTP_200_OK)

        result = ai_service.explain_concept(
            highlighted_text=highlighted_text,
            course_title=course_title,
            lesson_title=lesson_title,
            context_transcript=transcript,
            language=language,
            difficulty=difficulty,
            follow_up_action=follow_up_action
        )

        if 'error' in result:
            return Response(result, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            HighlightedDoubt.objects.create(
                user=request.user,
                lesson_id=lesson_id,
                selected_text=highlighted_text,
                explanation=result.get('explanation', ''),
                example=result.get('example', ''),
                summary=result.get('summary', ''),
                language=language,
                difficulty=difficulty,
                follow_up_action=follow_up_action or ''
            )
        except Exception as e:
            logger.warning(f"Failed to save doubt to database: {str(e)}")

        cache.set(cache_key, result, timeout=86400)
        profile = getattr(request.user, 'profile', None)
        if profile:
            profile.ai_interactions += 1
            profile.save()

        return Response(result, status=status.HTTP_200_OK)

class UserDoubtHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        doubts = HighlightedDoubt.objects.filter(user=request.user)
        from .serializers import HighlightedDoubtSerializer
        serializer = HighlightedDoubtSerializer(doubts, many=True)
        return Response(serializer.data)
