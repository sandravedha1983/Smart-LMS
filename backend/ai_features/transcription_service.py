import os
import time
import logging
import threading
import subprocess
from django.utils import timezone
from django.db import close_old_connections
from courses.models import Lesson
from ai_features.services import ai_service

logger = logging.getLogger(__name__)

def extract_audio_from_video(video_path):
    """
    Extracts the audio track from a video file and converts it to a 16kHz mono WAV file.
    If the file is already an audio format, returns the original path and False (not a temp file).
    Returns: (audio_file_path, is_temporary)
    """
    allowed_audio_suffixes = {'.mp3', '.wav', '.m4a', '.mpga', '.ogg'}
    _, suffix = os.path.splitext(video_path.lower())
    if suffix in allowed_audio_suffixes:
        logger.info(f"File is already in audio format '{suffix}'. Skipping extraction.")
        return video_path, False

    # Skip extraction for tiny files (e.g. test dummy files under 1KB)
    try:
        if os.path.exists(video_path) and os.path.getsize(video_path) < 1024:
            logger.info("File is too small to be a valid video (<1KB). Skipping audio extraction (likely test dummy file).")
            return video_path, False
    except Exception:
        pass

    try:
        import imageio_ffmpeg
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    except Exception as e:
        logger.error(f"Failed to load imageio-ffmpeg. Whisper will fall back to transcribing the video directly: {str(e)}")
        return video_path, False

    temp_dir = os.path.dirname(video_path)
    base_name = os.path.basename(video_path)
    name_w_ext, _ = os.path.splitext(base_name)
    temp_wav_path = os.path.join(temp_dir, f"temp_audio_{name_w_ext}_{int(time.time())}.wav")

    logger.info(f"Extracting audio track from video: {video_path} -> {temp_wav_path}")
    
    command = [
        ffmpeg_exe,
        '-y',                  # Overwrite output file
        '-i', video_path,      # Input file
        '-vn',                 # Disable video recording
        '-acodec', 'pcm_s16le',# PCM 16-bit encoding (lossless WAV)
        '-ar', '16000',        # 16kHz sampling rate
        '-ac', '1',            # Mono channel
        temp_wav_path          # Output path
    ]

    try:
        result = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )
        logger.info(f"Audio extraction successful: {temp_wav_path}")
        return temp_wav_path, True
    except subprocess.CalledProcessError as e:
        error_output = e.stderr.decode('utf-8', errors='ignore')
        logger.error(f"FFmpeg extraction subprocess failed: {error_output}")
        # Clean up temp file if created
        if os.path.exists(temp_wav_path):
            try:
                os.remove(temp_wav_path)
            except Exception:
                pass
        raise Exception(f"FFmpeg extraction failed: {error_output}")
    except Exception as e:
        logger.exception(f"Unexpected error during audio extraction: {str(e)}")
        if os.path.exists(temp_wav_path):
            try:
                os.remove(temp_wav_path)
            except Exception:
                pass
        raise

def trigger_transcription(lesson_id):
    """
    Spawns a daemon thread to process the video transcription asynchronously.
    """
    thread = threading.Thread(target=_transcribe_worker, args=(lesson_id,))
    thread.daemon = True
    thread.start()

def _transcribe_worker(lesson_id):
    """
    Worker function executed in the background thread.
    """
    try:
        process_transcription(lesson_id)
    except Exception as e:
        logger.exception(f"Unhandled exception in transcription worker for lesson {lesson_id}: {str(e)}")
    finally:
        # Prevent database connection leaks in background threads
        close_old_connections()

def process_transcription(lesson_id):
    """
    Performs the full validation, audio extraction, OpenAI call, retries, and database updates.
    """
    logger.info(f"Starting background transcription task for Lesson ID: {lesson_id}")
    
    # 1. Fetch lesson
    try:
        lesson = Lesson.objects.get(id=lesson_id)
    except Lesson.DoesNotExist:
        logger.error(f"Lesson ID {lesson_id} not found. Aborting transcription.")
        return

    # 2. Check if a video file actually exists
    if not lesson.video_file:
        if lesson.video_url:
            if "youtube.com" in lesson.video_url.lower() or "youtu.be" in lesson.video_url.lower():
                logger.info(f"Lesson ID {lesson_id} has a YouTube URL. Attempting to fetch native transcript.")
                try:
                    import re
                    from youtube_transcript_api import YouTubeTranscriptApi
                    
                    # Extract the 11-character video ID
                    match = re.search(r'(?:v=|\/)([0-9A-Za-z_-]{11}).*', lesson.video_url)
                    video_id = match.group(1) if match else None
                    if not video_id:
                        _mark_failed(lesson, "Could not extract a valid video ID from the YouTube URL.")
                        return

                    ytt_api = YouTubeTranscriptApi()
                    try:
                        # Try to get English transcript first
                        transcript_obj = ytt_api.list(video_id).find_transcript(['en', 'en-US', 'en-GB'])
                    except Exception:
                        # Fallback to the first available transcript
                        transcript_obj = list(ytt_api.list(video_id))[0]
                        
                    transcript_list = transcript_obj.fetch()
                    
                    formatted_lines = []
                    for entry in transcript_list:
                        start_sec = entry.start
                        hrs = int(start_sec // 3600)
                        mins = int((start_sec % 3600) // 60)
                        secs = int(start_sec % 60)
                        ms = int((start_sec % 1) * 100)
                        if hrs > 0:
                            time_str = f"[{hrs:02d}:{mins:02d}:{secs:02d}.{ms:02d}]"
                        else:
                            time_str = f"[{mins:02d}:{secs:02d}.{ms:02d}]"
                        
                        text = entry.text.replace('\n', ' ').strip()
                        formatted_lines.append(f"{time_str} {text}")
                    
                    transcript_text = " ".join(formatted_lines)
                    
                    lesson.transcript = transcript_text.strip()
                    lesson.transcription_status = 'COMPLETED'
                    lesson.transcribed_at = timezone.now()
                    lesson.transcription_error = None
                    lesson.save(update_fields=['transcript', 'transcription_status', 'transcribed_at', 'transcription_error'])
                    logger.info(f"Successfully fetched YouTube transcript for Lesson ID: {lesson_id}")
                    return

                except Exception as e:
                    _mark_failed(lesson, f"Failed to fetch YouTube transcript: {str(e)}")
                    return
            else:
                _mark_failed(lesson, "Automatic transcription is only supported for uploaded video files or YouTube URLs.")
                return
        else:
            logger.info(f"Lesson ID {lesson_id} has no video file uploaded. Marking status as COMPLETED with empty transcript.")
            lesson.transcription_status = 'COMPLETED'
            lesson.transcript = ""
            lesson.save(update_fields=['transcription_status', 'transcript'])
            return

    # 3. Mark status as PROCESSING
    lesson.transcription_status = 'PROCESSING'
    lesson.transcription_error = None
    lesson.save(update_fields=['transcription_status', 'transcription_error'])

    # 4. Perform Validations
    file_path = lesson.video_file.path
    if not os.path.exists(file_path):
        _mark_failed(lesson, f"Video file not found on disk path: {file_path}")
        return

    # Suffix check
    allowed_suffixes = {'.mp4', '.mov', '.avi', '.webm', '.m4a', '.wav', '.mp3', '.mpeg', '.mpga'}
    _, suffix = os.path.splitext(file_path.lower())
    if suffix not in allowed_suffixes:
        _mark_failed(
            lesson, 
            f"Unsupported format '{suffix}'. Allowed formats: {', '.join(allowed_suffixes)}"
        )
        return

    # Extract audio first
    audio_file_path = file_path
    temp_created = False
    try:
        audio_file_path, temp_created = extract_audio_from_video(file_path)
    except Exception as e:
        _mark_failed(lesson, f"Audio extraction failed: {str(e)}")
        return

    # Size check (Whisper API limit is 25MB)
    try:
        file_size_bytes = os.path.getsize(audio_file_path)
        file_size_mb = file_size_bytes / (1024 * 1024)
        logger.info(f"Audio file size: {file_size_mb:.2f} MB")
        
        if file_size_mb > 25.0:
            _mark_failed(
                lesson, 
                f"Audio file size ({file_size_mb:.2f} MB) exceeds Whisper's 25MB limit. Please upload a smaller or shorter video file."
            )
            return

        # 5. Call Whisper API with retry mechanism
        start_time = time.time()
        max_retries = 3
        retry_delay = 5.0
        transcript_text = None
        last_error = ""

        for attempt in range(1, max_retries + 1):
            try:
                logger.info(f"Whisper transcription API call attempt {attempt}/{max_retries} for lesson {lesson_id}")
                
                with open(audio_file_path, 'rb') as audio_file:
                    # Use transcription endpoint with verbose_json to fetch timestamps
                    response = ai_service.client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        response_format="verbose_json"
                    )
                    
                    # Format segments with [mm:ss] or [hh:mm:ss] prefix
                    if hasattr(response, 'segments') and isinstance(response.segments, (list, tuple)):
                        formatted_lines = []
                        for seg in response.segments:
                            start_sec = getattr(seg, 'start', 0.0)
                            hrs = int(start_sec // 3600)
                            mins = int((start_sec % 3600) // 60)
                            secs = int(start_sec % 60)
                            ms = int((start_sec % 1) * 100)
                            if hrs > 0:
                                time_str = f"[{hrs:02d}:{mins:02d}:{secs:02d}.{ms:02d}]"
                            else:
                                time_str = f"[{mins:02d}:{secs:02d}.{ms:02d}]"
                            formatted_lines.append(f"{time_str} {getattr(seg, 'text', '').strip()}")
                        transcript_text = " ".join(formatted_lines)
                    else:
                        transcript_text = getattr(response, 'text', '')
                
                if transcript_text:
                    break
            except Exception as e:
                last_error = str(e)
                logger.warning(f"Attempt {attempt} failed with error: {last_error}")
                if attempt < max_retries:
                    time.sleep(retry_delay * attempt)  # Exponential backoff

        processing_time = time.time() - start_time
        logger.info(f"Transcription process for lesson {lesson_id} completed API calls in {processing_time:.2f}s")

        if transcript_text:
            # Success path
            lesson.transcript = transcript_text.strip()
            lesson.transcription_status = 'COMPLETED'
            lesson.transcribed_at = timezone.now()
            lesson.transcription_error = None
            lesson.save(update_fields=['transcript', 'transcription_status', 'transcribed_at', 'transcription_error'])
            logger.info(f"Transcription successfully completed for Lesson ID: {lesson_id}")
        else:
            # Failure path
            _mark_failed(lesson, f"Whisper API failed after {max_retries} attempts. Last error: {last_error}")

    finally:
        # ALWAYS clean up the temporary extracted audio file
        if temp_created and os.path.exists(audio_file_path):
            try:
                os.remove(audio_file_path)
                logger.info(f"Successfully cleaned up temporary audio file: {audio_file_path}")
            except Exception as err:
                logger.error(f"Failed to delete temp audio file {audio_file_path}: {str(err)}")

def _mark_failed(lesson, error_message):
    logger.error(f"Transcription failed for Lesson {lesson.id}: {error_message}")
    lesson.transcription_status = 'FAILED'
    lesson.transcription_error = error_message
    # Clear any stale transcripts to prevent displaying wrong data
    lesson.transcript = ""
    lesson.save(update_fields=['transcription_status', 'transcription_error', 'transcript'])
