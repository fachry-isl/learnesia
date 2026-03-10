[![CI/CD Deployment](https://github.com/fachry-isl/learnesia/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/fachry-isl/learnesia/actions/workflows/deploy.yml) [![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

# Learnesia

Learnesia is an AI-powered course generation platform designed for educators, content creators, and curious learners alike. It automates the creation and management of structured educational content using Google Gemini, transforming raw ideas into well-organized, curriculum-ready courses in minutes.

Beyond content creation tools, Learnesia democratizes learning by curating structured courses from freely available internet resources — so anyone can learn anything without the barrier of expensive platforms or scattered, unorganized materials. Whether you're an educator building a course from scratch or a self-learner looking for a guided path through a new subject, Learnesia turns the vast knowledge of the internet into a coherent, accessible learning experience tailored to your goals.

## Preview

🌐 **Live Demo**: [https://learnesia.co.id](https://learnesia.co.id)

|            Public Page            |           Admin Page            |
| :-------------------------------: | :-----------------------------: |
| ![public](./demo/public_page.gif) | ![admin](./demo/admin_page.gif) |

## Key Features

- **AI Course Generation**: Generate course outlines, lesson content, and quizzes using Google Gemini.
- **Structured Learning**: Organize lessons into modules with clear objectives.
- **Content Management**: Manage lesson resources including external links, document attachments, and video embeds.
- **Content Lifecycle**: Track progress with Draft, Published, and Template statuses.
- **Lesson Editor**: Interface for refining and editing generated content.
- **Security & Obfuscation**: Custom admin paths and secret keys to harden the platform.
- **Authentication**: JWT-based secure access for administrators.

## Tech Stack

### Backend

- **Framework**: Django & Django REST Framework (DRF)
- **Database**: PostgreSQL (via Supabase)
- **AI Integration**: Google Gemini API
- **Authentication**: JWT for Admin Page
- **Production Server**: Gunicorn with Uvicorn workers (ASGI)
- **Static Files**: WhiteNoise

### Frontend

- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **State Management**: React Hooks & Context API
- **Routing**: React Router 7

---

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 22+ & npm
- Docker & Docker Compose
- Supabase account (PostgreSQL)
- Google Gemini API Key

---

## Docker Setup

Learnesia uses a hybrid Docker strategy to provide a production-ready environment while maintaining a smooth developer experience.

#### 🛠️ Local Development (with hot-reload)

Recommended for contributors. This setup uses Django's development server (`runserver`) and Vite's dev server with automatic code reloading.

```bash
# 1. Clone the repository
git clone https://github.com/fachry-isl/learnesia.git
cd learnesia

# 2. Configure environment variables
# Copy .env.example to .env in both /backend and /frontend directories.

# 3. Start containers
docker compose up --build
```

- **Frontend**: `http://localhost:5173` (Vite dev server)
- **Backend**: `http://localhost:8000` (`python manage.py runserver`)
- **Hot-Reload**: Enabled via Docker volumes.

#### 🚀 Production Deployment

Optimized for performance and security. This setup uses **Gunicorn** as the application server and **Nginx** for the frontend.

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

- **Frontend**: `http://localhost:80` (Nginx serving production build)
- **Backend**: `http://localhost:8000` (Gunicorn with Uvicorn workers)

---

## Environment Variables & Security

### Admin Path Obfuscation

To harden the admin interface, Learnesia uses environment-based path obfuscation.

**Frontend (`frontend/.env`)**:

```env
VITE_ADMIN_PATH=/your-custom-path
VITE_ADMIN_SECRET_KEY=your-secret-key-here
```

**Backend (`backend/.env`)**:

```env
# Standard Django/DB configs
SECRET_KEY=...
DB_NAME=...
GEMINI_API_KEY=...

# Allowed Hosts & CORS
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## 📄 License

This project is licensed under the AGPL v3 License.
