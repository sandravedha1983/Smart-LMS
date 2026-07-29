import json
import logging
from django.conf import settings
from ai_features.services import ai_service
from courses.models import Lesson, Quiz, QuizQuestion

logger = logging.getLogger(__name__)

def generate_lesson_content(lesson_id):
    try:
        lesson = Lesson.objects.get(id=lesson_id)
        if not lesson.transcript:
            logger.warning(f"Lesson {lesson_id} has no transcript. Skipping AI generation.")
            return

        prompt = f"""
        You are an expert educational AI. Analyze the following transcript of a lesson and generate a JSON response with the following keys exactly:
        "summary": A clear 3-5 sentence summary.
        "key_concepts": A list of 3-5 main concepts discussed.
        "flashcards": A list of 5 dictionaries (each with 'front' and 'back').
        "keywords": A list of 5-10 important keywords.
        "quiz": A list of 5 dictionaries for multiple choice questions (each with 'question', 'options' (list of 4 strings), 'correct_answer' (string matching one option exactly), 'explanation').
        
        Transcript:
        {lesson.transcript[:15000]} # Limit transcript length to prevent token overflow
        
        Respond ONLY with a valid JSON object matching the exact structure requested.
        """
        
        # Use gpt-3.5-turbo if 4o is not available, but let's assume ai_service wraps this
        response = ai_service.client.chat.completions.create(
            model="gpt-3.5-turbo-1106", 
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        content = json.loads(response.choices[0].message.content)
        
        # Update lesson fields
        lesson.ai_summary = content.get('summary', '')
        lesson.ai_key_concepts = content.get('key_concepts', [])
        lesson.ai_flashcards = content.get('flashcards', [])
        lesson.ai_keywords = content.get('keywords', [])
        lesson.save()
        
        # Create Quiz
        quiz_data = content.get('quiz', [])
        if quiz_data:
            quiz, _ = Quiz.objects.get_or_create(lesson=lesson, defaults={'title': f"{lesson.title} AI Quiz"})
            for q in quiz_data:
                QuizQuestion.objects.create(
                    quiz=quiz,
                    question=q.get('question', ''),
                    options=q.get('options', []),
                    correct_answer=q.get('correct_answer', ''),
                    explanation=q.get('explanation', ''),
                    question_type='MCQ'
                )
                
        logger.info(f"AI content generated successfully for lesson {lesson_id}")
    except Exception as e:
        logger.error(f"Error generating AI content for lesson {lesson_id}: {str(e)}")
