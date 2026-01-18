import React, { useState, useEffect, useCallback } from 'react';
import { Difficulty, Problem, GameState, DigitState, ActiveColumn } from './types';
import { generateProblem } from './utils/mathLogic';
import Keypad from './components/Keypad';
import VerticalProblem from './components/VerticalProblem';
import { Trophy, Star, ArrowLeft, RotateCcw, Award } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [problem, setProblem] = useState<Problem | null>(null);
  
  // Answer State (string to allow empty inputs)
  const [userAnswer, setUserAnswer] = useState<DigitState>({ units: '', tens: '', hundreds: '', thousands: '' });
  const [activeColumn, setActiveColumn] = useState<ActiveColumn>('units');
  
  const [isWrong, setIsWrong] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Initialize Game
  const startGame = (level: Difficulty) => {
    setDifficulty(level);
    nextProblem(level);
    setScore(0);
    setStreak(0);
    setGameState(GameState.PLAYING);
  };

  const nextProblem = (level: Difficulty) => {
    const p = generateProblem(level);
    setProblem(p);
    setUserAnswer({ units: '', tens: '', hundreds: '', thousands: '' });
    setActiveColumn('units');
    setIsWrong(false);
    setGameState(GameState.PLAYING);
  };

  const handleKeyPress = useCallback((val: string) => {
    if (gameState !== GameState.PLAYING) return;
    setIsWrong(false);

    setUserAnswer(prev => {
      const newState = { ...prev };
      newState[activeColumn] = val;
      return newState;
    });

    // Auto-advance logic (Right to Left)
    if (activeColumn === 'units') setActiveColumn('tens');
    else if (activeColumn === 'tens') setActiveColumn('hundreds');
    else if (activeColumn === 'hundreds') setActiveColumn('thousands');

  }, [activeColumn, gameState]);

  const handleDelete = useCallback(() => {
    setUserAnswer(prev => {
      const newState = { ...prev };
      // If current is empty, move right and delete that
      if (newState[activeColumn] === '') {
        if (activeColumn === 'thousands') { setActiveColumn('hundreds'); return prev; } // Just move
        if (activeColumn === 'hundreds') { setActiveColumn('tens'); newState['tens'] = ''; }
        else if (activeColumn === 'tens') { setActiveColumn('units'); newState['units'] = ''; }
        return newState;
      } else {
        newState[activeColumn] = '';
        return newState;
      }
    });
  }, [activeColumn]);

  const handleClear = () => {
    setUserAnswer({ units: '', tens: '', hundreds: '', thousands: '' });
    setActiveColumn('units');
  };

  const handleSubmit = useCallback(() => {
    if (!problem) return;

    // Construct number from strings
    const u = userAnswer.units || '0';
    const t = userAnswer.tens || '0';
    const h = userAnswer.hundreds || '0';
    const th = userAnswer.thousands || '0';
    const totalString = `${th}${h}${t}${u}`; // e.g. "0123" -> 123
    const totalVal = parseInt(totalString, 10);

    if (totalVal === problem.answer) {
      // Correct!
      setGameState(GameState.SUCCESS);
      setScore(s => s + 10);
      setStreak(s => s + 1);
      
      // Auto next problem after delay
      setTimeout(() => {
        nextProblem(difficulty);
      }, 1500);
    } else {
      // Wrong
      setIsWrong(true);
      setStreak(0);
      
      // Vibrate if on mobile
      if (navigator.vibrate) navigator.vibrate(200);
      
      // Reset active column to units so they can try again or edit
      setActiveColumn('units');
    }
  }, [problem, userAnswer, difficulty]);


  // Menu Screen
  if (gameState === GameState.MENU) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-green-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-yellow-200 rounded-full opacity-40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-200 rounded-full opacity-40 blur-3xl pointer-events-none" />

        <div className="bg-white/80 backdrop-blur-md p-8 lg:p-12 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center border-4 border-white ring-4 ring-blue-100 relative z-10">
          <div className="bg-blue-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Trophy className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">數學直式練習</h1>
          <p className="text-slate-500 mb-8 font-medium">Math Vertical Master</p>
          
          <div className="space-y-4">
            <MenuButton 
              label="初級 (兩位 + 一位)" 
              sub="Level 1"
              color="bg-green-400 hover:bg-green-500" 
              onClick={() => startGame(Difficulty.EASY)} 
            />
            <MenuButton 
              label="中級 (兩位 + 兩位)" 
              sub="Level 2"
              color="bg-yellow-400 hover:bg-yellow-500" 
              onClick={() => startGame(Difficulty.MEDIUM)} 
            />
            <MenuButton 
              label="高級 (進位練習)" 
              sub="Level 3"
              color="bg-orange-400 hover:bg-orange-500" 
              onClick={() => startGame(Difficulty.HARD)} 
            />
          </div>
        </div>
        <p className="mt-8 text-slate-400 text-sm relative z-10">Created for happy learning</p>
      </div>
    );
  }

  // Game Screen
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden select-none">
      
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 lg:w-[500px] lg:h-[500px] bg-yellow-200 rounded-full opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 lg:w-[500px] lg:h-[500px] bg-blue-200 rounded-full opacity-50 blur-3xl pointer-events-none" />

      {/* Main Layout Container */}
      <div className="w-full h-full min-h-screen flex flex-col lg:flex-row max-w-7xl mx-auto">
        
        {/* Left Section: Header + Problem */}
        <div className="flex-1 flex flex-col lg:h-screen p-4 lg:p-8 relative z-10">
            
            {/* Header Controls */}
            <div className="flex items-center justify-between mb-4 lg:mb-0 lg:absolute lg:top-8 lg:left-8 lg:right-8 lg:w-auto z-20">
                <button 
                  onClick={() => setGameState(GameState.MENU)}
                  className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm text-slate-600 active:scale-95 transition-transform hover:bg-white border border-slate-100"
                >
                  <ArrowLeft size={24} />
                </button>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-sm space-x-2 border border-slate-100">
                    <Star className="text-yellow-400 fill-yellow-400" size={20} />
                    <span className="font-bold text-slate-700 text-lg">{score}</span>
                  </div>
                  {streak > 1 && (
                    <div className="flex items-center bg-orange-100/90 backdrop-blur-sm px-3 py-2 rounded-2xl shadow-sm space-x-1 animate-pulse border border-orange-200">
                        <Award className="text-orange-500" size={18} />
                        <span className="font-bold text-orange-600">x{streak}</span>
                    </div>
                  )}
                </div>
            </div>

            {/* Problem Area - Center in remaining space */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 lg:space-y-8 mt-2 lg:mt-0">
                <div className="text-center h-8 lg:h-12 flex items-center justify-center">
                    {gameState === GameState.SUCCESS ? (
                    <h2 className="text-2xl lg:text-4xl font-bold text-green-500 animate-bounce-short">太棒了! Correct!</h2>
                    ) : (
                    <h2 className="text-lg lg:text-2xl font-semibold text-slate-400">計算結果 Calculate</h2>
                    )}
                </div>

                {problem && (
                  <div className="transform transition-transform duration-300 w-full flex justify-center">
                      <VerticalProblem 
                          problem={problem}
                          userAnswer={userAnswer}
                          activeColumn={activeColumn}
                          setActiveColumn={setActiveColumn}
                          isWrong={isWrong}
                          isSuccess={gameState === GameState.SUCCESS}
                      />
                  </div>
                )}
            </div>
        </div>

        {/* Right Section: Keypad */}
        <div className="flex-none w-full lg:w-[420px] lg:h-screen flex flex-col justify-end lg:justify-center p-4 lg:p-8 z-10 lg:bg-white/40 lg:backdrop-blur-md lg:border-l lg:border-white/50 lg:shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
            <div className="w-full max-w-md mx-auto">
                <Keypad 
                    onPress={handleKeyPress}
                    onDelete={handleDelete}
                    onClear={handleClear}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>

      </div>
    </div>
  );
};

// Helper Component for Menu Buttons
const MenuButton: React.FC<{ label: string; sub: string; color: string; onClick: () => void }> = ({ label, sub, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full ${color} text-white rounded-2xl p-4 shadow-lg transform transition-all active:scale-95 active:shadow-md flex items-center justify-between group`}
  >
    <div className="text-left">
      <div className="font-bold text-lg sm:text-xl">{label}</div>
      <div className="text-white/80 text-sm font-medium">{sub}</div>
    </div>
    <div className="bg-white/20 p-2 rounded-xl group-hover:bg-white/30 transition-colors">
      <ArrowLeft className="rotate-180" size={24} />
    </div>
  </button>
);

export default App;