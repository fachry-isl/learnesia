# Learnesia

Learnesia is a modern, AI-powered course generation platform designed for educators and content creators. It streamlines the process of creating, managing, and delivering structured educational content with ease.

## 🚀 Key Features

- **AI-Powered Generation**: Instantly generate comprehensive course outlines and lesson content.
- **Structured Learning**: Organize lessons with clear objectives and structured modules.
- **Rich Content Management**: Easily manage references including links, documents, and videos.
- **Versatile Status Tracking**: Manage your content lifecycle with Draft, Published, and Template statuses.
- **Seamless Editor**: A intuitive interface for lesson structure and content editing.

## 🛠 Tech Stack

### Backend

- **Framework**: Django & Django REST Framework
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT (JSON Web Tokens)

### Frontend

- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **UI Components**: Modern, responsive design

## ⚡ Quick Start

### Prerequisites

- Python 3.x
- Node.js & npm

### Backend Setup

1. Navigate to `backend/`
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure your `.env` file (refer to settings for required variables).
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

Built with ❤️ by the Learnesia Team.
