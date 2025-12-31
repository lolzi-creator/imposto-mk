# Deployment Guide

## 📁 Project Structure

The project is now split into:
- **Frontend** (`/` root) - Next.js app (can deploy to Netlify, Vercel, etc.)
- **Backend** (`/backend`) - Socket.io server (needs WebSocket support)

## 🚀 Quick Start

### 1. Deploy Backend (Socket.io Server)

The backend **MUST** be deployed to a platform that supports WebSockets.

#### Option A: Railway (Recommended) 🚂

1. **Push backend to GitHub** (or create a separate repo for backend)
2. Go to [railway.app](https://railway.app)
3. **New Project** → **Deploy from GitHub**
4. Select your repository
5. **Set Root Directory** to `backend` (if deploying from monorepo)
6. Railway will auto-detect Node.js
7. **Add Environment Variables**:
   ```
   PORT=3001
   ALLOWED_ORIGINS=https://your-frontend.netlify.app
   ```
8. Copy your backend URL (e.g., `https://your-backend.railway.app`)

#### Option B: Render 🎨

1. Go to [render.com](https://render.com)
2. **New** → **Web Service**
3. Connect GitHub repo
4. **Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
5. **Environment Variables**:
   ```
   PORT=3001
   ALLOWED_ORIGINS=https://your-frontend.netlify.app
   ```
6. Deploy!

#### Option C: Fly.io ✈️

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. In `backend/` directory: `fly launch`
3. Follow prompts
4. Set environment variables in Fly dashboard
5. Deploy: `fly deploy`

### 2. Deploy Frontend (Next.js)

#### Option A: Netlify (Recommended for Frontend) 🌐

1. **Push code to GitHub**
2. Go to [netlify.com](https://netlify.com)
3. **Add new site** → **Import from Git**
4. Select your repository
5. **Build settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Base directory**: (leave empty, or set if in monorepo)
6. **Environment Variables**:
   ```
   NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app
   ```
7. Deploy!

#### Option B: Vercel (Recommended for Next.js) ▲

1. **Push code to GitHub**
2. Go to [vercel.com](https://vercel.com)
3. **Add New Project** → Import from GitHub
4. Select your repository
5. **Environment Variables**:
   ```
   NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app
   ```
6. Deploy!

#### Option C: Railway (Full Stack)

Deploy both frontend and backend on Railway:
1. Create two services in one project
2. **Service 1**: Backend (root: `backend`)
3. **Service 2**: Frontend (root: `/`)
4. Set `NEXT_PUBLIC_SOCKET_URL` to backend service URL

## 🔧 Local Development

### Run Backend

```bash
cd backend
npm install
npm run dev
# Backend runs on http://localhost:3001
```

### Run Frontend

```bash
# In root directory
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

### Environment Variables (Local)

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

**Backend** (`backend/.env`):
```env
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 📝 Environment Variables Summary

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `ALLOWED_ORIGINS` | CORS origins (comma-separated) | `https://your-app.netlify.app,https://your-app.vercel.app` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SOCKET_URL` | Backend Socket.io URL | `https://your-backend.railway.app` |

⚠️ **Important**: The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser!

## 🎯 Recommended Setup

**Best for most users:**
- **Frontend**: Netlify (free, easy, fast CDN)
- **Backend**: Railway (free tier, WebSocket support)

**Best for Next.js optimization:**
- **Frontend**: Vercel (made by Next.js creators)
- **Backend**: Railway

**Best for simplicity:**
- **Both**: Railway (one platform, two services)

## 🔍 Troubleshooting

### Connection Issues

1. **Check CORS**: Make sure `ALLOWED_ORIGINS` in backend includes your frontend URL
2. **Check URL**: Verify `NEXT_PUBLIC_SOCKET_URL` matches your backend URL exactly
3. **Check WebSocket**: Open browser console, look for connection errors

### CORS Errors

If you see CORS errors:
- Add your frontend URL to `ALLOWED_ORIGINS` in backend
- Make sure there's no trailing slash in URLs
- Check that both HTTP and HTTPS are allowed if needed

### Environment Variables Not Working

- **Frontend**: Variables must start with `NEXT_PUBLIC_` to be accessible in browser
- **Backend**: Restart server after changing environment variables
- **Netlify/Vercel**: Redeploy after adding environment variables

## 📦 Build Commands

### Frontend
```bash
npm run build    # Build for production
npm start        # Run production build
```

### Backend
```bash
cd backend
npm start        # Run production server
```

## 🎉 You're Done!

Once both are deployed:
1. Backend URL: `https://your-backend.railway.app`
2. Frontend URL: `https://your-app.netlify.app`
3. Set `NEXT_PUBLIC_SOCKET_URL` in frontend to backend URL
4. Test the online multiplayer!

## Need Help?

- Check server logs in your hosting platform
- Verify environment variables are set correctly
- Test locally first to ensure everything works
- Check browser console for connection errors
