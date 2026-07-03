from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Course, Lesson

class CourseAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword123')
        profile = self.user.profile
        profile.role = 'professor'
        profile.approved = True
        profile.save()
        self.course_data = {'title': 'Intro to AI', 'description': 'Learn AI basics'}
        self.course = Course.objects.create(**self.course_data)
        
        # Get JWT Token
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'username': 'testuser', 'password': 'testpassword123'})
        self.access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_create_course(self):
        """Test creating a course via POST."""
        url = reverse('course-list')
        data = {'title': 'Advanced Django', 'description': 'Deep dive into Django'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Course.objects.count(), 2)

    def test_get_courses_list(self):
        """Test retrieving course list."""
        url = reverse('course-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_lesson_retrieval(self):
        """Test retrieving lessons."""
        Lesson.objects.create(course=self.course, title='Lesson 1', video_url='http://test.com', lesson_order=1)
        url = reverse('lesson-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_auth_required_for_create(self):
        """Test that authentication is required for POST."""
        self.client.credentials() # Clear credentials
        url = reverse('course-list')
        response = self.client.post(url, self.course_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TranscriptionSystemTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testprof', password='testpassword123')
        profile = self.user.profile
        profile.role = 'professor'
        profile.approved = True
        profile.save()
        self.course = Course.objects.create(title='Python Testing', description='Course for testing', created_by=self.user)
        
        # Authenticate
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'username': 'testprof', 'password': 'testpassword123'})
        self.access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

        # Create dummy file
        self.dummy_video_path = 'test_dummy.mp4'
        with open(self.dummy_video_path, 'wb') as f:
            f.write(b'fake mp4 file content')

    def tearDown(self):
        import os
        if os.path.exists(self.dummy_video_path):
            os.remove(self.dummy_video_path)
        # Clear database uploads
        for lesson in Lesson.objects.all():
            if lesson.video_file:
                if os.path.exists(lesson.video_file.path):
                    os.remove(lesson.video_file.path)

    def test_create_lesson_sets_pending_status(self):
        """Creating a lesson with a video file sets status to PENDING."""
        from django.core.files import File
        with open(self.dummy_video_path, 'rb') as f:
            lesson = Lesson.objects.create(
                course=self.course,
                title='Intro to Lists',
                video_file=File(f),
                lesson_order=1
            )
        self.assertEqual(lesson.transcription_status, 'PENDING')
        self.assertIsNone(lesson.transcript)

    def test_transcription_service_success(self):
        """Service successfully processes video and updates Lesson fields."""
        from django.core.files import File
        from unittest.mock import patch, MagicMock
        from ai_features.transcription_service import process_transcription

        with open(self.dummy_video_path, 'rb') as f:
            lesson = Lesson.objects.create(
                course=self.course,
                title='Intro to Lists',
                video_file=File(f),
                lesson_order=1
            )

        # Mock OpenAI client response
        mock_response = MagicMock()
        mock_response.text = "Hello, world. This is a real transcript."
        
        with patch('ai_features.services.ai_service._client') as mock_client:
            mock_client.audio.transcriptions.create.return_value = mock_response
            process_transcription(lesson.id)
            
        lesson.refresh_from_db()
        self.assertEqual(lesson.transcription_status, 'COMPLETED')
        self.assertEqual(lesson.transcript, "Hello, world. This is a real transcript.")
        self.assertIsNotNone(lesson.transcribed_at)
        self.assertIsNone(lesson.transcription_error)

    def test_transcription_service_failure(self):
        """Service sets status to FAILED on Whisper exception."""
        from django.core.files import File
        from unittest.mock import patch
        from ai_features.transcription_service import process_transcription

        with open(self.dummy_video_path, 'rb') as f:
            lesson = Lesson.objects.create(
                course=self.course,
                title='Intro to Lists',
                video_file=File(f),
                lesson_order=1
            )

        with patch('ai_features.services.ai_service._client') as mock_client:
            mock_client.audio.transcriptions.create.side_effect = Exception("Whisper rate limit exceeded")
            process_transcription(lesson.id)
            
        lesson.refresh_from_db()
        self.assertEqual(lesson.transcription_status, 'FAILED')
        self.assertEqual(lesson.transcript, "")
        self.assertIn("Whisper rate limit exceeded", lesson.transcription_error)

    def test_video_replacement_triggers_retranscription(self):
        """Replacing a video file resets status to PENDING and clears previous transcript."""
        from django.core.files import File
        with open(self.dummy_video_path, 'rb') as f:
            lesson = Lesson.objects.create(
                course=self.course,
                title='Intro to Lists',
                video_file=File(f),
                lesson_order=1
            )
        
        lesson.transcription_status = 'COMPLETED'
        lesson.transcript = "Old transcript"
        lesson.save()

        # Update video file
        with open(self.dummy_video_path, 'rb') as f:
            lesson.video_file = File(f)
            lesson.save()

        self.assertEqual(lesson.transcription_status, 'PENDING')
        self.assertEqual(lesson.transcript, "")

    def test_retry_transcription_api_endpoint(self):
        """The retry endpoint resets status to PENDING and triggers job."""
        from django.core.files import File
        with open(self.dummy_video_path, 'rb') as f:
            lesson = Lesson.objects.create(
                course=self.course,
                title='Intro to Lists',
                video_file=File(f),
                lesson_order=1
            )
        
        lesson.transcription_status = 'FAILED'
        lesson.transcription_error = "Network timeout"
        lesson.save()

        url = reverse('lesson-retry-transcription', kwargs={'pk': lesson.id})
        
        from unittest.mock import patch
        with patch('ai_features.transcription_service.trigger_transcription') as mock_trigger:
            response = self.client.post(url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            mock_trigger.assert_called_once_with(lesson.id)

        lesson.refresh_from_db()
        self.assertEqual(lesson.transcription_status, 'PENDING')
        self.assertIsNone(lesson.transcription_error)
