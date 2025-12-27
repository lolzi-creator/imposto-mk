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
  { word: 'Ветер', clue: 'Природа' },
  { word: 'Пустина', clue: 'Природа' },
  { word: 'Шума', clue: 'Природа' },
  { word: 'Остров', clue: 'Природа' },
  { word: 'Плажа', clue: 'Локација' },
  { word: 'Рака', clue: 'Дел од тело' },
  { word: 'Нога', clue: 'Дел од тело' },
  { word: 'Глава', clue: 'Дел од тело' },
  { word: 'Око', clue: 'Дел од тело' },
  { word: 'Уво', clue: 'Дел од тело' },
  { word: 'Нос', clue: 'Дел од тело' },
  { word: 'Уста', clue: 'Дел од тело' },
  { word: 'Заб', clue: 'Дел од тело' },
  { word: 'Јазик', clue: 'Дел од тело' },
  { word: 'Срце', clue: 'Дел од тело' },
  { word: 'Мозок', clue: 'Дел од тело' },
  { word: 'Стомак', clue: 'Дел од тело' },
  { word: 'Прст', clue: 'Дел од тело' },
  { word: 'Колено', clue: 'Дел од тело' },
  { word: 'Лакт', clue: 'Дел од тело' },
  { word: 'Рамо', clue: 'Дел од тело' },
  { word: 'Грб', clue: 'Дел од тело' },
  { word: 'Пица', clue: 'Храна' },
  { word: 'Бургер', clue: 'Храна' },
  { word: 'Сендвич', clue: 'Храна' },
  { word: 'Салата', clue: 'Храна' },
  { word: 'Супа', clue: 'Храна' },
  { word: 'Торта', clue: 'Храна' },
  { word: 'Колач', clue: 'Храна' },
  { word: 'Шоколадо', clue: 'Храна' },
  { word: 'Бомбона', clue: 'Храна' },
  { word: 'Сладолед', clue: 'Храна' },
  { word: 'Пченица', clue: 'Растение' },
  { word: 'Ориз', clue: 'Храна' },
  { word: 'Макарони', clue: 'Храна' },
  { word: 'Путер', clue: 'Храна' },
  { word: 'Мед', clue: 'Храна' },
  { word: 'Џем', clue: 'Храна' },
  { word: 'Чај', clue: 'Пијалок' },
  { word: 'Сок', clue: 'Пијалок' },
  { word: 'Ракија', clue: 'Пијалок' },
  { word: 'Виски', clue: 'Пијалок' },
  { word: 'Лимонада', clue: 'Пијалок' },
  { word: 'Баскетбол', clue: 'Спорт' },
  { word: 'Ракомет', clue: 'Спорт' },
  { word: 'Голф', clue: 'Спорт' },
  { word: 'Бокс', clue: 'Спорт' },
  { word: 'Скијање', clue: 'Спорт' },
  { word: 'Сурфање', clue: 'Спорт' },
  { word: 'Јога', clue: 'Спорт' },
  { word: 'Карате', clue: 'Спорт' },
  { word: 'Шах', clue: 'Игра' },
  { word: 'Карти', clue: 'Игра' },
  { word: 'Коцки', clue: 'Игра' },
  { word: 'Пазл', clue: 'Игра' },
  { word: 'Лего', clue: 'Играчка' },
  { word: 'Кукла', clue: 'Играчка' },
  { word: 'Топка', clue: 'Играчка' },
  { word: 'Роботи', clue: 'Играчка' },
  { word: 'Црвено', clue: 'Боја' },
  { word: 'Сино', clue: 'Боја' },
  { word: 'Жолто', clue: 'Боја' },
  { word: 'Зелено', clue: 'Боја' },
  { word: 'Црно', clue: 'Боја' },
  { word: 'Бело', clue: 'Боја' },
  { word: 'Портокалово', clue: 'Боја' },
  { word: 'Виолетово', clue: 'Боја' },
  { word: 'Розово', clue: 'Боја' },
  { word: 'Кафеаво', clue: 'Боја' },
  { word: 'Сиво', clue: 'Боја' },
  { word: 'Еден', clue: 'Број' },
  { word: 'Два', clue: 'Број' },
  { word: 'Три', clue: 'Број' },
  { word: 'Десет', clue: 'Број' },
  { word: 'Сто', clue: 'Број' },
  { word: 'Илјада', clue: 'Број' },
  { word: 'Милион', clue: 'Број' },
  { word: 'Пола', clue: 'Број' },
  { word: 'Оган', clue: 'Елемент' },
  { word: 'Вода', clue: 'Елемент' },
  { word: 'Воздух', clue: 'Елемент' },
  { word: 'Земја', clue: 'Планета' },
  { word: 'Марс', clue: 'Планета' },
  { word: 'Венера', clue: 'Планета' },
  { word: 'Јупитер', clue: 'Планета' },
  { word: 'Сатурн', clue: 'Планета' },
  { word: 'Ѕвезда', clue: 'Небо' },
  { word: 'Комета', clue: 'Небо' },
  { word: 'Галаксија', clue: 'Небо' },
  { word: 'Астронаут', clue: 'Професија' },
  { word: 'Доктор', clue: 'Професија' },
  { word: 'Учител', clue: 'Професија' },
  { word: 'Полицаец', clue: 'Професија' },
  { word: 'Пожарникар', clue: 'Професија' },
  { word: 'Готвач', clue: 'Професија' },
  { word: 'Пилот', clue: 'Професија' },
  { word: 'Шофер', clue: 'Професија' },
  { word: 'Сликар', clue: 'Професија' }
];

export default function Home() {
  const [players, setPlayers] = useState(['', '', '', '']);
  const [gameStarted, setGameStarted] = useState(false);
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
    setCurrentPlayerIndex(0);
    setShowCard(false);
    setCardRevealed(false);
  };

  const handleNextPlayer = () => {
    if (currentPlayerIndex < 3) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setShowCard(false);
      setCardRevealed(false);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setShowCard(false);
    setCardRevealed(false);
    setCurrentWord({ word: '', clue: '' });
    setImpostorIndex(-1);
    setFirstPlayer('');
    setCurrentPlayerIndex(0);
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-lg text-gray-800 bg-white"
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

  // Step-by-step reveal phase
  if (currentPlayerIndex < 4) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            {showCard ? 'Твојата карта' : 'Предај телефон на...'}
          </h1>

          {!showCard ? (
            <div className="flex flex-col items-center gap-6">
              <div className="text-6xl">📱</div>
              <p className="text-4xl font-bold text-gray-800 text-center">
                {players[currentPlayerIndex]}
              </p>
              <button
                onClick={() => setShowCard(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-lg text-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105"
              >
                Прикажи карта
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div
                onClick={() => setCardRevealed(!cardRevealed)}
                className="w-full aspect-[3/4] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl cursor-pointer flex items-center justify-center p-8 transition-all transform hover:scale-105"
              >
                {!cardRevealed ? (
                  <div className="text-center text-white">
                    <div className="text-8xl mb-4">🎴</div>
                    <p className="text-2xl font-bold">Притисни за откривање</p>
                  </div>
                ) : (
                  <div className="text-center text-white">
                    {currentPlayerIndex === impostorIndex ? (
                      <div>
                        <p className="text-3xl font-bold mb-4">🕵️ IMPOSTOR</p>
                        <p className="text-xl mb-2">Навод:</p>
                        <p className="text-4xl font-bold">{currentWord.clue}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xl mb-2">Твојот збор:</p>
                        <p className="text-5xl font-bold">{currentWord.word}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {cardRevealed && (
                <button
                  onClick={handleNextPlayer}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg text-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105"
                >
                  {currentPlayerIndex < 3 ? 'Следен играч' : 'Започни игра'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Game started - show who starts
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Играта започна!</h1>

        <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-8 rounded-xl mb-8">
          <p className="text-center text-white text-3xl font-bold">
            🎮 {firstPlayer} започнува!
          </p>
        </div>

        <div className="bg-gray-100 p-6 rounded-xl mb-8">
          <p className="text-center text-gray-700 text-lg">
            Најдете го impostor-от пред тој да ве најде вас!
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
