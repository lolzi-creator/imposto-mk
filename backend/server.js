const { createServer } = require('http');
const { Server } = require('socket.io');

const port = parseInt(process.env.PORT || '3001', 10);
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Room management
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create room
  socket.on('create-room', ({ roomCode, playerName, mafiaCount = 1 }) => {
    const room = {
      code: roomCode,
      admin: socket.id,
      players: [{ id: socket.id, name: playerName, isAdmin: true }],
      mafiaCount: mafiaCount || 1,
      gameState: 'lobby',
      phase: null,
      roles: [],
      votes: {},
      nightActions: {
        mafiaKill: null,
        mafiaVotes: {}, // Store votes from each mafia player
        policeInvestigate: null,
        doctorSave: null
      },
      day: 1
    };
    rooms.set(roomCode, room);
    socket.join(roomCode);
    socket.emit('room-created', { roomCode, playerId: socket.id });
    io.to(roomCode).emit('room-updated', room);
  });

  // Join room
  socket.on('join-room', ({ roomCode, playerName }) => {
    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit('room-error', { message: 'Собата не постои!' });
      return;
    }
    if (room.gameState !== 'lobby') {
      socket.emit('room-error', { message: 'Играта веќе започнала!' });
      return;
    }
    if (room.players.some(p => p.name === playerName)) {
      socket.emit('room-error', { message: 'Името е веќе заземено!' });
      return;
    }

    room.players.push({ id: socket.id, name: playerName, isAdmin: false });
    socket.join(roomCode);
    socket.emit('room-joined', { roomCode, playerId: socket.id });
    io.to(roomCode).emit('room-updated', room);
  });

  // Update mafia count
  socket.on('update-mafia-count', ({ roomCode, mafiaCount }) => {
    const room = rooms.get(roomCode);
    if (!room || room.admin !== socket.id) return;
    room.mafiaCount = mafiaCount;
    io.to(roomCode).emit('room-updated', room);
  });

  // Start game
  socket.on('start-game', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.admin !== socket.id) return;
    if (room.players.length < 5) {
      socket.emit('game-error', { message: 'Минимум 5 играчи!' });
      return;
    }

    // Assign roles
    const roles = ['mafia', 'police', 'doctor'];
    while (roles.length < room.players.length) roles.push('citizen');
    
    // Add second mafia if needed
    if (room.mafiaCount === 2 && roles.length > 3) {
      roles[3] = 'mafia';
    }

    // Shuffle
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }

    room.roles = room.players.map((player, index) => ({
      playerId: player.id,
      playerName: player.name,
      role: roles[index],
      alive: true
    }));

      room.gameState = 'roles';
      room.phase = 'roles';
      room.nightActions = { mafiaKill: null, mafiaVotes: {}, policeInvestigate: null, doctorSave: null };
      io.to(roomCode).emit('game-started', room);
  });

  // Mafia actions - voting system
  socket.on('mafia-kill', ({ roomCode, targetId }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    const mafiaPlayers = room.roles.filter(r => r.role === 'mafia' && r.alive);
    const isMafia = mafiaPlayers.some(m => m.playerId === socket.id);
    if (!isMafia) return;
    
    // Store vote from this mafia player (allow changing vote)
    if (!room.nightActions.mafiaVotes) {
      room.nightActions.mafiaVotes = {};
    }
    room.nightActions.mafiaVotes[socket.id] = targetId;
    
    // Count votes for each target
    const voteCounts = {};
    Object.values(room.nightActions.mafiaVotes).forEach((target) => {
      voteCounts[target] = (voteCounts[target] || 0) + 1;
    });
    
    // Check if all mafias have voted
    const allMafiasVoted = mafiaPlayers.length === Object.keys(room.nightActions.mafiaVotes).length;
    
    if (allMafiasVoted) {
      // Check if all mafias voted for the same target
      const uniqueTargets = Object.keys(voteCounts);
      const allAgreed = uniqueTargets.length === 1 && voteCounts[uniqueTargets[0]] === mafiaPlayers.length;
      
      if (allAgreed) {
        // All mafias agreed on the same target
        room.nightActions.mafiaKill = uniqueTargets[0];
        room.phase = 'night-police';
      } else {
        // Mafias voted for different targets - clear mafiaKill and stay in voting phase
        room.nightActions.mafiaKill = null;
        // Phase stays as 'night-mafia' - they need to vote again
      }
    } else {
      // Not all mafias have voted yet - clear mafiaKill
      room.nightActions.mafiaKill = null;
    }
    
    io.to(roomCode).emit('game-updated', room);
  });

  // Police actions
  socket.on('police-investigate', ({ roomCode, targetId }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    const policePlayer = room.roles.find(r => r.role === 'police' && r.playerId === socket.id);
    if (!policePlayer) return;
    
    const target = room.roles.find(r => r.playerId === targetId);
    const isMafia = target?.role === 'mafia';
    room.nightActions.policeInvestigate = { targetId, isMafia };
    socket.emit('police-result', { isMafia, targetName: target?.playerName });
    // Don't auto-advance phase - let police see result first
    // Phase will advance when admin clicks next-phase
    io.to(roomCode).emit('game-updated', room);
  });

  // Doctor actions
  socket.on('doctor-save', ({ roomCode, targetId }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    const doctorPlayer = room.roles.find(r => r.role === 'doctor' && r.playerId === socket.id);
    if (!doctorPlayer) return;
    
    room.nightActions.doctorSave = targetId;
    
    // Don't process night yet - let doctor see the result first
    // Night will be processed when admin clicks next phase
    io.to(roomCode).emit('game-updated', room);
  });

  // Vote
  socket.on('vote', ({ roomCode, targetId }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    room.votes[socket.id] = targetId;
    io.to(roomCode).emit('game-updated', room);
  });

  // Police continues to doctor phase
  socket.on('police-continue', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    const policePlayer = room.roles.find(r => r.role === 'police' && r.playerId === socket.id);
    if (!policePlayer || room.phase !== 'night-police') return;
    
    room.phase = 'night-doctor';
    io.to(roomCode).emit('game-updated', room);
  });

  // Doctor continues to day phase
  socket.on('doctor-continue', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    const doctorPlayer = room.roles.find(r => r.role === 'doctor' && r.playerId === socket.id);
    if (!doctorPlayer || room.phase !== 'night-doctor' || !room.nightActions.doctorSave) return;
    
    const killed = room.nightActions.mafiaKill;
    const saved = room.nightActions.doctorSave;
    
    if (killed && killed === saved) {
      room.nightResult = `Мафијата се обиде да убие ${room.roles.find(r => r.playerId === killed)?.playerName}, но докторот го спаси!`;
    } else if (killed) {
      const killedPlayer = room.roles.find(r => r.playerId === killed);
      if (killedPlayer) {
        killedPlayer.alive = false;
        room.nightResult = `${killedPlayer.playerName} беше убиен од мафијата!`;
      }
    } else {
      room.nightResult = 'Сите преживеале ноќта!';
    }

    room.gameState = 'day';
    room.phase = 'day';
    io.to(roomCode).emit('night-complete', room);
  });

  // Next day/night (admin only - for day phase to next night, and roles to first night)
  socket.on('next-phase', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.admin !== socket.id) return;

    // If we're in roles phase, start the first night
    if (room.phase === 'roles') {
      room.gameState = 'night';
      room.phase = 'night-mafia';
      room.day = 1;
      room.nightActions = { mafiaKill: null, mafiaVotes: {}, policeInvestigate: null, doctorSave: null };
      room.nightResult = '';
      room.votes = {};
      io.to(roomCode).emit('game-updated', room);
      return;
    }

    // Check win conditions (only during day phase)
    if (room.phase === 'day') {
      const aliveMafia = room.roles.filter(r => r.role === 'mafia' && r.alive).length;
      const aliveCitizens = room.roles.filter(r => r.role !== 'mafia' && r.alive).length;

      if (aliveMafia === 0) {
        room.gameState = 'finished';
        room.winner = 'citizens';
        io.to(roomCode).emit('game-finished', room);
        return;
      }
      if (aliveMafia >= aliveCitizens) {
        room.gameState = 'finished';
        room.winner = 'mafia';
        io.to(roomCode).emit('game-finished', room);
        return;
      }

      // Next night
      room.day++;
      room.gameState = 'night';
      room.phase = 'night-mafia';
      room.nightActions = { mafiaKill: null, mafiaVotes: {}, policeInvestigate: null, doctorSave: null };
      room.nightResult = '';
      room.votes = {};
      io.to(roomCode).emit('game-updated', room);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove player from rooms
    for (const [code, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        if (room.players.length === 0) {
          rooms.delete(code);
        } else {
          io.to(code).emit('room-updated', room);
        }
      }
    }
  });
});

httpServer.listen(port, '0.0.0.0', (err) => {
  if (err) throw err;
  console.log(`🚀 Socket.io server running on port ${port}`);
  console.log(`📡 CORS enabled for: ${allowedOrigins.join(', ')}`);
});

