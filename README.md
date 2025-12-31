# Impostor Games - Macedonian Edition

A collection of party games in Macedonian, including Impostor, Mafia, and HeadsUp with online multiplayer support.

## 🎮 Games

- **Impostor** - Find the impostor among players
- **Mafia** - Social deduction game with roles (Mafia, Police, Doctor, Citizens)
- **HeadsUp** - Word guessing game

## 🚀 Features

- ✅ Offline mode - Play on a single device
- ✅ Online multiplayer - Real-time games with friends
- ✅ Beautiful dark theme UI
- ✅ 300+ Macedonian words with clues
- ✅ Professional design

## 📁 Project Structure

```
/
├── app/              # Next.js frontend
│   ├── hooks/        # React hooks (useSocket)
│   ├── page.tsx      # Main game component
│   └── words.ts      # Word database
├── backend/          # Socket.io server
│   └── server.js     # Game server
└── ...
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd imposto-mk
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up environment variables**

   Create `.env.local` in root:
   ```env
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   ```

   Create `backend/.env`:
   ```env
   PORT=3001
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

## 🎯 Development

### Run Locally

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📦 Build

### Frontend
```bash
npm run build
npm start
```

### Backend
```bash
cd backend
npm start
```

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Summary:**
- **Frontend**: Deploy to Netlify/Vercel
- **Backend**: Deploy to Railway/Render (needs WebSocket support)

## 🎨 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Socket.io
- **Styling**: Tailwind CSS with custom dark theme

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Feel free to submit issues or pull requests.
