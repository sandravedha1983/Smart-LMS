import os
import sys
import wave
import io
import time
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from ai_features.services import ai_service
from courses.models import Lesson

print("="*60)
print("WHISPER TRANSCRIPTION SYSTEM DEBUG AUDIT")
print("="*60)

# STEP 1: VERIFY ENVIRONMENT VARIABLES
print("\n--- STEP 1: Environment Variables ---")
env_path = os.path.join(settings.BASE_DIR, '.env')
print(f"Checking for .env file at: {env_path}")
if os.path.exists(env_path):
    print("SUCCESS: .env file exists.")
else:
    print("FAIL: .env file NOT found.")

api_key = os.getenv("OPENAI_API_KEY")
print(f"OPENAI_API_KEY Loaded: {'YES' if api_key else 'NO'}")
if api_key:
    masked_key = f"{api_key[:12]}****{api_key[-4:]}"
    print(f"Key Prefix/Suffix: {masked_key}")
else:
    print("FAIL: OPENAI_API_KEY is not defined in the environment.")

# STEP 2: VERIFY OPENAI CONNECTION
print("\n--- STEP 2: OpenAI Connection ---")
try:
    client = ai_service.client
    print("Client initialized successfully.")
    print("Testing chat completion connectivity...")
    response = client.chat.completions.create(
        model=ai_service.model,
        messages=[{"role": "user", "content": "Ping"}],
        max_tokens=5
    )
    print(f"Connection Status: PASS")
    print(f"Chat Response: {response.choices[0].message.content.strip()}")
except Exception as e:
    print(f"Connection Status: FAIL")
    print(f"Error: {e}")

# STEP 3: VERIFY WHISPER ACCESS
print("\n--- STEP 3: Whisper Access ---")
# Generate a 1-second silent WAV file in memory
wav_io = io.BytesIO()
wav_io.name = "test_sample.wav"
try:
    with wave.open(wav_io, 'wb') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(16000)
        wav.writeframes(b'\x00' * 32000)
    wav_io.seek(0)
    
    print("Sending silent sample WAV file to Whisper API (whisper-1)...")
    res = client.audio.transcriptions.create(
        model="whisper-1",
        file=wav_io
    )
    print("Whisper Status: PASS")
    print(f"Response Received: {res.text}")
except Exception as e:
    print("Whisper Status: FAIL")
    print(f"Whisper Error: {e}")

# STEP 4: VERIFY FILE SYSTEM & LESSON UPLOADS
print("\n--- STEP 4: Verify Lesson Videos ---")
lessons_with_files = Lesson.objects.exclude(video_file='')
print(f"Number of lessons with video files: {lessons_with_files.count()}")
for l in lessons_with_files:
    print(f"\nLesson ID {l.id} - '{l.title}':")
    print(f"  Status: {l.transcription_status}")
    print(f"  Video file field value: {l.video_file}")
    try:
        path = l.video_file.path
        print(f"  Absolute path: {path}")
        exists = os.path.exists(path)
        print(f"  File exists on disk: {exists}")
        if exists:
            size_mb = os.path.getsize(path) / (1024 * 1024)
            print(f"  File size: {size_mb:.2f} MB")
            # Try to open
            with open(path, 'rb') as f:
                header = f.read(10)
                print(f"  Read test: SUCCESS (Header bytes: {header})")
        else:
            print("  Read test: FAIL (File not on disk)")
    except Exception as err:
        print(f"  Error reading file: {err}")

print("="*60)
print("AUDIT COMPLETE")
print("="*60)
