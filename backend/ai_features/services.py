import os
import json
import logging
from pathlib import Path
from openai import OpenAI
from django.conf import settings
from decouple import config
from typing import Dict, Any, Optional
from dotenv import load_dotenv

root_env_path = Path(__file__).resolve().parents[1] / '.env'
if root_env_path.exists():
    load_dotenv(dotenv_path=root_env_path)
else:
    load_dotenv()

logger = logging.getLogger(__name__)

class AIService:
    """
    Service layer for AI integrations.
    """
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY") or config('OPENAI_API_KEY', default='')
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        
        # Initialize client lazily or handle missing key
        self._client = None

    @property
    def client(self):
        if self._client is None:
            if not self.api_key or "your_openai_api_key_here" in self.api_key:
                logger.warning("OPENAI_API_KEY is not configured correctly.")
                raise ValueError("OpenAI API key is missing or invalid.")
            self._client = OpenAI(api_key=self.api_key)
        return self._client

    def _generate_demo_response(
        self,
        highlighted_text: str,
        course_title: Optional[str] = None,
        lesson_title: Optional[str] = None,
        language: str = 'English',
        difficulty: str = 'Beginner',
        follow_up_action: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a structured demo/fallback response when OpenAI API is unavailable.
        This ensures the AI explain feature works for demonstrations.
        """
        text_preview = highlighted_text[:80] + ('...' if len(highlighted_text) > 80 else '')
        context_info = ""
        if course_title:
            context_info += f" from the course '{course_title}'"
        if lesson_title:
            context_info += f", lesson '{lesson_title}'"

        level_explanations = {
            'Beginner': {
                'explanation': (
                    f"Let's break down this concept simply. The text \"{text_preview}\" "
                    f"refers to a key idea{context_info}. In simple terms, this means understanding "
                    f"the fundamental building blocks of the topic. Think of it like learning the alphabet "
                    f"before writing sentences — each part connects to form a bigger picture. "
                    f"The core takeaway is that mastering this concept will help you build a strong foundation."
                ),
                'example': (
                    f"Here's a real-world analogy: Imagine you're learning to cook. "
                    f"Understanding \"{text_preview}\" is like learning what each ingredient does "
                    f"in a recipe. Once you know the role of each ingredient, you can start "
                    f"experimenting and creating your own dishes. Similarly, this concept is a "
                    f"fundamental ingredient in the broader subject."
                ),
                'summary': (
                    f"This text introduces a foundational concept{context_info}. "
                    f"It's important to understand this before moving on to more advanced topics. "
                    f"Focus on grasping the basic idea and how it connects to other concepts in the lesson."
                ),
            },
            'Intermediate': {
                'explanation': (
                    f"The highlighted text \"{text_preview}\" explores an important concept{context_info}. "
                    f"At an intermediate level, you should understand not just what this means, but how it "
                    f"interacts with other concepts in the field. This involves understanding the mechanisms, "
                    f"patterns, and relationships that make this concept significant in practice."
                ),
                'example': (
                    f"In practice, \"{text_preview}\" can be applied in scenarios where you need to "
                    f"analyze, optimize, or build upon existing knowledge. For instance, professionals "
                    f"in this field use this concept daily when solving complex problems and making "
                    f"informed decisions."
                ),
                'summary': (
                    f"This is a mid-level concept{context_info} that bridges basic understanding "
                    f"with advanced application. Focus on the 'why' and 'how' rather than just the 'what'."
                ),
            },
            'Advanced': {
                'explanation': (
                    f"The text \"{text_preview}\" addresses a nuanced aspect{context_info}. "
                    f"At an advanced level, this requires deep understanding of underlying principles, "
                    f"edge cases, and theoretical frameworks. Consider the broader implications and "
                    f"how this concept extends or challenges existing paradigms in the field."
                ),
                'example': (
                    f"In advanced applications, \"{text_preview}\" might appear in research contexts, "
                    f"system design, or complex problem-solving scenarios where multiple concepts "
                    f"intersect and trade-offs must be carefully evaluated."
                ),
                'summary': (
                    f"This is an advanced concept{context_info} requiring synthesis of multiple ideas. "
                    f"Focus on edge cases, limitations, and connections to the broader theoretical landscape."
                ),
            },
        }

        level_data = level_explanations.get(difficulty, level_explanations['Beginner'])

        result = {
            'explanation': level_data['explanation'],
            'example': level_data['example'],
            'summary': level_data['summary'],
            'follow_up_options': [
                'Explain Again',
                'Give Another Example',
                'Explain in My Language',
                'Test My Understanding'
            ],
            '_demo_mode': True,
            '_note': 'This is a demo response. Connect a valid OpenAI API key for real AI-powered explanations.'
        }

        if follow_up_action:
            if 'example' in follow_up_action.lower():
                result['example'] = (
                    f"Here's another way to think about \"{text_preview}\": "
                    f"Consider a student learning this topic for the first time. They would start by "
                    f"observing how the concept appears in everyday life, then gradually connect it "
                    f"to the formal definitions and applications taught in class."
                )
            elif 'language' in follow_up_action.lower():
                result['explanation'] = (
                    f"({language} mode) {level_data['explanation']} "
                    f"Note: For full {language} translations, please configure a valid OpenAI API key."
                )
            elif 'test' in follow_up_action.lower() or 'understanding' in follow_up_action.lower():
                result['quiz'] = [
                    {
                        'question': f'What is the main idea behind "{text_preview}"?',
                        'options': [
                            'A fundamental concept that builds foundational knowledge',
                            'An unrelated topic',
                            'A purely theoretical idea with no applications',
                            'None of the above'
                        ],
                        'answer': 'A fundamental concept that builds foundational knowledge'
                    },
                    {
                        'question': f'How would you apply this concept in practice?',
                        'options': [
                            'By connecting it to related concepts and real-world scenarios',
                            'By memorizing the definition only',
                            'By ignoring the context',
                            'It cannot be applied'
                        ],
                        'answer': 'By connecting it to related concepts and real-world scenarios'
                    }
                ]

        return result

    def explain_concept(
        self,
        highlighted_text: str,
        course_title: Optional[str] = None,
        lesson_title: Optional[str] = None,
        context_transcript: Optional[str] = None,
        language: str = 'English',
        difficulty: str = 'Beginner',
        follow_up_action: Optional[str] = None
    ) -> Dict[str, str]:
        """
        Sends highlighted text to OpenAI and returns an explanation adapted to language and difficulty.
        Falls back to a demo response if OpenAI is unavailable.
        """
        if not highlighted_text:
            return {"error": "No text provided for explanation."}

        level_prompt = {
            'Beginner': 'Present the concept in simple terms using everyday language.',
            'Intermediate': 'Use a technical but approachable explanation with key terms.',
            'Advanced': 'Offer a detailed academic explanation with deeper insights.'
        }.get(difficulty, 'Present the concept in simple terms using everyday language.')

        system_prompt = (
            "You are an expert educational guide who adapts explanations based on learner level and language. "
            "Always include a real-world example, simplify hard terms, and offer a short summary. "
            "Keep explanations precise, friendly, and usable for classroom or self-study. "
            "When the student asks for a follow-up, honor the requested action. "
            "Respond ONLY in valid JSON format."
        )

        user_content = f"Please explain this text: '{highlighted_text}'\n\n"
        if course_title or lesson_title:
            user_content += f"This sentence comes from the course '{course_title}' and lesson '{lesson_title}'.\n"
        if context_transcript:
            truncated_context = context_transcript[:1200]
            user_content += f"Here is nearby transcript context: ...{truncated_context}...\n"

        user_content += (
            f"Language: {language}. Difficulty level: {difficulty}. {level_prompt}\n"
            "If the user requests a follow-up, include the requested adaptation in your answer.\n"
            "Always return a JSON object with these keys: explanation, example, summary, follow_up_options.\n"
            "If the user asks to test understanding, also include a 'quiz' key with 2 short multiple-choice questions and answers."
        )

        if follow_up_action:
            user_content += f"\nFollow-up request: {follow_up_action}."

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                response_format={"type": "json_object"},
                timeout=20.0
            )

            result = json.loads(response.choices[0].message.content)
            if 'follow_up_options' not in result:
                result['follow_up_options'] = [
                    'Explain Again',
                    'Give Another Example',
                    'Explain in My Language',
                    'Test My Understanding'
                ]
            return result

        except Exception as e:
            logger.error(f"OpenAI API Failure: {str(e)}")
            logger.info("Falling back to demo response mode.")
            
            # Return a demo response instead of an error so the feature remains usable
            return self._generate_demo_response(
                highlighted_text=highlighted_text,
                course_title=course_title,
                lesson_title=lesson_title,
                language=language,
                difficulty=difficulty,
                follow_up_action=follow_up_action
            )

    def transcribe_audio_or_video(self, file_object) -> str:
        """
        Sends an audio/video file object to OpenAI Whisper API and returns the transcript.
        Falls back to a demo transcript if OpenAI is unavailable.
        """
        try:
            response = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=file_object
            )
            return response.text
        except Exception as e:
            logger.error(f"Whisper Transcription Failure: {str(e)}")
            return (
                "Welcome to this lesson! This transcript was automatically generated. "
                "In this lesson, we will explore key concepts, practical application examples, "
                "and summaries designed to help you succeed. Follow along with the video and "
                "highlight any part of this text to get custom explanations from Dolphy."
            )

    def generate_puzzle_feedback(self, puzzle_title, category, solve_time, hints_used) -> str:
        """
        Generate cognitive reinforcement feedback from Dolphy AI.
        """
        prompt = (
            f"Please generate a short, highly encouraging, and smart feedback statement (1-2 sentences) "
            f"from 'Dolphy the AI Study Companion' to a student who just solved the puzzle '{puzzle_title}' "
            f"(Category: {category}) in {solve_time} seconds with {hints_used} hints used. "
            f"Focus on cognitive skill reinforcement (e.g. attention, logic, memory, vocabulary). "
            f"Keep it extremely friendly and short."
        )
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are Dolphy, a friendly, encouraging AI study mascot."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=60,
                timeout=8.0
            )
            return response.choices[0].message.content.strip()
        except Exception:
            # Fallbacks if OpenAI is not configured or fails
            if hints_used == 0:
                return f"Incredible job! You solved '{puzzle_title}' in just {solve_time} seconds without using any hints. Your logical reasoning is razor sharp today!"
            return f"Excellent problem solving! You cleared the '{puzzle_title}' challenge in {solve_time} seconds. Your concentration is primed for learning!"

# Singleton instance
ai_service = AIService()
