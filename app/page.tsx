'use client';

import { useState } from 'react';

const MACEDONIAN_WORDS = [
  { word: 'Јаболко', clue: 'Овошје' },
  { word: 'Куче', clue: 'Животно' },
  { word: 'Автомобил', clue: 'Превозно средство' },
  { word: 'Книга', clue: 'Предмет за читање' },
  { word: 'Море', clue: 'Вода' },
  { word: 'Планина', clue: 'Природа' },
  { word: 'Пица', clue: 'Храна' },
  { word: 'Фудбал', clue: 'Спорт' },
  { word: 'Гитара', clue: 'Инструмент' },
  { word: 'Кафе', clue: 'Пијалок' },
  { word: 'Мачка', clue: 'Животно' },
  { word: 'Сонце', clue: 'Природа' },
  { word: 'Месечина', clue: 'Природа' },
  { word: 'Стол', clue: 'Мебел' },
  { word: 'Маса', clue: 'Мебел' },
  { word: 'Телефон', clue: 'Технologija' },
  { word: 'Компјутер', clue: 'Технologija' },
  { word: 'Пиво', clue: 'Пијалок' },
  { word: 'Вино', clue: 'Пијалок' },
  { word: 'Леб', clue: 'Храна' },
  { word: 'Сирење', clue: 'Храна' },
  { word: 'Млеко', clue: 'Пијалок' },
  { word: 'Јајце', clue: 'Храна' },
  { word: 'Риба', clue: 'Храна' },
  { word: 'Месо', clue: 'Храна' },
  { word: 'Домат', clue: 'Зеленчук' },
  { word: 'Краставица', clue: 'Зеленчук' },
  { word: 'Пиперка', clue: 'Зеленчук' },
  { word: 'Банана', clue: 'Овошје' },
  { word: 'Портокал', clue: 'Овошје' },
  { word: 'Грозје', clue: 'Овошје' },
  { word: 'Јагода', clue: 'Овошје' },
  { word: 'Круша', clue: 'Овошје' },
  { word: 'Кревет', clue: 'Мебел' },
  { word: 'Прозорец', clue: 'Дел од куќа' },
  { word: 'Врата', clue: 'Дел од куќа' },
  { word: 'Под', clue: 'Дел од куќа' },
  { word: 'Плафон', clue: 'Дел од куќа' },
  { word: 'Ѕид', clue: 'Дел од куќа' },
  { word: 'Куќа', clue: 'Објект' },
  { word: 'Зграда', clue: 'Објект' },
  { word: 'Мост', clue: 'Објект' },
  { word: 'Пат', clue: 'Локација' },
  { word: 'Улица', clue: 'Локација' },
  { word: 'Парк', clue: 'Локација' },
  { word: 'Училиште', clue: 'Објект' },
  { word: 'Болница', clue: 'Објект' },
  { word: 'Аеродром', clue: 'Објект' },
  { word: 'Возвоз', clue: 'Превоз' },
  { word: 'Автобус', clue: 'Превоз' },
  { word: 'Велосипед', clue: 'Превоз' },
  { word: 'Авион', clue: 'Превоз' },
  { word: 'Брод', clue: 'Превоз' },
  { word: 'Кошарка', clue: 'Спорт' },
  { word: 'Тенис', clue: 'Спорт' },
  { word: 'Одбојка', clue: 'Спорт' },
  { word: 'Пливање', clue: 'Спорт' },
  { word: 'Трчање', clue: 'Спорт' },
  { word: 'Клавир', clue: 'Инструмент' },
  { word: 'Виолина', clue: 'Инструмент' },
  { word: 'Тапан', clue: 'Инструмент' },
  { word: 'Труба', clue: 'Инструмент' },
  { word: 'Хармоника', clue: 'Инструмент' },
  { word: 'Телевизор', clue: 'Технologija' },
  { word: 'Радио', clue: 'Технologija' },
  { word: 'Камера', clue: 'Технologija' },
  { word: 'Часовник', clue: 'Предмет' },
  { word: 'Наочари', clue: 'Предмет' },
  { word: 'Чадор', clue: 'Предмет' },
  { word: 'Чанта', clue: 'Предмет' },
  { word: 'Ранец', clue: 'Предмет' },
  { word: 'Капа', clue: 'Облека' },
  { word: 'Кошула', clue: 'Облека' },
  { word: 'Панталони', clue: 'Облека' },
  { word: 'Фустан', clue: 'Облека' },
  { word: 'Чевли', clue: 'Облека' },
  { word: 'Чорапи', clue: 'Облека' },
  { word: 'Јакна', clue: 'Облека' },
  { word: 'Ракавици', clue: 'Облека' },
  { word: 'Шал', clue: 'Облека' },
  { word: 'Прстен', clue: 'Накит' },
  { word: 'Огрлица', clue: 'Накит' },
  { word: 'Обетки', clue: 'Накит' },
  { word: 'Конец', clue: 'Животно' },
  { word: 'Крава', clue: 'Животно' },
  { word: 'Свиња', clue: 'Животно' },
  { word: 'Овца', clue: 'Животно' },
  { word: 'Коза', clue: 'Животно' },
  { word: 'Пиле', clue: 'Животно' },
  { word: 'Мишка', clue: 'Животно' },
  { word: 'Зајак', clue: 'Животно' },
  { word: 'Лав', clue: 'Животно' },
  { word: 'Тигар', clue: 'Животно' },
  { word: 'Слон', clue: 'Животно' },
  { word: 'Мајмун', clue: 'Животно' },
  { word: 'Дрво', clue: 'Природа' },
  { word: 'Цвеќе', clue: 'Природа' },
  { word: 'Трева', clue: 'Природа' },
  { word: 'Река', clue: 'Природа' },
  { word: 'Езеро', clue: 'Природа' },
  { word: 'Океан', clue: 'Природа' },
  { word: 'Облак', clue: 'Природа' },
  { word: 'Дожд', clue: 'Природа' },
  { word: 'Снег', clue: 'Природа' },
  { word: 'Ветер', clue: 'Природа' }
];

export default function Home() {
  const [players, setPlayers] = useState(['', '', '', '']);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentWord, setCurrentWord] = useState({ word: '', clue: '' });
  const [impostorIndex, setImpostorIndex] = useState(-1);
  const [firstPlayer, setFirstPlayer] = useState('');
  const [showWord, setShowWord] = useState<number | null>(null);

  const handlePlayerChange = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const startGame = () => {
    if (players.some(p => !p.trim())) {
      alert('Ве молиме внесете ги сите имиња!');
      return;
    }

    const randomWord = MACEDONIAN_WORDS[Math.floor(Math.random() * MACEDONIAN_WORDS.length)];
    const randomImpostor = Math.floor(Math.random() * 4);
    const randomFirst = players[Math.floor(Math.random() * 4)];

    setCurrentWord(randomWord);
    setImpostorIndex(randomImpostor);
    setFirstPlayer(randomFirst);
    setGameStarted(true);
    setShowWord(null);
  };

  const resetGame = () => {
    setGameStarted(false);
    setShowWord(null);
    setCurrentWord({ word: '', clue: '' });
    setImpostorIndex(-1);
    setFirstPlayer('');
  };

  if (!gameStarted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Impostor Game</h1>
          <div className="space-y-4 mb-8">
            {players.map((player, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Играч ${index + 1}`}
                value={player}
                onChange={(e) => handlePlayerChange(index, e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-lg"
              />
            ))}
          </div>
          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg text-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
          >
            Почни Игра
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Impostor Game</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {players.map((player, index) => (
            <div key={index} className="relative">
              <button
                onClick={() => setShowWord(showWord === index ? null : index)}
                className="w-full p-6 rounded-xl text-xl font-semibold transition-all transform hover:scale-105 bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
              >
                {player}
              </button>
              {showWord === index && (
                <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-gray-900 text-white rounded-lg shadow-xl z-10">
                  {index === impostorIndex ? (
                    <div>
                      <p className="text-sm font-medium mb-1">Ти си IMPOSTOR! 🕵️</p>
                      <p className="text-lg">Навод: <span className="font-bold">{currentWord.clue}</span></p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium mb-1">Твојот збор:</p>
                      <p className="text-2xl font-bold">{currentWord.word}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-6 rounded-xl mb-6">
          <p className="text-center text-white text-2xl font-bold">
            🎮 {firstPlayer} започнува!
          </p>
        </div>

        <button
          onClick={resetGame}
          className="w-full bg-gray-700 text-white py-4 rounded-lg text-xl font-semibold hover:bg-gray-800 transition-all"
        >
          Нова Игра
        </button>
      </div>
    </div>
  );
}
