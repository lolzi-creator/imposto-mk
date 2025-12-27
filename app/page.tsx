'use client';

import { useState } from 'react';

const WORD_CATEGORIES: Record<string, { word: string; clue: string }[]> = {
  'Храна': [
    { word: 'Пица', clue: 'Кружно' },
    { word: 'Бургер', clue: 'Америка' },
    { word: 'Сендвич', clue: 'Помеѓу' },
    { word: 'Салата', clue: 'Свежо' },
    { word: 'Супа', clue: 'Топло' },
    { word: 'Торта', clue: 'Слатко' },
    { word: 'Колач', clue: 'Печено' },
    { word: 'Шоколадо', clue: 'Темно' },
    { word: 'Сладолед', clue: 'Ладно' },
    { word: 'Леб', clue: 'Основа' },
    { word: 'Сирење', clue: 'Жолто' },
    { word: 'Јајце', clue: 'Овално' },
    { word: 'Риба', clue: 'Плива' },
    { word: 'Месо', clue: 'Протеин' },
    { word: 'Домат', clue: 'Сочно' },
    { word: 'Краставица', clue: 'Салатка' },
    { word: 'Пиперка', clue: 'Полна' },
    { word: 'Ориз', clue: 'Бело' },
    { word: 'Макарони', clue: 'Долго' },
    { word: 'Путер', clue: 'Мазе' }
  ],
  'Животни': [
    { word: 'Куче', clue: 'Верно' },
    { word: 'Мачка', clue: 'Независна' },
    { word: 'Конец', clue: 'Јава' },
    { word: 'Крава', clue: 'Фарма' },
    { word: 'Свиња', clue: 'Кал' },
    { word: 'Овца', clue: 'Бела' },
    { word: 'Коза', clue: 'Планина' },
    { word: 'Пиле', clue: 'Мало' },
    { word: 'Мишка', clue: 'Мала' },
    { word: 'Зајак', clue: 'Брзо' },
    { word: 'Лав', clue: 'Крал' },
    { word: 'Тигар', clue: 'Шари' },
    { word: 'Слон', clue: 'Огромен' },
    { word: 'Мајмун', clue: 'Качува' }
  ],
  'Спорт': [
    { word: 'Фудбал', clue: 'Топка' },
    { word: 'Кошарка', clue: 'Висока' },
    { word: 'Тенис', clue: 'Жолто' },
    { word: 'Одбојка', clue: 'Песок' },
    { word: 'Пливање', clue: 'Мокро' },
    { word: 'Трчање', clue: 'Брзина' },
    { word: 'Баскетбол', clue: 'Американски' },
    { word: 'Ракомет', clue: 'Рака' },
    { word: 'Голф', clue: 'Трева' },
    { word: 'Бокс', clue: 'Борба' },
    { word: 'Скијање', clue: 'Зима' },
    { word: 'Сурфање', clue: 'Океан' },
    { word: 'Јога', clue: 'Мирно' },
    { word: 'Карате', clue: 'Јапонија' }
  ],
  'Природа': [
    { word: 'Море', clue: 'Солено' },
    { word: 'Планина', clue: 'Високо' },
    { word: 'Сонце', clue: 'Топло' },
    { word: 'Месечина', clue: 'Ноќно' },
    { word: 'Дрво', clue: 'Високо' },
    { word: 'Цвеќе', clue: 'Убаво' },
    { word: 'Трева', clue: 'Кратко' },
    { word: 'Река', clue: 'Течно' },
    { word: 'Езеро', clue: 'Мирно' },
    { word: 'Океан', clue: 'Длабоко' },
    { word: 'Облак', clue: 'Бело' },
    { word: 'Дожд', clue: 'Мокро' },
    { word: 'Снег', clue: 'Студено' },
    { word: 'Ветер', clue: 'Невидливо' },
    { word: 'Пустина', clue: 'Суво' },
    { word: 'Шума', clue: 'Темно' },
    { word: 'Остров', clue: 'Одвоено' }
  ],
  'Професии': [
    { word: 'Астронаут', clue: 'Летач' },
    { word: 'Доктор', clue: 'Здравје' },
    { word: 'Учител', clue: 'Знаење' },
    { word: 'Полицаец', clue: 'Ред' },
    { word: 'Пожарникар', clue: 'Црвено' },
    { word: 'Готвач', clue: 'Вкус' },
    { word: 'Пилот', clue: 'Небо' },
    { word: 'Шофер', clue: 'Пат' },
    { word: 'Сликар', clue: 'Боја' }
  ],
  'Технологија': [
    { word: 'Телефон', clue: 'Гласно' },
    { word: 'Компјутер', clue: 'Брзо' },
    { word: 'Телевизор', clue: 'Гледа' },
    { word: 'Радио', clue: 'Слуша' },
    { word: 'Камера', clue: 'Сними' }
  ],
  'Сите': []
};

// Populate "Сите" with all words from other categories
WORD_CATEGORIES['Сите'] = Object.entries(WORD_CATEGORIES)
  .filter(([key]) => key !== 'Сите')
  .flatMap(([_, words]) => words);

export default function Home() {
  const [setupStep, setSetupStep] = useState<'category' | 'players' | 'names' | 'game'>('category');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [playerCount, setPlayerCount] = useState(4);
  const [players, setPlayers] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState({ word: '', clue: '' });
  const [impostorIndex, setImpostorIndex] = useState(-1);
  const [firstPlayer, setFirstPlayer] = useState('');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [cardRevealed, setCardRevealed] = useState(false);

  const handlePlayerChange = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const toggleCategory = (category: string) => {
    if (category === 'Сите') {
      setSelectedCategories(['Сите']);
    } else {
      const newCategories = selectedCategories.filter(c => c !== 'Сите');
      if (selectedCategories.includes(category)) {
        setSelectedCategories(newCategories.filter(c => c !== category));
      } else {
        if (newCategories.length < 5) {
          setSelectedCategories([...newCategories, category]);
        }
      }
    }
  };

  const confirmCategories = () => {
    if (selectedCategories.length === 0) {
      alert('Избери најмалку 1 категорија!');
      return;
    }
    setSetupStep('players');
  };

  const selectPlayerCount = (count: number) => {
    setPlayerCount(count);
    setPlayers(Array(count).fill(''));
    setSetupStep('names');
  };

  const startGame = () => {
    if (players.some(p => !p.trim())) {
      alert('Ве молиме внесете ги сите имиња!');
      return;
    }

    // Combine words from selected categories
    let combinedWords: { word: string; clue: string }[] = [];
    if (selectedCategories.includes('Сите')) {
      combinedWords = WORD_CATEGORIES['Сите'];
    } else {
      selectedCategories.forEach(cat => {
        combinedWords = [...combinedWords, ...WORD_CATEGORIES[cat]];
      });
    }

    const randomWord = combinedWords[Math.floor(Math.random() * combinedWords.length)];
    const randomImpostor = Math.floor(Math.random() * playerCount);
    const randomFirst = players[Math.floor(Math.random() * playerCount)];

    setCurrentWord(randomWord);
    setImpostorIndex(randomImpostor);
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

  const resetGame = () => {
    setSetupStep('category');
    setSelectedCategories([]);
    setPlayerCount(4);
    setPlayers([]);
    setShowCard(false);
    setCardRevealed(false);
    setCurrentWord({ word: '', clue: '' });
    setImpostorIndex(-1);
    setFirstPlayer('');
    setCurrentPlayerIndex(0);
  };

  // Category Selection
  if (setupStep === 'category') {
    const categories = Object.keys(WORD_CATEGORIES).filter(c => c !== 'Сите');
    categories.unshift('Сите');

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8 pt-4 sm:pt-8">
            <div className="text-5xl sm:text-6xl mb-3">🕵️</div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">Impostor</h1>
            <p className="text-white/80 text-sm sm:text-base">Избери до 5 категории</p>
            {selectedCategories.length > 0 && !selectedCategories.includes('Сите') && (
              <div className="mt-2 text-white/90 text-xs sm:text-sm">
                {selectedCategories.length}/5
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category);
              const isAllSelected = selectedCategories.includes('Сите');
              const isDisabled = !isSelected && selectedCategories.length >= 5 && category !== 'Сите';

              return (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  disabled={isDisabled}
                  className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg transition-all transform active:scale-95 ${
                    isSelected || (isAllSelected && category === 'Сите')
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                      : isDisabled
                      ? 'bg-white/50 backdrop-blur opacity-50 cursor-not-allowed'
                      : 'bg-white/95 backdrop-blur'
                  }`}
                >
                  <div className="text-3xl sm:text-4xl mb-2">
                    {category === 'Сите' ? '🎯' :
                     category === 'Храна' ? '🍕' :
                     category === 'Животни' ? '🐶' :
                     category === 'Спорт' ? '⚽' :
                     category === 'Природа' ? '🌲' :
                     category === 'Професии' ? '👨‍⚕️' : '💻'}
                  </div>
                  <h3 className={`text-base sm:text-xl font-black mb-1 ${
                    isSelected || (isAllSelected && category === 'Сите') ? 'text-white' : 'text-gray-800'
                  }`}>
                    {category}
                  </h3>
                  <p className={`text-xs ${
                    isSelected || (isAllSelected && category === 'Сите') ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {WORD_CATEGORIES[category].length}
                  </p>
                  {isSelected && (
                    <div className="mt-1 text-lg">✓</div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedCategories.length > 0 && (
            <div className="flex justify-center pb-4">
              <button
                onClick={confirmCategories}
                className="bg-white text-indigo-600 px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-black hover:bg-gray-100 transition-all transform active:scale-95 shadow-xl"
              >
                Продолжи ➡️
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Player Count Selection
  if (setupStep === 'players') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-3 sm:p-4">
        <div className="w-full max-w-lg bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 sm:p-8">
          <button
            onClick={() => setSetupStep('category')}
            className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2 text-sm sm:text-base"
          >
            ← Назад
          </button>

          <div className="text-center mb-6 sm:mb-8">
            <div className="text-4xl sm:text-5xl mb-3">👥</div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-1">Број на играчи</h2>
            <p className="text-gray-600 text-sm">Колку луѓе ќе играат?</p>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
              <button
                key={count}
                onClick={() => selectPlayerCount(count)}
                className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl p-4 sm:p-5 text-2xl sm:text-3xl font-black hover:from-indigo-600 hover:to-purple-600 transition-all transform active:scale-95 shadow-lg"
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Name Input
  if (setupStep === 'names') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-3 sm:p-4">
        <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 sm:p-8">
          <button
            onClick={() => setSetupStep('players')}
            className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2 text-sm sm:text-base"
          >
            ← Назад
          </button>

          <div className="text-center mb-6">
            <div className="text-4xl sm:text-5xl mb-3">✍️</div>
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-2">
              Внеси имиња
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              {selectedCategories.includes('Сите')
                ? 'Сите категории'
                : selectedCategories.join(', ')}
            </p>
          </div>

          <div className="space-y-2 mb-6 max-h-80 overflow-y-auto">
            {players.map((player, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Играч ${index + 1}`}
                value={player}
                onChange={(e) => handlePlayerChange(index, e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base text-gray-800 bg-white transition-all"
              />
            ))}
          </div>

          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl text-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all transform active:scale-95 shadow-lg"
          >
            Почни Игра 🎮
          </button>
        </div>
      </div>
    );
  }

  // Game Phase - Step by step reveal
  if (currentPlayerIndex < playerCount) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-3 sm:p-4">
        <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-1 mb-4">
              {Array.from({ length: playerCount }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    i <= currentPlayerIndex ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              {showCard ? 'Твојата карта 🎴' : 'Предај телефон на...'}
            </h2>
          </div>

          {!showCard ? (
            <div className="flex flex-col items-center gap-6">
              <div className="text-6xl sm:text-7xl animate-bounce">📱</div>
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
                  {players[currentPlayerIndex]}
                </p>
                <p className="text-gray-500 mt-2 text-sm">Играч {currentPlayerIndex + 1} од {playerCount}</p>
              </div>
              <button
                onClick={() => setShowCard(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-2xl text-lg font-bold hover:from-blue-700 hover:to-cyan-700 transition-all transform active:scale-95 shadow-lg"
              >
                Прикажи карта 🎴
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div
                onClick={() => setCardRevealed(!cardRevealed)}
                className="w-full aspect-[3/4] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl cursor-pointer flex items-center justify-center p-6 transition-all transform active:scale-95"
              >
                {!cardRevealed ? (
                  <div className="text-center text-white">
                    <div className="text-7xl sm:text-8xl mb-4 animate-pulse">🎴</div>
                    <p className="text-xl sm:text-2xl font-bold">Притисни за откривање</p>
                  </div>
                ) : (
                  <div className="text-center text-white">
                    {currentPlayerIndex === impostorIndex ? (
                      <div className="space-y-3">
                        <p className="text-3xl sm:text-4xl font-black">🕵️</p>
                        <p className="text-2xl sm:text-3xl font-black">IMPOSTOR</p>
                        <div className="w-12 h-1 bg-white mx-auto my-3"></div>
                        <p className="text-base sm:text-lg opacity-90">Навод:</p>
                        <p className="text-2xl sm:text-3xl font-black">{currentWord.clue}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-base sm:text-lg opacity-90">Твојот збор:</p>
                        <p className="text-3xl sm:text-4xl font-black leading-tight">{currentWord.word}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {cardRevealed && (
                <button
                  onClick={handleNextPlayer}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl text-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all transform active:scale-95 shadow-lg"
                >
                  {currentPlayerIndex < playerCount - 1 ? '➡️ Следен играч' : '🎮 Започни игра'}
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-3 sm:p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-6xl sm:text-7xl mb-4 animate-bounce">🎮</div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-800 mb-2">Играта започна!</h1>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 sm:p-8 rounded-3xl mb-6 shadow-lg">
          <p className="text-center text-white text-xs sm:text-sm font-medium mb-1 opacity-90">
            Прв започнува
          </p>
          <p className="text-center text-white text-3xl sm:text-4xl font-black">
            {firstPlayer}
          </p>
        </div>

        <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 sm:p-6 rounded-3xl mb-6">
          <p className="text-center text-gray-800 text-sm sm:text-base font-medium">
            💡 Најдете го impostor-от пред тој да ве најде вас!
          </p>
        </div>

        <button
          onClick={resetGame}
          className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-4 rounded-2xl text-lg font-bold hover:from-gray-800 hover:to-black transition-all transform active:scale-95 shadow-lg"
        >
          🔄 Нова Игра
        </button>
      </div>
    </div>
  );
}
