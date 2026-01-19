import React, { useState, useEffect, useCallback } from 'react';
import { Difficulty, Problem, GameState, DigitState, ActiveColumn, FieldType, LeaderboardEntry } from './types';
import { generateProblem } from './utils/mathLogic';
import Keypad from './components/Keypad';
import VerticalProblem from './components/VerticalProblem';
import { Trophy, Star, ArrowLeft, Award, Save, Crown, Pencil, Ban } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [problem, setProblem] = useState<Problem | null>(null);
  
  // Settings
  const [isCopyMode, setIsCopyMode] = useState<boolean>(true);

  // Input States
  const [userAnswer, setUserAnswer] = useState<DigitState>({ units: '', tens: '', hundreds: '', thousands: '' });
  const [userTop, setUserTop] = useState<DigitState>({ units: '', tens: '', hundreds: '', thousands: '' });
  const [userBottom, setUserBottom] = useState<DigitState>({ units: '', tens: '', hundreds: '', thousands: '' });
  const [userCarry, setUserCarry] = useState<DigitState>({ units: '', tens: '', hundreds: '', thousands: '' });
  
  // Navigation State
  const [activeColumn, setActiveColumn] = useState<ActiveColumn>('tens'); // Default start at tens for copying
  const [activeFieldType, setActiveFieldType] = useState<FieldType>('top'); // Default start at top row
  
  // Game Logic State
  const [isWrong, setIsWrong] = useState(false);
  const [wrongField, setWrongField] = useState<FieldType | null>(null); // To shake specific rows
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [playerName, setPlayerName] = useState('');

  // Load Leaderboard on mount
  useEffect(() => {
    const saved = localStorage.getItem('math-app-leaderboard');
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
  }, []);

  const saveScore = () => {
    if (!playerName.trim()) return;
    
    const newEntry: LeaderboardEntry = {
      name: playerName.trim(),
      score: score,
      date: new Date().toLocaleDateString()
    };
    
    const newBoard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Keep top 5
      
    setLeaderboard(newBoard);
    localStorage.setItem('math-app-leaderboard', JSON.stringify(newBoard));
    
    setShowSaveModal(false);
    setGameState(GameState.MENU);
    setPlayerName('');
  };

  const handleQuitGame = () => {
    if (score > 0) {
      setShowSaveModal(true);
    } else {
      setGameState(GameState.MENU);
    }
  };

  // Helper to convert number to digit state
  const numberToDigits = (num: number): DigitState => {
    return {
      units: (num % 10).toString(),
      tens: num >= 10 ? Math.floor((num / 10) % 10).toString() : '',
      hundreds: num >= 100 ? Math.floor((num / 100) % 10).toString() : '',
      thousands: num >= 1000 ? Math.floor((num / 1000) % 10).toString() : ''
    };
  };

  // Initialize Game
  const startGame = (level: Difficulty) => {
    setDifficulty(level);
    setScore(0);
    setStreak(0);
    // Logic for first problem is inside nextProblem, but we need to call it after state updates? 
    // Actually we can call it directly, but we need to pass the level
    nextProblem(level, true); // true = reset score/streak implicitly by being new game context, but here just generate
    setGameState(GameState.PLAYING);
  };

  const nextProblem = (level: Difficulty, isNewGame: boolean = false) => {
    const p = generateProblem(level);
    setProblem(p);
    
    // Reset all inputs
    const empty = { units: '', tens: '', hundreds: '', thousands: '' };
    setUserAnswer(empty);
    setUserCarry(empty);
    
    if (isCopyMode) {
        setUserTop(empty);
        setUserBottom(empty);
        // Reset cursor to Top Number, Tens place (good starting point for writing)
        setActiveFieldType('top');
        setActiveColumn(p.topNumber >= 100 ? 'hundreds' : 'tens');
    } else {
        // Pre-fill numbers
        setUserTop(numberToDigits(p.topNumber));
        setUserBottom(numberToDigits(p.bottomNumber));
        // Start at Answer, Units
        setActiveFieldType('answer');
        setActiveColumn('units');
    }
    
    setIsWrong(false);
    setWrongField(null);
    if (isNewGame) {
        setScore(0);
        setStreak(0);
    }
    setGameState(GameState.PLAYING);
  };

  const handleKeyPress = useCallback((val: string) => {
    if (gameState !== GameState.PLAYING) return;
    setIsWrong(false);
    setWrongField(null);

    const updateState = (setter: React.Dispatch<React.SetStateAction<DigitState>>) => {
      setter(prev => ({ ...prev, [activeColumn]: val }));
    };

    if (activeFieldType === 'carry') {
      updateState(setUserCarry);
      // Carry usually marks and then goes to answer
      setActiveFieldType('answer');
    } 
    else if (activeFieldType === 'top') {
      if (!isCopyMode) return; // Prevent editing if not in copy mode
      updateState(setUserTop);
      // Copying logic
      if (activeColumn === 'thousands') setActiveColumn('hundreds');
      else if (activeColumn === 'hundreds') setActiveColumn('tens');
      else if (activeColumn === 'tens') setActiveColumn('units');
      else if (activeColumn === 'units') {
         setActiveFieldType('bottom');
         if (problem && problem.bottomNumber >= 100) setActiveColumn('hundreds');
         else setActiveColumn('tens'); 
      }
    }
    else if (activeFieldType === 'bottom') {
      if (!isCopyMode) return; // Prevent editing
      updateState(setUserBottom);
      // Copying logic
      if (activeColumn === 'thousands') setActiveColumn('hundreds');
      else if (activeColumn === 'hundreds') setActiveColumn('tens');
      else if (activeColumn === 'tens') setActiveColumn('units');
      else if (activeColumn === 'units') {
         setActiveFieldType('answer');
         setActiveColumn('units'); 
      }
    }
    else {
      // Answer logic: Right to Left
      updateState(setUserAnswer);
      if (activeColumn === 'units') setActiveColumn('tens');
      else if (activeColumn === 'tens') setActiveColumn('hundreds');
      else if (activeColumn === 'hundreds') setActiveColumn('thousands');
    }

  }, [activeColumn, activeFieldType, gameState, problem, isCopyMode]);

  const handleDelete = useCallback(() => {
    const clearState = (setter: React.Dispatch<React.SetStateAction<DigitState>>) => {
        setter(prev => ({ ...prev, [activeColumn]: '' }));
    };

    if (activeFieldType === 'carry') {
       clearState(setUserCarry);
    } else if (activeFieldType === 'top') {
       if (!isCopyMode) return;
       if (userTop[activeColumn] === '') {
          if (activeColumn === 'units') { setActiveColumn('tens'); }
          else if (activeColumn === 'tens') { setActiveColumn('hundreds'); }
          else if (activeColumn === 'hundreds') { setActiveColumn('thousands'); }
       } else {
          clearState(setUserTop);
       }
    } else if (activeFieldType === 'bottom') {
        if (!isCopyMode) return;
        if (userBottom[activeColumn] === '') {
            if (activeColumn === 'units') { setActiveColumn('tens'); }
            else if (activeColumn === 'tens') { setActiveColumn('hundreds'); }
            else if (activeColumn === 'hundreds') { setActiveColumn('thousands'); }
         } else {
            clearState(setUserBottom);
         }
    } else {
      if (userAnswer[activeColumn] === '') {
          if (activeColumn === 'thousands') { setActiveColumn('hundreds'); }
          else if (activeColumn === 'hundreds') { setActiveColumn('tens'); }
          else if (activeColumn === 'tens') { setActiveColumn('units'); }
       } else {
          clearState(setUserAnswer);
       }
    }
  }, [activeColumn, activeFieldType, userAnswer, userTop, userBottom, isCopyMode]);

  const parseInput = (state: DigitState) => {
    const s = `${state.thousands}${state.hundreds}${state.tens}${state.units}`;
    return parseInt(s || '0', 10);
  };

  const handleSubmit = useCallback(() => {
    if (!problem) return;

    const inputTop = parseInput(userTop);
    const inputBottom = parseInput(userBottom);
    const inputAnswer = parseInput(userAnswer);

    if (isCopyMode) {
        if (inputTop !== problem.topNumber) {
            setIsWrong(true);
            setWrongField('top');
            if (navigator.vibrate) navigator.vibrate(200);
            return;
        }
        if (inputBottom !== problem.bottomNumber) {
            setIsWrong(true);
            setWrongField('bottom');
            if (navigator.vibrate) navigator.vibrate(200);
            return;
        }
    }

    if (inputAnswer === problem.answer) {
      setGameState(GameState.SUCCESS);
      setScore(s => s + 10);
      setStreak(s => s + 1);
      
      setTimeout(() => {
        nextProblem(difficulty);
      }, 1500);
    } else {
      setIsWrong(true);
      setWrongField('answer');
      setStreak(0);
      if (navigator.vibrate) navigator.vibrate(200);
      
      setActiveColumn('units');
      setActiveFieldType('answer');
    }
  }, [problem, userAnswer, userTop, userBottom, difficulty, isCopyMode]);


  // Menu Screen
  if (gameState === GameState.MENU) {
    return (
      <div className="h-screen bg-gradient-to-b from-blue-100 to-green-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
        
        <div className="bg-white/80 backdrop-blur-md p-6 lg:p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center border-4 border-white ring-4 ring-blue-100 relative z-10 flex flex-col gap-6 max-h-full overflow-y-auto scrollbar-hide">
          <div>
            <div className="bg-blue-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-1 tracking-tight">數學直式練習</h1>
            <p className="text-slate-500 font-medium text-sm">請將橫式題目寫成直式!</p>
          </div>

          {/* Copy Mode Toggle */}
          <div className="bg-indigo-50 p-1 rounded-xl flex items-center relative cursor-pointer" onClick={() => setIsCopyMode(!isCopyMode)}>
            <div className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-300 z-10 ${isCopyMode ? 'text-indigo-600' : 'text-slate-400'}`}>
               <span className="flex items-center justify-center gap-1"><Pencil size={16}/> 抄題模式</span>
            </div>
            <div className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-300 z-10 ${!isCopyMode ? 'text-indigo-600' : 'text-slate-400'}`}>
               <span className="flex items-center justify-center gap-1"><Ban size={16}/> 快速模式</span>
            </div>
            <div className={`absolute w-[calc(50%-4px)] h-[calc(100%-8px)] bg-white shadow-sm rounded-lg transition-all duration-300 top-1 left-1 ${isCopyMode ? 'translate-x-0' : 'translate-x-full'}`} />
          </div>
          
          <div className="space-y-3 shrink-0">
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

          {leaderboard.length > 0 && (
            <div className="mt-4 pt-4 border-t-2 border-slate-100 shrink-0">
                <div className="flex items-center justify-center gap-2 mb-3 text-amber-500">
                    <Crown size={20} />
                    <h3 className="font-bold text-lg">龍虎榜 Leaderboard</h3>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                    {leaderboard.map((entry, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <span className={`
                                    w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white
                                    ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-orange-400' : 'bg-slate-200 text-slate-500'}
                                `}>
                                    {idx + 1}
                                </span>
                                <span className="font-semibold text-slate-700">{entry.name}</span>
                            </div>
                            <span className="font-bold text-indigo-500">{entry.score} 分</span>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Game Screen
  return (
    <div className="h-screen bg-slate-50 relative overflow-hidden select-none flex flex-col">
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 lg:w-[500px] lg:h-[500px] bg-yellow-200 rounded-full opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 lg:w-[500px] lg:h-[500px] bg-blue-200 rounded-full opacity-50 blur-3xl pointer-events-none" />

      <div className="w-full h-full flex flex-col md:flex-row max-w-7xl mx-auto">
        <div className="flex-1 flex flex-col p-2 sm:p-4 md:p-6 lg:p-8 relative z-10 overflow-y-auto scrollbar-hide">
            <div className="flex items-center justify-between mb-4 flex-none">
                <button 
                  onClick={handleQuitGame}
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

            <div className="flex-1 flex flex-col items-center justify-start sm:justify-center space-y-2 lg:space-y-8 min-h-[300px]">
                <div className="text-center h-8 lg:h-12 flex items-center justify-center flex-none">
                    {gameState === GameState.SUCCESS ? (
                        <h2 className="text-xl lg:text-4xl font-bold text-green-500 animate-bounce-short">太棒了! Correct!</h2>
                    ) : (
                        <h2 className="text-base lg:text-2xl font-semibold text-slate-400">
                            {isCopyMode && (wrongField === 'top' || wrongField === 'bottom') 
                                ? '題目抄寫錯誤 Check numbers!' 
                                : (isCopyMode ? '請抄寫並計算 Copy & Solve' : '請計算答案 Solve the problem')}
                        </h2>
                    )}
                </div>

                {problem && (
                  <div className="transform transition-transform duration-300 w-full flex justify-center mb-4 scale-90 md:scale-100">
                      <VerticalProblem 
                          problem={problem}
                          userAnswer={userAnswer}
                          userTop={userTop}
                          userBottom={userBottom}
                          userCarry={userCarry}
                          activeColumn={activeColumn}
                          setActiveColumn={setActiveColumn}
                          activeFieldType={activeFieldType}
                          setActiveFieldType={setActiveFieldType}
                          isWrong={isWrong}
                          wrongField={wrongField}
                          isSuccess={gameState === GameState.SUCCESS}
                          isCopyMode={isCopyMode}
                      />
                  </div>
                )}
            </div>
        </div>

        <div className="flex-none w-full md:w-[340px] lg:w-[420px] lg:h-full flex flex-col justify-end md:justify-center p-2 sm:p-4 lg:p-8 z-20 bg-white/60 md:bg-white/40 backdrop-blur-md md:border-l md:border-white/50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] md:shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
            <div className="w-full max-w-md mx-auto">
                <Keypad 
                    onPress={handleKeyPress}
                    onDelete={handleDelete}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
      </div>

      {showSaveModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-bounce-short">
                <h3 className="text-2xl font-bold text-slate-800 text-center mb-2">紀錄成績 Save Score</h3>
                <p className="text-slate-500 text-center mb-6">你獲得了 {score} 分!</p>
                
                <input 
                    type="text" 
                    placeholder="輸入名字 Your Name" 
                    className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl p-4 text-center text-xl font-bold text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-colors mb-4"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={10}
                />
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => setGameState(GameState.MENU)}
                        className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        放棄 Skip
                    </button>
                    <button 
                        onClick={saveScore}
                        disabled={!playerName.trim()}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        <Save size={20} />
                        儲存 Save
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

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