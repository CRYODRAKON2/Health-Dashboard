# Health Dashboard Setup Guide

This guide will walk you through setting up the complete Health Dashboard application.

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Supabase account
- Google Cloud API key (for Gemini 2.0)

## Step 1: Supabase Setup

1. **Create a new Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and API keys

2. **Enable pgvector extension**
   - Go to your Supabase dashboard
   - Navigate to Database → Extensions
   - Enable the `vector` extension

3. **Set up database tables**
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `backend/setup_database.sql`
   - Run the script to create all tables and policies

4. **Configure Authentication**
   - Go to Authentication → Settings
   - Enable Email/Password authentication
   - Configure any additional auth providers if needed

5. **Set up Storage**
   - Go to Storage in your Supabase dashboard
   - The `documents` bucket should be created automatically by the SQL script
   - Verify the bucket exists and is public

## Step 2: Google Cloud Setup

1. **Create a Google Cloud project**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create a new project or select existing one

2. **Enable Gemini API**
   - Go to APIs & Services → Library
   - Search for "Gemini API" and enable it

3. **Create API key**
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "API Key"
   - Copy the API key

## Step 3: Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and fill in your values:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GEMINI_API_KEY=your_gemini_api_key
   SECRET_KEY=your_secret_key_here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   DATABASE_URL=postgresql://postgres:password@localhost:5432/health_dashboard
   ALLOWED_ORIGINS=http://localhost:3000
   ```

5. **Run the backend**
   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`

## Step 4: Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and fill in your values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the frontend**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Step 5: Testing the Application

1. **Open the application**
   - Go to `http://localhost:3000`
   - You should see the login/register page

2. **Create an account**
   - Click "Sign up" and create a new account
   - Verify your email if required

3. **Test the features**
   - **Vitals**: Add some test vitals data
   - **Documents**: Upload a PDF or TXT file
   - **Chat**: Ask the AI assistant questions

## Step 6: Deployment

### Frontend Deployment (Netlify)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `.next`
   - Add environment variables in Netlify dashboard

### Backend Deployment (Render)

1. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Create a new Web Service
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables in Render dashboard

2. **Update frontend API URL**
   - Update `NEXT_PUBLIC_API_URL` in your frontend environment variables
   - Redeploy the frontend

## Troubleshooting

### Common Issues

1. **CORS errors**
   - Make sure `ALLOWED_ORIGINS` includes your frontend URL
   - Check that the backend is running and accessible

2. **Authentication errors**
   - Verify Supabase credentials are correct
   - Check that email confirmation is not required or has been completed

3. **File upload issues**
   - Ensure the `documents` storage bucket exists in Supabase
   - Check storage policies are correctly set

4. **AI chat not working**
   - Verify Gemini API key is correct
   - Check that the API is enabled in Google Cloud Console

### Debug Mode

To run in debug mode:

**Backend:**
```bash
uvicorn main:app --reload --log-level debug
```

**Frontend:**
```bash
npm run dev
# Check browser console for errors
```

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use secure, randomly generated values for `SECRET_KEY`

2. **API Keys**
   - Keep your API keys secure
   - Use environment variables for all sensitive data

3. **Database Security**
   - Row Level Security (RLS) is enabled by default
   - Users can only access their own data

## Support

If you encounter any issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that all services (Supabase, Google Cloud) are properly configured

## Next Steps

Once the basic setup is working, you can:

1. **Customize the UI**: Modify the TailwindCSS classes and components
2. **Add more features**: Implement additional health tracking features
3. **Enhance AI capabilities**: Add more sophisticated RAG features
4. **Improve security**: Add additional authentication methods
5. **Scale the application**: Add caching, load balancing, etc.
