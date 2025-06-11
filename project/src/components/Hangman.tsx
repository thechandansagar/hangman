import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Trophy, Skull, PartyPopper } from 'lucide-react';
import { wordList } from '../utils/wordList';
import { DifficultyAI } from '../utils/aiDifficulty';

const HANGMAN_PARTS = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const hangmanPartVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const letterVariants = {
  correct: { 
    scale: [1, 1.2, 1],
    color: '#065F46',
    backgroundColor: '#D1FAE5',
    transition: { duration: 0.3 }
  },
  incorrect: {
    rotate: [0, -10, 10, -10, 0],
    color: '#991B1B',
    backgroundColor: '#FEE2E2',
    transition: { duration: 0.5 }
  }
};

const victoryDance = {
  initial: {
    y: 0,
    x: 0,
    rotate: 0,
  },
  fall: {
    y: 200,
    x: 50,
    rotate: 90,
    transition: {
      duration: 1,
      ease: "easeIn"
    }
  },
  dance: {
    y: [200, 170, 200],
    x: [50, 70, 50],
    rotate: [90, 70, 110, 90],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  }
};

const deathAnimation = {
  swing: {
    rotate: [0, 15, -15, 10, -10, 5, -5, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  }
};

export default function Hangman() {
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [difficultyAI] = useState(new DifficultyAI());
  const [stats, setStats] = useState(difficultyAI.getStats());
  const [shakePole, setShakePole] = useState(false);
  const [deathAnimationStarted, setDeathAnimationStarted] = useState(false);
  const [victoryAnimationPhase, setVictoryAnimationPhase] = useState<'initial' | 'falling' | 'dancing'>('initial');

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (gameStatus === 'lost') {
      setTimeout(() => setDeathAnimationStarted(true), 500);
    } else if (gameStatus === 'won') {
      setVictoryAnimationPhase('falling');
      setTimeout(() => setVictoryAnimationPhase('dancing'), 1000);
    } else {
      setDeathAnimationStarted(false);
      setVictoryAnimationPhase('initial');
    }
  }, [gameStatus]);

  const startNewGame = () => {
    const difficulty = difficultyAI.getCurrentDifficulty();
    const words = wordList[difficulty];
    const newWord = words[Math.floor(Math.random() * words.length)];
    setWord(newWord);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGameStatus('playing');
    setStats(difficultyAI.getStats());
    setDeathAnimationStarted(false);
    setVictoryAnimationPhase('initial');
  };

  const getCurrentPattern = () => {
    return word
      .split('')
      .map(letter => guessedLetters.has(letter) ? letter : '_')
      .join('');
  };

  const handleGuess = (letter: string) => {
    if (gameStatus !== 'playing' || guessedLetters.has(letter)) return;

    const newGuessedLetters = new Set([...guessedLetters, letter]);
    setGuessedLetters(newGuessedLetters);

    if (!word.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      setShakePole(true);
      setTimeout(() => setShakePole(false), 500);
      
      if (newWrongGuesses >= HANGMAN_PARTS) {
        setGameStatus('lost');
        difficultyAI.updateStats(false, newGuessedLetters.size);
        setStats(difficultyAI.getStats());
      }
    } else {
      const pattern = word
        .split('')
        .map(l => newGuessedLetters.has(l) ? l : '_')
        .join('');
      
      if (!pattern.includes('_')) {
        setGameStatus('won');
        difficultyAI.updateStats(true, newGuessedLetters.size);
        setStats(difficultyAI.getStats());
      }
    }
  };

  const renderHangman = () => {
    const parts = [
      { char: 'O', label: 'head', className: 'text-4xl text-gray-800' },
      { char: '|', label: 'body', className: 'text-4xl text-gray-800' },
      { char: '/', label: 'leftArm', className: 'text-4xl text-gray-800' },
      { char: '\\', label: 'rightArm', className: 'text-4xl text-gray-800' },
      { char: '/', label: 'leftLeg', className: 'text-4xl text-gray-800' },
      { char: '\\', label: 'rightLeg', className: 'text-4xl text-gray-800' }
    ];

    return (
      <motion.div
        className="relative font-mono text-4xl scale-150 mt-12 mb-16"
        animate={shakePole ? { x: [-2, 2, -2, 2, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <pre className="relative text-gray-800">
          {`
  +---+
  |   |`}
        </pre>
        <motion.div 
          className="absolute top-[4rem] left-[5rem] flex flex-col items-center origin-top"
          initial="initial"
          animate={
            gameStatus === 'won'
              ? victoryAnimationPhase === 'falling'
                ? 'fall'
                : victoryAnimationPhase === 'dancing'
                ? 'dance'
                : 'initial'
              : deathAnimationStarted
              ? deathAnimation.swing
              : {}
          }
        >
          <AnimatePresence>
            {parts.map((part, index) => (
              wrongGuesses > index && (
                <motion.span
                  key={part.label}
                  className={`absolute ${part.className} ${deathAnimationStarted ? 'text-red-600' : ''} ${gameStatus === 'won' ? 'text-green-600' : ''}`}
                  style={{
                    top: index === 0 ? 0 : index === 1 ? '1.5rem' : index < 3 ? '1.5rem' : '3rem',
                    left: index === 2 ? '-1rem' : index === 3 ? '1rem' : index === 4 ? '-1rem' : index === 5 ? '1rem' : 0
                  }}
                  variants={hangmanPartVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {part.char}
                </motion.span>
              )
            ))}
          </AnimatePresence>
        </motion.div>
        <pre className="text-gray-800">
          {`
  |  
  |
=========`}
        </pre>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="bg-white rounded-lg shadow-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <motion.h1 
                className="text-3xl font-bold text-gray-800"
                animate={{ scale: gameStatus !== 'playing' ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.5 }}
              >
                Hangman
              </motion.h1>
              <motion.div 
                className="flex items-center bg-purple-100 px-3 py-1 rounded-full"
                whileHover={{ scale: 1.05 }}
              >
                <Brain className="w-5 h-5 mr-2 text-purple-500" />
                <span className="text-purple-700 font-medium capitalize">
                  {stats.difficulty} Mode
                </span>
              </motion.div>
            </div>
            <motion.button
              onClick={startNewGame}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              New Game
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center">
              {renderHangman()}
              <motion.div 
                className="mt-4 text-2xl font-mono tracking-wider"
                animate={{ scale: gameStatus !== 'playing' ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.5 }}
              >
                {getCurrentPattern().split('').map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="inline-block mx-1"
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            <div className="flex flex-col items-center justify-between">
              <div className="w-full">
                <div className="grid grid-cols-7 gap-2 mb-8">
                  {ALPHABET.map(letter => (
                    <motion.button
                      key={letter}
                      onClick={() => handleGuess(letter)}
                      disabled={guessedLetters.has(letter) || gameStatus !== 'playing'}
                      className={`
                        w-10 h-10 rounded-lg font-bold text-lg flex items-center justify-center
                        ${
                          !guessedLetters.has(letter) && gameStatus === 'playing'
                            ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            : ''
                        }
                        ${gameStatus !== 'playing' ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      whileHover={!guessedLetters.has(letter) && gameStatus === 'playing' ? { scale: 1.1 } : {}}
                      whileTap={!guessedLetters.has(letter) && gameStatus === 'playing' ? { scale: 0.9 } : {}}
                      animate={
                        guessedLetters.has(letter)
                          ? word.includes(letter)
                            ? "correct"
                            : "incorrect"
                          : {}
                      }
                      variants={letterVariants}
                    >
                      {letter}
                    </motion.button>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {gameStatus !== 'playing' && (
                  <motion.div 
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      {gameStatus === 'won' ? (
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          <PartyPopper className="w-8 h-8 text-yellow-500 mr-2" />
                        </motion.div>
                      ) : (
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          <Skull className="w-8 h-8 text-red-500 mr-2" />
                        </motion.div>
                      )}
                      <p className="text-xl font-bold">
                        {gameStatus === 'won'
                          ? 'Congratulations! You won! 🎉'
                          : `Game Over! The word was: ${word}`}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div 
                className="w-full bg-gray-50 rounded-lg p-4"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center mb-2">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                  <h2 className="text-lg font-semibold">Stats</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Games Played</p>
                    <motion.p 
                      className="text-lg font-semibold"
                      key={stats.gamesPlayed}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.3 }}
                    >
                      {stats.gamesPlayed}
                    </motion.p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Win Rate</p>
                    <motion.p 
                      className="text-lg font-semibold"
                      key={stats.winRate}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.3 }}
                    >
                      {stats.winRate.toFixed(1)}%
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}