# Smart Learning Portal with Doubt Solver

A modern, AI-powered Learning Management System (LMS) designed to enhance the student experience. When students are watching lessons and come across a confusing concept, they can simply highlight any sentence in the transcript to trigger an AI model that explains the concept in simpler words with contextual examples—without ever leaving the page!

## 🚀 Features

* **AI-Powered Concept Explainer (Context-Aware):** Highlight any text in the video transcript to get an instant AI explanation.
* **React Video Player with Highlights:** Custom video player tightly integrated with interactive, timestamped transcripts.
* **Progress Tracking & Quizzes:** Auto-save watch progress, mark lessons as complete, and take practice quizzes at the end of lessons.
* **Course & Lesson Management:** Robust Django models handling courses, video files, automatic transcriptions, and user progress.
* **Gamification:** Earn points, achievements, and solve puzzles to keep learning fun.

## 🏗 Project Structure

This repository is divided into two main parts:

1. **`/backend`** - Django REST Framework API
   * Core models for Courses, Lessons, Quizzes, and User Progress.
   * `ai_features` app responsible for communicating with AI services (e.g., OpenAI) for contextual transcript explanations.
   * Handles video transcription background tasks.

2. **`/frontend`** - React (Vite) Single Page Application
   * A beautiful, glassmorphism-inspired user interface.
   * Built with React, Tailwind CSS, and Context API.
   * Contains the `VideoPlayer` and `TranscriptViewer` components.

## 🛠 Setup & Installation

### Backend Setup (Django)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate your virtual environment and install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up your environment variables (create a `.env` file based on `.env.example`). You will need your OpenAI API keys and database credentials.
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup (React)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in `.env` (e.g., `VITE_API_BASE_URL`).
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 📚 Technologies Used

* **Frontend:** React, Vite, Tailwind CSS, React Router
* **Backend:** Python, Django, Django REST Framework, SQLite/PostgreSQL
* **AI & Media:** OpenAI API, background workers for video transcription
# Smart-LMS
