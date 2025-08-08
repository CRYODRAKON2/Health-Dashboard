# Personal Health Dashboard

A full-stack personal health dashboard with AI-powered document analysis and health monitoring.

## Features

- 🔐 **Authentication**: Secure user registration and login with Supabase Auth
- 📊 **Health Dashboard**: Visualize vital signs and health metrics
- 📄 **Document Upload**: Upload and analyze medical documents with AI
- 🤖 **AI Health Assistant**: RAG-powered chatbot for health queries
- 📈 **Vitals Tracking**: Manual entry and visualization of health vitals
- 🎨 **Modern UI**: Clean, dark theme with TailwindCSS and shadcn/ui

## Tech Stack

### Frontend
- Next.js 14 (TypeScript)
- TailwindCSS
- shadcn/ui components
- Recharts for data visualization
- Supabase Auth client

### Backend
- FastAPI (Python)
- LangChain for RAG pipeline
- Gemini 2.0 API integration
- PDF parsing with PyMuPDF
- Vector embeddings with pgvector

### Database & Infrastructure
- Supabase (PostgreSQL + pgvector)
- Netlify (Frontend deployment)
- Render (Backend deployment)

## Project Structure

```
health-dashboard/
├── frontend/          # Next.js application
├── backend/           # FastAPI application
├── shared/            # Shared types and utilities
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- Supabase account
- Google Cloud API key (for Gemini 2.0)

### Environment Setup

1. **Supabase Setup**
   - Create a new Supabase project
   - Enable pgvector extension
   - Set up authentication
   - Create database tables

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Fill in your environment variables
   uvicorn main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Fill in your environment variables
   npm run dev
   ```

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Database Schema

### Tables
- `users` (managed by Supabase Auth)
- `vitals` (heart_rate, temperature, spo2, blood_pressure, user_id, created_at)
- `documents` (user_id, file_url, extracted_text, embedding, created_at)

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Vitals
- `GET /vitals` - Get user vitals
- `POST /vitals` - Create new vital entry
- `DELETE /vitals/{id}` - Delete vital entry

### Documents
- `POST /documents/upload` - Upload and process document
- `GET /documents` - Get user documents
- `DELETE /documents/{id}` - Delete document

### Chat
- `POST /chat` - AI health assistant chat

## Deployment

### Frontend (Netlify)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Backend (Render)
1. Connect GitHub repository
2. Set environment variables
3. Deploy as Python service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
