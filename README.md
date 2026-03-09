[![CI/CD Deployment](https://github.com/fachry-isl/learnesia/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/fachry-isl/learnesia/actions/workflows/deploy.yml)

# Learnesia

Learnesia is an AI-powered course generation platform for educators and content creators. It automates the process of creating and managing structured educational content using Google Gemini and a modern web stack.

## Key Features

- **AI Course Generation**: Generate course outlines, lesson content, and quizzes using Google Gemini.
- **Structured Learning**: Organize lessons into modules with clear objectives.
- **Content Management**: Manage lesson resources including external links, document attachments, and video embeds.
- **Content Lifecycle**: Track progress with Draft, Published, and Template statuses.
- **Lesson Editor**: Interface for refining and editing generated content.
- **Authentication**: JWT-based secure access for users and administrators.

## Tech Stack

### Backend

- **Framework**: Django & Django REST Framework (DRF)
- **Database**: PostgreSQL (via Supabase)
- **AI Integration**: Google Gemini API
- **Authentication**: Simple JWT

### Frontend

- **Framework**: React (Vite)
- **Styling**: Vanilla CSS / Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks & Context API

---

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+ & npm
- Docker & Docker Compose
- Supabase project (PostgreSQL)
- Google Gemini API Key

---

### Docker Setup

Learnesia uses a hybrid Docker strategy to provide a production-ready environment while maintaining a smooth developer experience.

#### 🛠️ Local Development (with hot-reload)

Recommended for contributors. This setup uses Django's development server (`runserver`) with automatic code reloading.

```bash
# 1. Clone the repository
git clone https://github.com/fachry-isl/learnesia.git
cd learnesia

# 2. Configure environment variables (see Environment Variables section)

# 3. Start containers
docker compose up --build
```

- **Frontend**: `http://localhost:5173` (Vite dev server)
- **Backend**: `http://localhost:8000` (`python manage.py runserver`)
- **Hot-Reload**: Enabled via Docker volumes.

#### 🚀 Production Deployment

Optimized for performance and security. This setup uses **Gunicorn** as the WSGI server.

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

- **Frontend**: `http://localhost:80` (Nginx serving production build)
- **Backend**: `http://localhost:8000` (Gunicorn with multiple workers)
- **Strategy**: The base `Dockerfile` defaults to Gunicorn for security, which is overridden by the development `docker-compose.yml` for productivity.

---

### Local Setup

#### Backend Setup

1. Navigate to the `backend/` directory.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure the `.env` file (refer to the Environment Variables section).
5. Run migrations and start the server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

#### Frontend Setup

1. Navigate to the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env` file.
4. Start the development server:
   ```bash
   npm run dev
   ```

---
