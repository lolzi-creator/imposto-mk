# Backend Server

Socket.io server for the Impostor game multiplayer functionality.

## Setup

```bash
cd backend
npm install
```

## Run

```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins (default: http://localhost:3000)

Example:
```env
PORT=3001
ALLOWED_ORIGINS=https://your-frontend.netlify.app,https://your-frontend.vercel.app
```

## Deployment

Deploy to any platform that supports Node.js and WebSockets:
- Railway
- Render
- Fly.io
- DigitalOcean
- Heroku

Make sure to set `ALLOWED_ORIGINS` to your frontend URL(s) in production!

