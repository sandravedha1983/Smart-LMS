# Smart Learning Portal Backend (Phase 1)

This is the backend foundation for the Smart Learning Portal, an LMS platform featuring course management, lesson tracking, and future AI integration for concept explanation.

## Tech Stack
- **Python/Django**: Core framework
- **DRF (Django REST Framework)**: API Development
- **SimpleJWT**: JWT Authentication
- **drf-spectacular**: OpenAPI 3.0/Swagger documentation
- **SQLite**: Database (Local Development)

---

## Getting Started

### 1. Prerequisites
- Python 3.10+
- Virtual Environment (Recommended)

### 2. Installation
```bash
# Clone the repository
cd smart_learning_portal

# Create and activate virtual environment
python -m venv venv
# Windows:
./venv/Scripts/activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the root directory (one is already provided in this build):
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
```

### 4. Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser (Admin Access)
```bash
python manage.py createsuperuser
```

### 6. Run Server
```bash
python manage.py runserver
```

---

## API Documentation
Once the server is running, you can access the interactive API documentation at:
- **Swagger UI**: [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)
- **Redoc**: [http://127.0.0.1:8000/api/redoc/](http://127.0.0.1:8000/api/redoc/)

---

## API Endpoints (V1)

### Authentication
- `POST /api/v1/auth/register/`: Register a new user
- `POST /api/v1/auth/login/`: Obtain JWT Access/Refresh tokens
- `POST /api/v1/auth/refresh/`: Refresh access token

### Courses & Lessons
- `GET /api/v1/courses/`: List all courses (Nested lessons included)
- `POST /api/v1/courses/`: Create a new course (Protected)
- `GET /api/v1/courses/<id>/`: Retrieve course details
- `GET /api/v1/lessons/`: List all lessons
- `POST /api/v1/lessons/`: Create a new lesson (Protected)

---

## Running Tests
```bash
python manage.py test
```

## Folder Structure
```text
smart_learning_portal/
├── ai_features/          # AI Integration logic (Phase 2)
├── core/                 # Project settings and root URLs
├── courses/              # Course, Lesson, and Progress models/APIs
├── .env                  # Environment variables
├── manage.py             # Django entry point
├── requirements.txt      # Project dependencies
└── README.md             # Project documentation
```
