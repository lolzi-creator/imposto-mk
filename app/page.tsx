'use client';

import { useState, useEffect } from 'react';
import { ALL_WORDS } from './words';
import { useSocket } from './hooks/useSocket';
import { Socket } from 'socket.io-client';

type GameType = 'home' | 'impostor' | 'mafia' | 'headsup' | 'online-mafia' | 'online-impostor';
type GameMode = 'offline' | 'online';
type MafiaRole = 'mafia' | 'police' | 'doctor' | 'citizen';
type MafiaPhase = 'roles' | 'night-mafia' | 'night-police' | 'night-doctor' | 'day' | 'finished';
type HeadsUpSetupStep = 'instructions' | 'game';

export default function Home() {
  // Common state
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [gameType, setGameType] = useState<GameType>('home');
  const [playerCount, setPlayerCount] = useState(4);
  const [players, setPlayers] = useState<string[]>([]);
  
  // Online state
  const { socket, connected } = useSocket();
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [roomPlayers, setRoomPlayers] = useState<{ id: string; name: string; isAdmin: boolean }[]>([]);
  const [onlineMafiaCount, setOnlineMafiaCount] = useState(1);
  const [onlineImpostorCount, setOnlineImpostorCount] = useState(1);
  const [onlineGameType, setOnlineGameType] = useState<'mafia' | 'impostor' | null>(null);
  const [onlineGameState, setOnlineGameState] = useState<any>(null);
  const [myRole, setMyRole] = useState<MafiaRole | null>(null);
  const [policeResult, setPoliceResult] = useState<{ isMafia: boolean; targetName: string } | null>(null);
  const [policeSearching, setPoliceSearching] = useState(false);
  const [doctorSaveConfirmed, setDoctorSaveConfirmed] = useState(false);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [myVote, setMyVote] = useState<string | null>(null);
  
  // Impostor state
  const [setupStep, setSetupStep] = useState<'players' | 'impostors' | 'names' | 'game'>('players');
  const [impostorCount, setImpostorCount] = useState(1);
  const [currentWord, setCurrentWord] = useState({ word: '', clue: '' });
  const [impostorIndices, setImpostorIndices] = useState<number[]>([]);
  const [firstPlayer, setFirstPlayer] = useState('');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [cardRevealed, setCardRevealed] = useState(false);
  
  // Mafia state
  const [mafiaSetupStep, setMafiaSetupStep] = useState<'players' | 'names' | 'game'>('players');
  const [mafiaRoles, setMafiaRoles] = useState<{ player: string; role: MafiaRole; alive: boolean }[]>([]);
  const [mafiaPlayerIndex, setMafiaPlayerIndex] = useState(0);
  const [mafiaCardRevealed, setMafiaCardRevealed] = useState(false);
  const [mafiaPhase, setMafiaPhase] = useState<MafiaPhase>('roles');
  const [mafiaKillTarget, setMafiaKillTarget] = useState<number | null>(null);
  const [mafiaPoliceTarget, setMafiaPoliceTarget] = useState<number | null>(null);
  const [mafiaPoliceResult, setMafiaPoliceResult] = useState<string>('');
  const [mafiaDoctorTarget, setMafiaDoctorTarget] = useState<number | null>(null);
  const [mafiaNightResult, setMafiaNightResult] = useState<string>('');
  const [mafiaDay, setMafiaDay] = useState(1);
  
  // HeadsUp state
  const [headsupSetupStep, setHeadsupSetupStep] = useState<HeadsUpSetupStep>('instructions');
  const [headsupCurrentWord, setHeadsupCurrentWord] = useState({ word: '', clue: '' });
  const [headsupShowWord, setHeadsupShowWord] = useState(false);
  const [headsupScore, setHeadsupScore] = useState(0);
  const [headsupFlashColor, setHeadsupFlashColor] = useState<string | null>(null);

  const handlePlayerChange = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const selectPlayerCount = (count: number) => {
    setPlayerCount(count);
    setSetupStep('impostors');
  };

  const selectImpostorCount = (count: number) => {
    if (count >= playerCount) {
      alert('Бројот на impostors не може да биде поголем или еднаков на бројот на играчи!');
      return;
    }
    setImpostorCount(count);
    setPlayers(Array(playerCount).fill(''));
    setSetupStep('names');
  };

  const startGame = () => {
    if (players.some(p => !p.trim())) {
      alert('Ве молиме внесете ги сите имиња!');
      return;
    }

    const randomWord = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)];
    
    // Select random impostor indices
    const indices: number[] = [];
    while (indices.length < impostorCount) {
      const randomIndex = Math.floor(Math.random() * playerCount);
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }
    
    const randomFirst = players[Math.floor(Math.random() * playerCount)];

    setCurrentWord(randomWord);
    setImpostorIndices(indices);
    setFirstPlayer(randomFirst);
    setSetupStep('game');
    setCurrentPlayerIndex(0);
    setShowCard(false);
    setCardRevealed(false);
  };

  const handleNextPlayer = () => {
    setCurrentPlayerIndex(currentPlayerIndex + 1);
    setShowCard(false);
    setCardRevealed(false);
  };

  const playAgain = () => {
    if (players.length === 0) {
      resetGame();
      return;
    }

    const randomWord = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)];
    
    const indices: number[] = [];
    while (indices.length < impostorCount) {
      const randomIndex = Math.floor(Math.random() * playerCount);
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }
    
    const randomFirst = players[Math.floor(Math.random() * playerCount)];

    setCurrentWord(randomWord);
    setImpostorIndices(indices);
    setFirstPlayer(randomFirst);
    setSetupStep('game');
    setCurrentPlayerIndex(0);
    setShowCard(false);
    setCardRevealed(false);
  };

  // Mafia functions
  const selectMafiaPlayerCount = (count: number) => {
    if (count < 5) {
      alert('Mafia бара минимум 5 играчи!');
      return;
    }
    setPlayerCount(count);
    setPlayers(Array(count).fill(''));
    setMafiaSetupStep('names');
  };

  const startMafiaGame = () => {
    if (players.some(p => !p.trim())) {
      alert('Ве молиме внесете ги сите имиња!');
      return;
    }

    // Always: 1 mafia, 1 police, 1 doctor, rest citizens
    const roles: MafiaRole[] = ['mafia', 'police', 'doctor'];
    while (roles.length < playerCount) roles.push('citizen');
    
    // Shuffle roles
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }
    
    const assignedRoles = players.map((player, index) => ({
      player,
      role: roles[index],
      alive: true
    }));
    
    setMafiaRoles(assignedRoles);
    setMafiaSetupStep('game');
    setMafiaPhase('roles');
    setMafiaPlayerIndex(0);
    setMafiaCardRevealed(false);
    setMafiaDay(1);
    setMafiaKillTarget(null);
    setMafiaPoliceTarget(null);
    setMafiaDoctorTarget(null);
  };

  const handleMafiaNextPlayer = () => {
    if (mafiaPhase === 'roles') {
      if (mafiaPlayerIndex < playerCount - 1) {
        setMafiaPlayerIndex(mafiaPlayerIndex + 1);
        setMafiaCardRevealed(false);
      } else {
        // All roles shown, start night
        setMafiaPhase('night-mafia');
        const mafiaIndex = mafiaRoles.findIndex(r => r.role === 'mafia' && r.alive);
        setMafiaPlayerIndex(mafiaIndex);
        setMafiaCardRevealed(false);
      }
    }
  };

  const handleMafiaKill = (targetIndex: number) => {
    setMafiaKillTarget(targetIndex);
    setMafiaPhase('night-police');
    // Find police player
    const policeIndex = mafiaRoles.findIndex(r => r.role === 'police' && r.alive);
    setMafiaPlayerIndex(policeIndex);
  };

  const handleMafiaPoliceInvestigate = (targetIndex: number) => {
    setMafiaPoliceTarget(targetIndex);
    const targetRole = mafiaRoles[targetIndex];
    const isMafia = targetRole.role === 'mafia';
    setMafiaPoliceResult(isMafia ? 'Мафија' : 'Не е мафија');
  };

  const handleMafiaPoliceContinue = () => {
    setMafiaPhase('night-doctor');
    const doctorIndex = mafiaRoles.findIndex(r => r.role === 'doctor' && r.alive);
    setMafiaPlayerIndex(doctorIndex);
  };

  const handleMafiaDoctorSave = (targetIndex: number) => {
    setMafiaDoctorTarget(targetIndex);
    // Process night actions
    const killed = mafiaKillTarget;
    const saved = targetIndex;
    
    let result = '';
    if (killed !== null) {
      if (killed === saved) {
        result = `Мафијата се обиде да убие ${mafiaRoles[killed].player}, но докторот го спаси!`;
      } else {
        result = `${mafiaRoles[killed].player} беше убиен од мафијата!`;
        const newRoles = [...mafiaRoles];
        newRoles[killed].alive = false;
        setMafiaRoles(newRoles);
      }
    }
    
    setMafiaNightResult(result);
    setMafiaPhase('day');
  };

  const handleMafiaNextDay = () => {
    // Check win conditions
    const aliveMafia = mafiaRoles.filter(r => r.role === 'mafia' && r.alive).length;
    const aliveCitizens = mafiaRoles.filter(r => r.role !== 'mafia' && r.alive).length;
    
    if (aliveMafia === 0) {
      setMafiaPhase('finished');
      setMafiaNightResult('Граѓаните победија!');
    } else if (aliveMafia >= aliveCitizens) {
      setMafiaPhase('finished');
      setMafiaNightResult('Мафијата победи!');
    } else {
      // Next night
      setMafiaDay(mafiaDay + 1);
      setMafiaPhase('night-mafia');
      const mafiaIndex = mafiaRoles.findIndex(r => r.role === 'mafia' && r.alive);
      setMafiaPlayerIndex(mafiaIndex);
    setMafiaKillTarget(null);
    setMafiaPoliceTarget(null);
    setMafiaPoliceResult('');
    setMafiaDoctorTarget(null);
    setMafiaNightResult('');
    }
  };

  // HeadsUp functions
  const startHeadsupGame = () => {
    setHeadsupSetupStep('game');
    setHeadsupScore(0);
    setHeadsupShowWord(false);
    const randomWord = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)];
    setHeadsupCurrentWord(randomWord);
  };

  const handleHeadsupCorrect = () => {
    setHeadsupScore((prev) => prev + 1);
    setHeadsupFlashColor('green');
    setTimeout(() => setHeadsupFlashColor(null), 300);
    const randomWord = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)];
    setHeadsupCurrentWord(randomWord);
  };

  const handleHeadsupSkip = () => {
    setHeadsupFlashColor('red');
    setTimeout(() => setHeadsupFlashColor(null), 300);
    const randomWord = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)];
    setHeadsupCurrentWord(randomWord);
  };

  const resetGame = () => {
    setGameType('home');
    setSetupStep('players');
    setMafiaSetupStep('players');
    setHeadsupSetupStep('instructions');
    setPlayerCount(4);
    setImpostorCount(1);
    setPlayers([]);
    setShowCard(false);
    setCardRevealed(false);
    setCurrentWord({ word: '', clue: '' });
    setImpostorIndices([]);
    setFirstPlayer('');
    setCurrentPlayerIndex(0);
    setMafiaRoles([]);
    setMafiaPlayerIndex(0);
    setMafiaCardRevealed(false);
    setMafiaPhase('roles');
    setMafiaKillTarget(null);
    setMafiaPoliceTarget(null);
    setMafiaPoliceResult('');
    setMafiaDoctorTarget(null);
    setMafiaNightResult('');
    setMafiaDay(1);
    setHeadsupCurrentWord({ word: '', clue: '' });
    setHeadsupShowWord(false);
    setHeadsupScore(0);
    setHeadsupFlashColor(null);
  };

  // Generate room code
  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    socket.on('room-created', ({ roomCode: code, playerId }) => {
      setRoomCode(code);
      setIsAdmin(true);
      // onlineGameState will be set by room-updated event
    });

    socket.on('room-joined', ({ roomCode: code, playerId }) => {
      setRoomCode(code);
      setIsAdmin(false);
    });

    socket.on('room-updated', (room) => {
      setRoomPlayers(room.players);
      setOnlineMafiaCount(room.mafiaCount || 1);
      setOnlineImpostorCount(room.impostorCount || 1);
      if (room.gameType) {
        setOnlineGameType(room.gameType);
      }
      setOnlineGameState(room); // Set game state so lobby can render
    });

    socket.on('room-error', ({ message }) => {
      alert(message);
    });

    socket.on('game-started', (room) => {
      setOnlineGameState(room);
      if (room.gameType === 'mafia') {
        const myRoleData = room.roles.find((r: any) => r.playerId === socket.id);
        if (myRoleData) {
          setMyRole(myRoleData.role);
        }
        setGameType('online-mafia');
      } else if (room.gameType === 'impostor') {
        setGameType('online-impostor');
        // Use the word index from server to ensure all players have the same word
        const wordIndex = room.wordIndex !== undefined ? room.wordIndex : Math.floor(Math.random() * ALL_WORDS.length);
        setCurrentWord(ALL_WORDS[wordIndex % ALL_WORDS.length]);
      }
    });

    socket.on('game-updated', (room) => {
      setOnlineGameState(room);
      setVotes(room.votes || {});
    });

    socket.on('police-result', ({ isMafia, targetName }) => {
      setPoliceSearching(false);
      setPoliceResult({ isMafia, targetName });
    });

    socket.on('night-complete', (room) => {
      setOnlineGameState(room);
      setPoliceResult(null); // Reset police result for next night
      setPoliceSearching(false);
      setDoctorSaveConfirmed(false);
    });

    socket.on('game-finished', (room) => {
      setOnlineGameState(room);
    });

    return () => {
      socket.off('room-created');
      socket.off('room-joined');
      socket.off('room-updated');
      socket.off('room-error');
      socket.off('game-started');
      socket.off('game-updated');
      socket.off('police-result');
      socket.off('night-complete');
      socket.off('game-finished');
    };
  }, [socket]);

  // HeadsUp gyroscope/accelerometer tilt detection
  useEffect(() => {
    // Only activate when HeadsUp game is active and word is shown
    if (gameType !== 'headsup' || headsupSetupStep !== 'game' || !headsupShowWord) {
      return;
    }

    let lastTiltTime = 0;
    const TILT_THRESHOLD = 30; // degrees
    const DEBOUNCE_TIME = 500; // milliseconds

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const now = Date.now();
      if (now - lastTiltTime < DEBOUNCE_TIME) return;

      // beta is the front-to-back tilt in degrees (-180 to 180)
      // Positive beta = tilted back (up) = correct
      // Negative beta = tilted forward (down) = skip
      const beta = event.beta || 0;

      if (beta > TILT_THRESHOLD) {
        // Tilted up - mark as correct
        lastTiltTime = now;
        setHeadsupScore((prev) => prev + 1);
        setHeadsupFlashColor('green');
        setTimeout(() => setHeadsupFlashColor(null), 300);
        const randomWord = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)];
        setHeadsupCurrentWord(randomWord);
      } else if (beta < -TILT_THRESHOLD) {
        // Tilted down - skip
        lastTiltTime = now;
        setHeadsupFlashColor('red');
        setTimeout(() => setHeadsupFlashColor(null), 300);
        const randomWord = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)];
        setHeadsupCurrentWord(randomWord);
      }
    };

    // Request permission for iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation as EventListener);
          }
        })
        .catch(() => {
          // Permission denied or not supported
        });
    } else if (typeof DeviceOrientationEvent !== 'undefined') {
      // For Android and older iOS
      window.addEventListener('deviceorientation', handleOrientation as EventListener);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation as EventListener);
    };
  }, [gameType, headsupSetupStep, headsupShowWord]);

  // Homepage - Mode Selection
  if (gameType === 'home' && gameMode === null) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 tracking-tight">Игри</h1>
            <p className="text-gray-400 text-lg">Избери режим</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            <button
              onClick={() => setGameMode('offline')}
              className="bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8 hover:border-[#3b82f6] hover:bg-[#1e2433] transition-all"
            >
              <div className="text-4xl mb-4">📱</div>
              <h2 className="text-2xl font-bold text-white mb-2">Offline</h2>
              <p className="text-gray-400 text-sm">Локална игра на еден телефон</p>
            </button>

            <button
              onClick={() => setGameMode('online')}
              className="bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8 hover:border-[#3b82f6] hover:bg-[#1e2433] transition-all"
            >
              <div className="text-4xl mb-4">🌐</div>
              <h2 className="text-2xl font-bold text-white mb-2">Online</h2>
              <p className="text-gray-400 text-sm">Онлајн со пријатели</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Homepage - Game Selection (Offline)
  if (gameType === 'home' && gameMode === 'offline') {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <button
              onClick={() => setGameMode(null)}
              className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors mx-auto"
            >
              ← Назад
            </button>
            <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 tracking-tight">Игри</h1>
            <p className="text-gray-400 text-lg">Избери игра</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <button
              onClick={() => {
                setGameType('impostor');
                setSetupStep('players');
              }}
              className="bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8 hover:border-[#3b82f6] hover:bg-[#1e2433] transition-all group"
            >
              <div className="text-4xl mb-4">🕵️</div>
              <h2 className="text-2xl font-bold text-white mb-2">Impostor</h2>
              <p className="text-gray-400 text-sm">Најдете го impostor-от</p>
            </button>

            <button
              onClick={() => {
                setGameType('mafia');
                setMafiaSetupStep('players');
              }}
              className="bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8 hover:border-[#3b82f6] hover:bg-[#1e2433] transition-all group"
            >
              <div className="text-4xl mb-4">🎭</div>
              <h2 className="text-2xl font-bold text-white mb-2">Mafia</h2>
              <p className="text-gray-400 text-sm">Социјална дедукција</p>
            </button>

            <button
              onClick={() => {
                setGameType('headsup');
                setHeadsupSetupStep('instructions');
              }}
              className="bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8 hover:border-[#3b82f6] hover:bg-[#1e2433] transition-all group"
            >
              <div className="text-4xl mb-4">💭</div>
              <h2 className="text-2xl font-bold text-white mb-2">HeadsUp</h2>
              <p className="text-gray-400 text-sm">Погоди го зборот</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Online Mode - Game Selection
  if (gameMode === 'online' && !onlineGameType) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
          <button
            onClick={() => setGameMode(null)}
            className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
          >
            ← Назад
          </button>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Online Игри</h2>
            <p className="text-gray-400">Избери игра</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              onClick={() => setOnlineGameType('impostor')}
              className="bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8 hover:border-[#3b82f6] hover:bg-[#1e2433] transition-all"
            >
              <div className="text-4xl mb-4">🕵️</div>
              <h2 className="text-2xl font-bold text-white mb-2">Impostor</h2>
              <p className="text-gray-400 text-sm">Најдете го impostor-от</p>
            </button>

            <button
              onClick={() => setOnlineGameType('mafia')}
              className="bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8 hover:border-[#3b82f6] hover:bg-[#1e2433] transition-all"
            >
              <div className="text-4xl mb-4">🎭</div>
              <h2 className="text-2xl font-bold text-white mb-2">Mafia</h2>
              <p className="text-gray-400 text-sm">Социјална дедукција</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Online Mode - Room Selection
  if (gameMode === 'online' && onlineGameType && !roomCode) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
          <button
            onClick={() => setOnlineGameType(null)}
            className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
          >
            ← Назад
          </button>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Online {onlineGameType === 'impostor' ? 'Impostor' : 'Mafia'}</h2>
            <p className="text-gray-400">Создај или приклучи се на соба</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Твоето име</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Внеси име"
                className="w-full px-4 py-3 bg-[#0a0e1a] border border-[#2d3441] rounded-xl focus:outline-none focus:border-[#3b82f6] text-white placeholder:text-gray-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  if (!playerName.trim()) {
                    alert('Внеси име!');
                    return;
                  }
                  if (!socket || !connected) {
                    alert('Не сте поврзани!');
                    return;
                  }
                  const code = generateRoomCode();
                  socket.emit('create-room', { roomCode: code, playerName, gameType: onlineGameType, mafiaCount: onlineGameType === 'mafia' ? 1 : undefined, impostorCount: onlineGameType === 'impostor' ? 1 : undefined });
                }}
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white py-4 rounded-xl text-lg font-bold transition-all"
              >
                Создај Соба
              </button>

              <button
                onClick={() => {
                  if (!playerName.trim()) {
                    alert('Внеси име!');
                    return;
                  }
                  const code = prompt('Внеси код на собата:');
                  if (code && socket && connected) {
                    socket.emit('join-room', { roomCode: code.toUpperCase(), playerName, gameType: onlineGameType });
                  }
                }}
                className="bg-[#2d3441] hover:bg-[#1a1f2e] text-white py-4 rounded-xl text-lg font-bold transition-all"
              >
                Приклучи Се
              </button>
            </div>

            {!connected && (
              <p className="text-red-400 text-sm text-center">Се поврзувам...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Online Mode - Lobby
  if (gameMode === 'online' && roomCode && (!onlineGameState || onlineGameState?.gameState === 'lobby')) {
    const gameType = onlineGameState?.gameType || onlineGameType;
    
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Соба: {roomCode}</h2>
            <p className="text-gray-400 text-sm">Играчи: {roomPlayers.length}</p>
          </div>

          {isAdmin && gameType === 'mafia' && (
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">Број на мафија</label>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      setOnlineMafiaCount(count);
                      if (socket) {
                        socket.emit('update-mafia-count', { roomCode, mafiaCount: count });
                      }
                    }}
                    className={`py-3 rounded-xl font-bold transition-all ${
                      onlineMafiaCount === count
                        ? 'bg-[#3b82f6] text-white'
                        : 'bg-[#2d3441] text-gray-300'
                    }`}
                  >
                    {count} Мафија
                  </button>
                ))}
              </div>
            </div>
          )}

          {isAdmin && gameType === 'impostor' && (
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">Број на impostors</label>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((count) => {
                  const isDisabled = count >= roomPlayers.length;
                  return (
                    <button
                      key={count}
                      onClick={() => {
                        if (!isDisabled) {
                          setOnlineImpostorCount(count);
                          if (socket) {
                            socket.emit('update-impostor-count', { roomCode, impostorCount: count });
                          }
                        }
                      }}
                      disabled={isDisabled}
                      className={`py-3 rounded-xl font-bold transition-all ${
                        isDisabled
                          ? 'bg-[#1a1f2e] border border-[#2d3441] text-gray-600 cursor-not-allowed'
                          : onlineImpostorCount === count
                          ? 'bg-[#3b82f6] text-white'
                          : 'bg-[#2d3441] text-gray-300'
                      }`}
                    >
                      {count}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-[#2d3441] p-6 rounded-xl mb-6">
            <p className="text-gray-300 text-sm mb-3 font-semibold">Играчи:</p>
            <div className="space-y-2">
              {roomPlayers.map((player, index) => (
                <div key={index} className="flex items-center justify-between text-white">
                  <span>{player.name}</span>
                  {player.isAdmin && <span className="text-[#3b82f6] text-xs">Admin</span>}
                </div>
              ))}
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                if (gameType === 'mafia' && roomPlayers.length < 5) {
                  alert('Минимум 5 играчи!');
                  return;
                }
                if (gameType === 'impostor' && roomPlayers.length < 3) {
                  alert('Минимум 3 играчи!');
                  return;
                }
                if (socket) {
                  socket.emit('start-game', { roomCode });
                }
              }}
              disabled={(gameType === 'mafia' && roomPlayers.length < 5) || (gameType === 'impostor' && roomPlayers.length < 3)}
              className="w-full bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl text-lg font-bold transition-all"
            >
              Почни Игра
            </button>
          )}

          {!isAdmin && (
            <p className="text-gray-400 text-sm text-center">Чекајте админот да започне играта...</p>
          )}
        </div>
      </div>
    );
  }

  // Online Mafia Game
  if (gameType === 'online-mafia' && onlineGameState) {
    const { phase, roles, nightResult, day, winner, nightActions } = onlineGameState;
    const myRoleData = roles?.find((r: any) => r.playerId === socket?.id);
    const alivePlayers = roles?.filter((r: any) => r.alive) || [];

    // Role reveal phase
    if (phase === 'roles') {
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Твојата улога</h2>
              <p className="text-gray-400 text-sm">Провери ја твојата улога</p>
            </div>

            <div className="bg-[#2d3441] p-6 rounded-xl mb-6">
              <div className="flex flex-col items-center">
                <div className="w-full max-w-xs mb-6">
                  {myRoleData?.role === 'mafia' && (
                    <img src="/mafia.jpeg" alt="Мафија" className="w-full aspect-[3/4] object-cover rounded-xl shadow-lg" />
                  )}
                  {myRoleData?.role === 'police' && (
                    <img src="/police.jpeg" alt="Полиција" className="w-full aspect-[3/4] object-cover rounded-xl shadow-lg" />
                  )}
                  {myRoleData?.role === 'doctor' && (
                    <img src="/doctor.jpeg" alt="Доктор" className="w-full aspect-[3/4] object-cover rounded-xl shadow-lg" />
                  )}
                  {myRoleData?.role === 'citizen' && (
                    <img src="/villager.jpeg" alt="Граѓанин" className="w-full aspect-[3/4] object-cover rounded-xl shadow-lg" />
                  )}
                </div>
                <p className="text-white text-xl font-bold text-center mb-4">{playerName}</p>
                <div className="w-12 h-0.5 bg-white/50 mx-auto my-4"></div>
                <p className="text-3xl font-bold text-center">
                  {myRoleData?.role === 'mafia' && <span className="text-red-500">Мафија</span>}
                  {myRoleData?.role === 'police' && <span className="text-blue-500">Полиција</span>}
                  {myRoleData?.role === 'doctor' && <span className="text-green-500">Доктор</span>}
                  {myRoleData?.role === 'citizen' && <span className="text-gray-400">Граѓанин</span>}
                </p>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  if (socket) {
                    socket.emit('next-phase', { roomCode });
                  }
                }}
                className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-4 rounded-xl text-lg font-bold transition-all"
              >
                Почни ноќ →
              </button>
            )}

            {!isAdmin && (
              <p className="text-gray-400 text-sm text-center">Чекајте админот да започне...</p>
            )}
          </div>
        </div>
      );
    }

    // Night Phase - Mafia
    if (phase === 'night-mafia' && myRole === 'mafia') {
      const mafiaPlayers = roles?.filter((r: any) => r.role === 'mafia' && r.alive) || [];
      const targets = alivePlayers.filter((r: any) => !mafiaPlayers.some((m: any) => m.playerId === r.playerId));
      const mafiaVotes = nightActions?.mafiaVotes || {};
      const myVote = mafiaVotes[socket?.id || ''];
      const killedTarget = nightActions?.mafiaKill ? roles?.find((r: any) => r.playerId === nightActions.mafiaKill) : null;

      // Count votes for display
      const voteCounts: Record<string, number> = {};
      Object.values(mafiaVotes).forEach((targetId: any) => {
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
      });

      // If all mafias voted and target is chosen
      if (killedTarget && mafiaPlayers.length === Object.keys(mafiaVotes).length) {
        return (
          <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Ноќ {day}</h2>
                <p className="text-gray-400">Мафија избира жртва</p>
              </div>

              <div className="bg-[#2d3441] p-8 rounded-xl mb-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏠</div>
                  <p className="text-white text-xl font-bold mb-2">{killedTarget.playerName}</p>
                  <p className="text-gray-400 text-sm">Не го убиваш граѓанинот дома</p>
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Ноќ {day}</h2>
              <p className="text-gray-400">Мафија гласа за жртва</p>
            </div>

            <div className="bg-[#2d3441] p-4 rounded-xl mb-6">
              <p className="text-gray-300 text-sm mb-3 font-semibold">Мафија ({mafiaPlayers.length}):</p>
              <div className="space-y-1">
                {mafiaPlayers.map((p: any) => {
                  const hasVoted = mafiaVotes[p.playerId];
                  return (
                    <p key={p.playerId} className={`text-sm ${p.playerId === socket?.id ? 'text-[#3b82f6] font-bold' : hasVoted ? 'text-green-400' : 'text-gray-400'}`}>
                      {p.playerName} {hasVoted ? '✓' : '...'}
                    </p>
                  );
                })}
              </div>
            </div>

            {mafiaPlayers.length > 1 && (
              <div className="bg-[#1a1f2e] p-4 rounded-xl mb-6">
                <p className="text-gray-400 text-sm text-center mb-2">Сите мафии мора да се согласат на една жртва</p>
                <p className="text-gray-500 text-xs text-center">Гласајте за истата личност</p>
                {Object.keys(mafiaVotes).length === mafiaPlayers.length && !killedTarget && (
                  <p className="text-red-400 text-xs text-center mt-2 font-bold">Не се согласни! Гласајте повторно за иста личност</p>
                )}
              </div>
            )}

            <p className="text-gray-400 text-center mb-6">
              {myVote ? 'Твојот глас (можеш да го промениш):' : 'Избери кого да убиете:'}
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {targets.map((target: any) => {
                const voteCount = voteCounts[target.playerId] || 0;
                const isMyVote = myVote === target.playerId;
                return (
                  <button
                    key={target.playerId}
                    onClick={() => {
                      if (socket) {
                        socket.emit('mafia-kill', { roomCode, targetId: target.playerId });
                      }
                    }}
                    className={`w-full py-3 rounded-xl text-lg font-medium transition-all ${
                      isMyVote
                        ? 'bg-red-600 text-white'
                        : voteCount > 0
                        ? 'bg-[#2d3441] text-white border-2 border-red-500'
                        : 'bg-[#2d3441] hover:bg-red-600 text-gray-300'
                    }`}
                  >
                    {target.playerName}
                    {voteCount > 0 && <span className="ml-2 text-sm">({voteCount}/{mafiaPlayers.length})</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Night Phase - Police
    if (phase === 'night-police' && myRole === 'police') {
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Ноќ {day}</h2>
              <p className="text-gray-400">Полиција истражува</p>
            </div>

            {policeSearching ? (
              <div className="bg-[#2d3441] p-8 rounded-xl mb-6">
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-pulse">🔍</div>
                  <p className="text-white text-xl font-bold mb-2">Истражувам...</p>
                  <p className="text-gray-400">Чекајте</p>
                </div>
              </div>
            ) : policeResult ? (
              <>
                <div className="bg-[#2d3441] p-8 rounded-xl mb-6">
                  <p className="text-white text-center mb-4 text-xl font-bold">Истражувавте: {policeResult.targetName}</p>
                  <div className="w-12 h-0.5 bg-white/50 mx-auto my-4"></div>
                  <div className="text-center">
                    {policeResult.isMafia ? (
                      <>
                        <div className="text-6xl mb-4">🔫</div>
                        <p className="text-2xl font-bold text-center text-red-500 mb-2">Мафија!</p>
                        <p className="text-gray-300 text-sm">Најдовте пиштол и нож со крв</p>
                      </>
                    ) : (
                      <>
                        <div className="text-6xl mb-4">🚬</div>
                        <p className="text-2xl font-bold text-center text-green-500 mb-2">Не е мафија</p>
                        <p className="text-gray-300 text-sm">Најдовте само цигари и запалка</p>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (socket) {
                      socket.emit('police-continue', { roomCode });
                      setPoliceResult(null);
                      setPoliceSearching(false);
                    }
                  }}
                  className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-4 rounded-xl text-lg font-bold transition-all"
                >
                  Продолжи →
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-400 text-center mb-6">Избери кого да истражуваш:</p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {alivePlayers
                    .filter((p: any) => p.playerId !== socket?.id)
                    .map((target: any) => (
                      <button
                        key={target.playerId}
                        onClick={() => {
                          if (socket) {
                            setPoliceSearching(true);
                            socket.emit('police-investigate', { roomCode, targetId: target.playerId });
                          }
                        }}
                        className="w-full bg-[#2d3441] hover:bg-[#3b82f6] text-white py-3 rounded-xl text-lg font-medium transition-all"
                      >
                        {target.playerName}
                      </button>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    // Night Phase - Doctor
    if (phase === 'night-doctor' && myRole === 'doctor') {
      const savedTarget = nightActions?.doctorSave ? roles?.find((r: any) => r.playerId === nightActions.doctorSave) : null;
      const killedTarget = nightActions?.mafiaKill ? roles?.find((r: any) => r.playerId === nightActions.mafiaKill) : null;
      const wasSaved = killedTarget && savedTarget && killedTarget.playerId === savedTarget.playerId;

      if (doctorSaveConfirmed && savedTarget) {
        return (
          <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Ноќ {day}</h2>
                <p className="text-gray-400">Доктор спасува</p>
              </div>

              <div className="bg-[#2d3441] p-8 rounded-xl mb-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">💉</div>
                  <p className="text-white text-xl font-bold mb-2">{savedTarget.playerName}</p>
                  {wasSaved ? (
                    <>
                      <p className="text-green-500 text-lg font-bold mb-2">Спасен!</p>
                      <p className="text-gray-300 text-sm">Мафијата се обиде да го убие, но ти го спаси!</p>
                    </>
                  ) : (
                    <>
                      <p className="text-green-500 text-lg font-bold mb-2">Заштитен</p>
                      <p className="text-gray-300 text-sm">Ти го заштити овој граѓанин</p>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  if (socket) {
                    socket.emit('doctor-continue', { roomCode });
                    setDoctorSaveConfirmed(false);
                  }
                }}
                className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-4 rounded-xl text-lg font-bold transition-all"
              >
                Продолжи →
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Ноќ {day}</h2>
              <p className="text-gray-400">Доктор спасува</p>
            </div>

            <p className="text-gray-400 text-center mb-6">Избери кого да спасиш:</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {alivePlayers.map((target: any) => (
                <button
                  key={target.playerId}
                  onClick={() => {
                    if (socket) {
                      socket.emit('doctor-save', { roomCode, targetId: target.playerId });
                      setDoctorSaveConfirmed(true);
                    }
                  }}
                  className="w-full bg-[#2d3441] hover:bg-[#10b981] text-white py-3 rounded-xl text-lg font-medium transition-all"
                >
                  {target.playerName}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Day Phase
    if (phase === 'day') {
      const voteCounts: Record<string, number> = {};
      Object.values(votes).forEach((targetId: any) => {
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
      });

      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Ден {day}</h2>
            </div>

            {nightResult && (
              <div className="bg-[#2d3441] p-6 rounded-xl mb-6">
                <p className="text-white text-center text-lg">{nightResult}</p>
              </div>
            )}

            <div className="bg-[#2d3441] p-6 rounded-xl mb-6">
              <p className="text-gray-300 text-sm mb-4 font-semibold">Гласајте кого да изгорите:</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {alivePlayers
                  .filter((p: any) => p.playerId !== socket?.id)
                  .map((target: any) => (
                    <button
                      key={target.playerId}
                      onClick={() => {
                        if (socket && !myVote) {
                          socket.emit('vote', { roomCode, targetId: target.playerId });
                          setMyVote(target.playerId);
                        }
                      }}
                      disabled={!!myVote}
                      className={`w-full py-3 rounded-xl text-lg font-medium transition-all ${
                        myVote === target.playerId
                          ? 'bg-[#3b82f6] text-white'
                          : votes[target.playerId]
                          ? 'bg-[#2d3441] text-white border border-[#3b82f6]'
                          : 'bg-[#2d3441] hover:bg-[#1a1f2e] text-gray-300'
                      }`}
                    >
                      {target.playerName}
                      {voteCounts[target.playerId] > 0 && (
                        <span className="ml-2 text-sm">({voteCounts[target.playerId]})</span>
                      )}
                    </button>
                  ))}
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  if (socket) {
                    socket.emit('next-phase', { roomCode });
                    setMyVote(null);
                    setPoliceResult(null);
                    setPoliceSearching(false);
                    setDoctorSaveConfirmed(false);
                  }
                }}
                className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-4 rounded-xl text-lg font-bold transition-all"
              >
                Следна ноќ →
              </button>
            )}

            {!isAdmin && (
              <p className="text-gray-400 text-sm text-center">Чекајте админот да продолжи...</p>
            )}
          </div>
        </div>
      );
    }

    // Game Finished
    if (onlineGameState.gameState === 'finished') {
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-white mb-3">Играта заврши!</h1>
              <p className="text-2xl font-bold mb-4">
                {winner === 'mafia' ? (
                  <span className="text-red-500">Мафијата победи!</span>
                ) : (
                  <span className="text-green-500">Граѓаните победија!</span>
                )}
              </p>
            </div>

            <div className="bg-[#2d3441] p-6 rounded-xl mb-6">
              <p className="text-gray-300 text-sm mb-3 font-semibold">Улоги:</p>
              <div className="space-y-2">
                {roles?.map((r: any) => (
                  <div key={r.playerId} className="flex items-center justify-between text-white text-sm">
                    <span>{r.playerName}</span>
                    <span className="text-gray-400">
                      {r.role === 'mafia' && 'Мафија'}
                      {r.role === 'police' && 'Полиција'}
                      {r.role === 'doctor' && 'Доктор'}
                      {r.role === 'citizen' && 'Граѓанин'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setGameType('home');
                setGameMode(null);
                setOnlineGameType(null);
                setRoomCode('');
                setOnlineGameState(null);
                setMyRole(null);
                setMyVote(null);
                setPoliceResult(null);
                setCardRevealed(false);
              }}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-4 rounded-xl text-lg font-bold transition-all"
            >
              Назад на почеток
            </button>
          </div>
        </div>
      );
    }

    // Waiting for other players' actions
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Ноќ {day}</h2>
            <p className="text-gray-400">Чекајте другите играчи...</p>
          </div>
        </div>
      </div>
    );
  }

  // Online Impostor Game
  if (gameType === 'online-impostor' && onlineGameState) {
    const { playerCards, firstPlayer: onlineFirstPlayer, phase, cardsSeen } = onlineGameState;
    const myCard = playerCards?.find((c: any) => c.playerId === socket?.id);
    const isImpostor = myCard?.isImpostor || false;
    const totalPlayers = playerCards?.length || 0;
    const playersSeenCount = cardsSeen ? Object.keys(cardsSeen).length : 0;
    const iHaveSeen = cardsSeen?.[socket?.id || ''] || false;

    // Card reveal phase
    if (phase === 'cards') {
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Твојата карта</h2>
              <p className="text-gray-400 text-sm">Провери ја твојата карта</p>
            </div>

            <div className="bg-[#2d3441] p-6 rounded-xl mb-6">
              <div className="flex flex-col items-center">
                <div
                  onClick={() => setCardRevealed(!cardRevealed)}
                  className="w-full aspect-[3/4] bg-[#1a1f2e] border-2 border-[#3b82f6] rounded-2xl cursor-pointer flex items-center justify-center p-8 transition-all hover:bg-[#0a0e1a] mb-6"
                >
                  {!cardRevealed ? (
                    <div className="text-center text-white">
                      <div className="text-6xl mb-4">🎴</div>
                      <p className="text-xl font-bold">Притисни за откривање</p>
                    </div>
                  ) : (
                    <div className="text-center text-white px-4">
                      {isImpostor ? (
                        <div className="space-y-4">
                          <p className="text-4xl font-bold mb-2">IMPOSTOR</p>
                          <div className="w-12 h-0.5 bg-white/50 mx-auto my-4"></div>
                          <p className="text-sm opacity-75 mb-2">Навод:</p>
                          <p className="text-2xl font-bold">{currentWord.clue}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm opacity-75 mb-2">Твојот збор:</p>
                          <p className="text-3xl font-bold">{currentWord.word}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-white text-xl font-bold text-center mb-4">{playerName}</p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="bg-[#1a1f2e] p-4 rounded-xl mb-6">
              <p className="text-gray-300 text-sm mb-3 font-semibold text-center">
                Готови: {playersSeenCount}/{totalPlayers}
              </p>
              <div className="space-y-1">
                {playerCards?.map((card: any) => {
                  const hasSeen = cardsSeen?.[card.playerId] || false;
                  return (
                    <div key={card.playerId} className="flex items-center justify-between text-sm">
                      <span className={card.playerId === socket?.id ? 'text-[#3b82f6] font-bold' : hasSeen ? 'text-green-400' : 'text-gray-400'}>
                        {card.playerName}
                      </span>
                      {hasSeen && <span className="text-green-400">✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {cardRevealed && (
              <button
                onClick={() => {
                  if (socket && !iHaveSeen) {
                    socket.emit('card-seen', { roomCode });
                  }
                }}
                disabled={iHaveSeen}
                className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${
                  iHaveSeen
                    ? 'bg-[#10b981] text-white cursor-not-allowed opacity-75'
                    : 'bg-[#10b981] hover:bg-[#059669] text-white'
                }`}
              >
                {iHaveSeen ? 'Готово ✓' : 'Готово ✓'}
              </button>
            )}
          </div>
        </div>
      );
    }

    // Game start screen
    if (phase === 'started') {
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-white mb-3">Играта започна!</h1>
            </div>

            <div className="bg-[#2d3441] p-8 rounded-xl mb-6 border border-[#3b82f6]">
              <p className="text-center text-gray-400 text-sm mb-2">Прв започнува</p>
              <p className="text-center text-white text-3xl font-bold">{onlineFirstPlayer}</p>
            </div>

            <div className="bg-[#2d3441] p-6 rounded-xl mb-8">
              <p className="text-center text-gray-300 text-sm">
                Најдете го impostor-от пред тој да ве најде вас!
              </p>
            </div>

            <button
              onClick={() => {
                setGameType('home');
                setGameMode(null);
                setOnlineGameType(null);
                setRoomCode('');
                setOnlineGameState(null);
                setCardRevealed(false);
              }}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-4 rounded-xl text-lg font-bold transition-all"
            >
              Назад на почеток
            </button>
          </div>
        </div>
      );
    }

    // Waiting for all players to see their cards
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Чекајте...</h2>
            <p className="text-gray-400">Сите играчи мора да видат нивни карти</p>
          </div>
        </div>
      </div>
    );
  }

  // Impostor Game Flow
  if (gameType === 'impostor') {
    // Player Count Selection
    if (setupStep === 'players') {
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <button
              onClick={() => setGameType('home')}
              className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
            >
              ← Назад
            </button>

            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-2">Број на играчи</h2>
              <p className="text-gray-400">Колку луѓе ќе играат?</p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                <button
                  key={count}
                  onClick={() => selectPlayerCount(count)}
                  className="bg-[#2d3441] hover:bg-[#3b82f6] text-white rounded-xl p-6 text-2xl font-bold transition-all"
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Impostor Count Selection
    if (setupStep === 'impostors') {
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <button
              onClick={() => setSetupStep('players')}
              className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
            >
              ← Назад
            </button>

            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-2">Број на impostors</h2>
              <p className="text-gray-400">Колку impostors ќе има?</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((count) => {
                const isDisabled = count >= playerCount;
                return (
                  <button
                    key={count}
                    onClick={() => !isDisabled && selectImpostorCount(count)}
                    disabled={isDisabled}
                    className={`rounded-xl p-8 text-3xl font-bold transition-all ${
                      isDisabled
                        ? 'bg-[#1a1f2e] border border-[#2d3441] text-gray-600 cursor-not-allowed'
                        : 'bg-[#2d3441] hover:bg-[#3b82f6] text-white'
                    }`}
                  >
                    {count}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Name Input
    if (setupStep === 'names') {
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <button
              onClick={() => setSetupStep('impostors')}
              className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
            >
              ← Назад
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Внеси имиња</h2>
            </div>

            <div className="space-y-3 mb-8 max-h-96 overflow-y-auto">
              {players.map((player, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Играч ${index + 1}`}
                  value={player}
                  onChange={(e) => handlePlayerChange(index, e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0e1a] border border-[#2d3441] rounded-xl focus:outline-none focus:border-[#3b82f6] text-white placeholder:text-gray-500 transition-all"
                />
              ))}
            </div>

            <button
              onClick={startGame}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-4 rounded-xl text-lg font-bold transition-all"
            >
              Почни Игра
            </button>
          </div>
        </div>
      );
    }

    // Game Phase - Step by step reveal
    if (currentPlayerIndex < playerCount) {
      const isImpostor = impostorIndices.includes(currentPlayerIndex);
      
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-6">
                {Array.from({ length: playerCount }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      i <= currentPlayerIndex 
                        ? 'bg-[#3b82f6]' 
                        : 'bg-[#2d3441]'
                    }`}
                  />
                ))}
              </div>
              <h2 className="text-xl font-bold text-white">
                {showCard ? 'Твојата карта' : 'Предај телефон на...'}
              </h2>
            </div>

            {!showCard ? (
              <div className="flex flex-col items-center gap-8">
                <div className="text-6xl">📱</div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-white mb-2">
                    {players[currentPlayerIndex]}
                  </p>
                  <p className="text-gray-400">Играч {currentPlayerIndex + 1} од {playerCount}</p>
                </div>
                <button
                  onClick={() => setShowCard(true)}
                  className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-4 rounded-xl text-lg font-bold transition-all"
                >
                  Прикажи карта
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <div
                  onClick={() => setCardRevealed(!cardRevealed)}
                  className="w-full aspect-[3/4] bg-[#2d3441] border-2 border-[#3b82f6] rounded-2xl cursor-pointer flex items-center justify-center p-8 transition-all hover:bg-[#1e2433]"
                >
                  {!cardRevealed ? (
                    <div className="text-center text-white">
                      <div className="text-6xl mb-4">🎴</div>
                      <p className="text-xl font-bold">Притисни за откривање</p>
                    </div>
                  ) : (
                    <div className="text-center text-white px-4">
                      {isImpostor ? (
                        <div className="space-y-4">
                          <p className="text-4xl font-bold mb-2">IMPOSTOR</p>
                          <div className="w-12 h-0.5 bg-white/50 mx-auto my-4"></div>
                          <p className="text-sm opacity-75 mb-2">Навод:</p>
                          <p className="text-2xl font-bold">{currentWord.clue}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm opacity-75 mb-2">Твојот збор:</p>
                          <p className="text-3xl font-bold">{currentWord.word}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {cardRevealed && (
                  <button
                    onClick={handleNextPlayer}
                    className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-4 rounded-xl text-lg font-bold transition-all"
                  >
                    {currentPlayerIndex < playerCount - 1 ? 'Следен играч →' : 'Започни игра'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Final Screen - Show who starts
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-3">Играта започна!</h1>
          </div>

          <div className="bg-[#2d3441] p-8 rounded-xl mb-6 border border-[#3b82f6]">
            <p className="text-center text-gray-400 text-sm mb-2">Прв започнува</p>
            <p className="text-center text-white text-3xl font-bold">{firstPlayer}</p>
          </div>

          <div className="bg-[#2d3441] p-6 rounded-xl mb-8">
            <p className="text-center text-gray-300 text-sm">
              Најдете го impostor-от пред тој да ве најде вас!
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={playAgain}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-4 rounded-xl text-lg font-bold transition-all"
            >
              Играј Пак
            </button>
            <button
              onClick={resetGame}
              className="w-full bg-[#2d3441] hover:bg-[#1a1f2e] text-gray-300 py-3 rounded-xl text-base font-medium transition-all"
            >
              Нова Игра
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mafia Game Flow
  if (gameType === 'mafia') {
    if (mafiaSetupStep === 'players') {
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <button
              onClick={() => setGameType('home')}
              className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
            >
              ← Назад
            </button>

            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-2">Број на играчи</h2>
              <p className="text-gray-400">Минимум 5 играчи</p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[5, 6, 7, 8, 9, 10, 11, 12].map((count) => (
                <button
                  key={count}
                  onClick={() => selectMafiaPlayerCount(count)}
                  className="bg-[#2d3441] hover:bg-[#3b82f6] text-white rounded-xl p-6 text-2xl font-bold transition-all"
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (mafiaSetupStep === 'names') {
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <button
              onClick={() => setMafiaSetupStep('players')}
              className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
            >
              ← Назад
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Внеси имиња</h2>
            </div>

            <div className="space-y-3 mb-8 max-h-96 overflow-y-auto">
              {players.map((player, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Играч ${index + 1}`}
                  value={player}
                  onChange={(e) => handlePlayerChange(index, e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0e1a] border border-[#2d3441] rounded-xl focus:outline-none focus:border-[#3b82f6] text-white placeholder:text-gray-500 transition-all"
                />
              ))}
            </div>

            <button
              onClick={startMafiaGame}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-4 rounded-xl text-lg font-bold transition-all"
            >
              Почни Игра
            </button>
          </div>
        </div>
      );
    }

    // Show roles phase
    if (mafiaPhase === 'roles') {
      if (mafiaPlayerIndex < playerCount) {
        const currentRole = mafiaRoles[mafiaPlayerIndex];
        const roleNames: Record<MafiaRole, string> = {
          mafia: 'MAFIA',
          police: 'ПОЛИЦИЈА',
          doctor: 'ДОКТОР',
          citizen: 'ГРАЃАНИН'
        };
        const roleDescriptions: Record<MafiaRole, string> = {
          mafia: 'Ти си мафија. Убивај ги граѓаните но не откривај се!',
          police: 'Ти си полиција. Истражувај кој е мафијата!',
          doctor: 'Ти си доктор. Спасувај ги граѓаните!',
          citizen: 'Ти си граѓанин. Најди ја мафијата!'
        };

        return (
          <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-6">
                  {Array.from({ length: playerCount }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        i <= mafiaPlayerIndex 
                          ? 'bg-[#3b82f6]' 
                          : 'bg-[#2d3441]'
                      }`}
                    />
                  ))}
                </div>
                <h2 className="text-xl font-bold text-white">
                  {mafiaCardRevealed ? 'Твојата улога' : 'Предај телефон на...'}
                </h2>
              </div>

              {!mafiaCardRevealed ? (
                <div className="flex flex-col items-center gap-8">
                  <div className="text-6xl">📱</div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-white mb-2">
                      {currentRole?.player}
                    </p>
                    <p className="text-gray-400">Играч {mafiaPlayerIndex + 1} од {playerCount}</p>
                  </div>
                  <button
                    onClick={() => setMafiaCardRevealed(true)}
                    className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-4 rounded-xl text-lg font-bold transition-all"
                  >
                    Прикажи улога
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="w-full aspect-[3/4] bg-[#2d3441] border-2 border-[#3b82f6] rounded-2xl flex flex-col items-center justify-center p-6 overflow-hidden">
                    <div className="w-full flex-1 mb-4">
                      {currentRole.role === 'mafia' && (
                        <img src="/mafia.jpeg" alt="Мафија" className="w-full h-full object-cover rounded-xl shadow-lg" />
                      )}
                      {currentRole.role === 'police' && (
                        <img src="/police.jpeg" alt="Полиција" className="w-full h-full object-cover rounded-xl shadow-lg" />
                      )}
                      {currentRole.role === 'doctor' && (
                        <img src="/doctor.jpeg" alt="Доктор" className="w-full h-full object-cover rounded-xl shadow-lg" />
                      )}
                      {currentRole.role === 'citizen' && (
                        <img src="/villager.jpeg" alt="Граѓанин" className="w-full h-full object-cover rounded-xl shadow-lg" />
                      )}
                    </div>
                    <div className="text-center text-white px-4">
                      <p className="text-4xl font-bold mb-4">{roleNames[currentRole.role]}</p>
                      <div className="w-12 h-0.5 bg-white/50 mx-auto my-4"></div>
                      <p className="text-sm opacity-75 leading-relaxed">
                        {roleDescriptions[currentRole.role]}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleMafiaNextPlayer}
                    className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-4 rounded-xl text-lg font-bold transition-all"
                  >
                    {mafiaPlayerIndex < playerCount - 1 ? 'Следен играч →' : 'Започни ноќ'}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      }
    }

    // Night Phase - Mafia
    if (mafiaPhase === 'night-mafia') {
      const mafiaIndex = mafiaRoles.findIndex(r => r.role === 'mafia' && r.alive);
      const mafiaPlayer = mafiaRoles[mafiaIndex];
      const alivePlayers = mafiaRoles.filter((r, i) => r.alive && i !== mafiaIndex);
      
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Ноќ {mafiaDay}</h2>
              <p className="text-gray-400">Мафија се буди</p>
            </div>

            <div className="mb-6">
              <p className="text-white text-xl font-bold mb-4 text-center">
                {mafiaPlayer?.player}
              </p>
              <p className="text-gray-400 text-center mb-6">Избери кого да убиеш:</p>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {alivePlayers.map((player, index) => {
                  const playerIndex = mafiaRoles.findIndex(r => r.player === player.player);
                  return (
                    <button
                      key={index}
                      onClick={() => handleMafiaKill(playerIndex)}
                      className="w-full bg-[#2d3441] hover:bg-[#dc2626] text-white py-3 rounded-xl text-lg font-medium transition-all"
                    >
                      {player.player}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Night Phase - Police
    if (mafiaPhase === 'night-police') {
      const policeIndex = mafiaRoles.findIndex(r => r.role === 'police' && r.alive);
      const policePlayer = mafiaRoles[policeIndex];
      const alivePlayers = mafiaRoles.filter((r, i) => r.alive && i !== policeIndex);

      if (mafiaPoliceTarget === null) {
        return (
          <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Ноќ {mafiaDay}</h2>
                <p className="text-gray-400">Полиција се буди</p>
              </div>

              <div className="mb-6">
                <p className="text-white text-xl font-bold mb-4 text-center">
                  {policePlayer?.player}
                </p>
                <p className="text-gray-400 text-center mb-6">Избери кого да истражуваш:</p>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {alivePlayers.map((player, index) => {
                    const playerIndex = mafiaRoles.findIndex(r => r.player === player.player);
                    return (
                      <button
                        key={index}
                        onClick={() => handleMafiaPoliceInvestigate(playerIndex)}
                        className="w-full bg-[#2d3441] hover:bg-[#3b82f6] text-white py-3 rounded-xl text-lg font-medium transition-all"
                      >
                        {player.player}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Show result
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Резултат</h2>
            </div>

            <div className="bg-[#2d3441] p-8 rounded-xl mb-6">
              <p className="text-white text-center mb-4">
                {mafiaRoles[mafiaPoliceTarget].player}
              </p>
              <div className="w-12 h-0.5 bg-white/50 mx-auto my-4"></div>
              <p className="text-3xl font-bold text-center text-[#3b82f6]">
                {mafiaPoliceResult}
              </p>
            </div>

            <button
              onClick={handleMafiaPoliceContinue}
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-4 rounded-xl text-lg font-bold transition-all"
            >
              Продолжи
            </button>
          </div>
        </div>
      );
    }

    // Night Phase - Doctor
    if (mafiaPhase === 'night-doctor') {
      const doctorIndex = mafiaRoles.findIndex(r => r.role === 'doctor' && r.alive);
      const doctorPlayer = mafiaRoles[doctorIndex];
      const alivePlayers = mafiaRoles.filter((r, i) => r.alive && i !== doctorIndex);
      
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Ноќ {mafiaDay}</h2>
              <p className="text-gray-400">Доктор се буди</p>
            </div>

            <div className="mb-6">
              <p className="text-white text-xl font-bold mb-4 text-center">
                {doctorPlayer?.player}
              </p>
              <p className="text-gray-400 text-center mb-6">Избери кого да спасиш:</p>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {alivePlayers.map((player, index) => {
                  const playerIndex = mafiaRoles.findIndex(r => r.player === player.player);
                  return (
                    <button
                      key={index}
                      onClick={() => handleMafiaDoctorSave(playerIndex)}
                      className="w-full bg-[#2d3441] hover:bg-[#10b981] text-white py-3 rounded-xl text-lg font-medium transition-all"
                    >
                      {player.player}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Day Phase
    if (mafiaPhase === 'day') {
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Ден {mafiaDay}</h2>
            </div>

            <div className="bg-[#2d3441] p-6 rounded-xl mb-6">
              <p className="text-white text-center text-lg">
                {mafiaNightResult || 'Сите преживеале ноќта!'}
              </p>
            </div>

            <div className="bg-[#2d3441] p-6 rounded-xl mb-6">
              <p className="text-gray-300 text-sm text-center leading-relaxed">
                Дискутирајте и гласајте кого да изгорите. Потоа продолжуваме со следна ноќ.
              </p>
            </div>

            <button
              onClick={handleMafiaNextDay}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-4 rounded-xl text-lg font-bold transition-all"
            >
              Следна ноќ →
            </button>
          </div>
        </div>
      );
    }

    // Game Finished
    if (mafiaPhase === 'finished') {
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-white mb-3">Играта заврши!</h1>
            </div>

            <div className="bg-[#2d3441] p-8 rounded-xl mb-6 border border-[#3b82f6]">
              <p className="text-white text-2xl font-bold text-center">
                {mafiaNightResult}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  startMafiaGame();
                }}
                className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-4 rounded-xl text-lg font-bold transition-all"
              >
                Играј Пак
              </button>
              <button
                onClick={resetGame}
                className="w-full bg-[#2d3441] hover:bg-[#1a1f2e] text-gray-300 py-3 rounded-xl text-base font-medium transition-all"
              >
                Нова Игра
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // HeadsUp Game Flow
  if (gameType === 'headsup') {
    // Instructions screen
    if (headsupSetupStep === 'instructions') {
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1a1f2e] border border-[#2d3441] rounded-2xl p-8">
            <button
              onClick={() => setGameType('home')}
              className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
            >
              ← Назад
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">HeadsUp</h2>
              <div className="space-y-4 text-left text-gray-300">
                <div className="bg-[#2d3441] p-4 rounded-xl">
                  <p className="font-semibold text-white mb-2">Како се игра:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Предај го телефонот на играчот</li>
                    <li>Другите играчи даваат наводи за зборот</li>
                    <li>Наведни телефон <span className="text-green-400">↑ нагоре</span> за точно</li>
                    <li>Наведни телефон <span className="text-red-400">↓ надолу</span> за пропушти</li>
                    <li>Или користи ги копчињата</li>
                  </ol>
                </div>
                <div className="bg-[#2d3441] p-4 rounded-xl">
                  <p className="font-semibold text-white mb-2">⚠️ Важно:</p>
                  <p className="text-sm">Ротирај го телефонот хоризонтално за подобро искуство!</p>
                </div>
              </div>
            </div>

            <button
              onClick={startHeadsupGame}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-4 rounded-xl text-lg font-bold transition-all"
            >
              Почни Игра
            </button>
          </div>
        </div>
      );
    }

    // Game screen - Horizontal only
    return (
      <div 
        className={`min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4 transition-colors duration-300 ${
          headsupFlashColor === 'green' ? 'bg-green-900/30' : 
          headsupFlashColor === 'red' ? 'bg-red-900/30' : 
          ''
        }`}
        style={{ 
          minHeight: '100dvh' // Dynamic viewport height for mobile
        }}
      >
        <div className="w-full max-w-4xl">
          {/* Force landscape orientation message */}
          <div className="md:hidden mb-4 text-center">
            <p className="text-yellow-400 text-sm">🔄 Ротирај го телефонот хоризонтално</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            {/* Score display */}
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm mb-1">Поени</p>
              <p className="text-white text-4xl font-bold">{headsupScore}</p>
            </div>

            {/* Word card - Horizontal layout */}
            {!headsupShowWord ? (
              <div className="flex flex-col items-center gap-6 flex-1">
                <div className="text-6xl">📱</div>
                <div className="text-center">
                  <p className="text-white text-xl mb-2">Предај телефон на играчот</p>
                  <p className="text-gray-400 text-sm">Другите играчи ќе даваат наводи</p>
                </div>
                <button
                  onClick={() => setHeadsupShowWord(true)}
                  className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-8 py-4 rounded-xl text-lg font-bold transition-all"
                >
                  Прикажи збор
                </button>
              </div>
            ) : (
              <div className="flex-1 w-full">
                <div 
                  className={`w-full aspect-[16/9] bg-[#2d3441] border-2 border-[#3b82f6] rounded-2xl flex items-center justify-center p-8 transition-colors duration-300 ${
                    headsupFlashColor === 'green' ? 'bg-green-500/20 border-green-400' : 
                    headsupFlashColor === 'red' ? 'bg-red-500/20 border-red-400' : 
                    ''
                  }`}
                >
                  <div className="text-center text-white">
                    <p className="text-6xl md:text-7xl font-bold">{headsupCurrentWord.word}</p>
                  </div>
                </div>

                {/* Tilt instructions */}
                <div className="bg-[#1a1f2e] p-4 rounded-xl mt-4">
                  <p className="text-gray-400 text-xs text-center mb-2">Наведни телефон:</p>
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-green-400 mb-1 text-lg">↑</p>
                      <p className="text-gray-500 text-xs">Точно</p>
                    </div>
                    <div className="w-px h-8 bg-[#2d3441]"></div>
                    <div className="text-center">
                      <p className="text-red-400 mb-1 text-lg">↓</p>
                      <p className="text-gray-500 text-xs">Пропушти</p>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleHeadsupCorrect}
                    className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white py-4 rounded-xl text-lg font-bold transition-all"
                  >
                    Точно ✓
                  </button>
                  <button
                    onClick={handleHeadsupSkip}
                    className="flex-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white py-4 rounded-xl text-lg font-bold transition-all"
                  >
                    Пропушти
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* End game button */}
          {headsupShowWord && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setHeadsupSetupStep('instructions');
                  setHeadsupShowWord(false);
                  setHeadsupScore(0);
                }}
                className="bg-[#2d3441] hover:bg-[#1a1f2e] text-gray-300 px-6 py-3 rounded-xl text-base font-medium transition-all"
              >
                Крај на игра
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
