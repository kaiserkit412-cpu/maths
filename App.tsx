import React, { useState, useCallback } from 'react';
import { Difficulty, Operation, Problem, GameState, DigitState, ActiveColumn, FieldType } from './types';
import { generateProblem } from './utils/mathLogic';
import Keypad from './components/Keypad';
import VerticalProblem from './components/VerticalProblem';
import { Trophy, Star, ArrowLeft, Sparkles } from 'lucide-react';

const PRAISES = ["太棒了！🌟", "真厲害！👏", "你是數學小天才！🧠", "做得好！👍", "好聰明喔！✨", "滿分！💯", "厲害到不行！🚀", "你真棒！🌈"];
const CONFETTI_COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa', '#f472b6'];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [currentPraise, setCurrentPraise] = useState("");
  const [confetti, setConfetti] = useState<{id: number, left: string, color: string, delay: string}[]>([]);
  
  const [isCopyMode, setIsCopyMode] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState(1); // 1: Part 1, 2: Part 2, 3: Horizontal Answer

  const [userAnswer, setUserAnswer] = useState<DigitState>({ units: '', tens: '', hundreds: '', thousands: '' });
  const [userIntermediate, setUserIntermediate] = useState<DigitState>({ units: '', tens: '', hundreds: '', thousands: '' });
  const [userRows, setUserRows] = useState<DigitState[]>([
    { units: '', tens: '', hundreds: '', thousands: '' }, 
    { units: '', tens: '', hundreds: '', thousands: '' }, 
    { units: '', tens: '', hundreds: '', thousands: '' }
  ]);
  const [userCarry, setUserCarry] = useState<DigitState>({ units: '', tens: '', hundreds: '', thousands: '' });
  const [userCarry2, setUserCarry2] = useState<DigitState>({ units: '', tens: '', hundreds: '', thousands: '' });
  const [userHorizontalAnswer, setUserHorizontalAnswer] = useState<string>('');
  
  const [activeColumn, setActiveColumn] = useState<ActiveColumn>('units');
  const [activeFieldType, setActiveFieldType] = useState<FieldType>('row0');
  
  const [isWrong, setIsWrong] = useState(false);
  const [wrongField, setWrongField] = useState<FieldType | null>(null);
  const [score, setScore] = useState(0);
  const [showPlusTen, setShowPlusTen] = useState(false);

  const triggerConfetti = () => {
    const newConfetti = Array.from({ length: 50 }).map((_, i) => ({
      id: Math.random() + i, left: Math.random() * 100 + '%', color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)], delay: Math.random() * 0.5 + 's'
    }));
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 3500);
  };

  const numberToDigits = (num: number): DigitState => ({
    units: (num % 10).toString(),
    tens: num >= 10 ? Math.floor((num / 10) % 10).toString() : '',
    hundreds: num >= 100 ? Math.floor((num / 100) % 10).toString() : '',
    thousands: num >= 1000 ? Math.floor((num / 1000) % 10).toString() : ''
  });

  const nextProblem = (level: Difficulty, isNewGame: boolean = false) => {
    const p = generateProblem(level, Operation.ADD);
    setProblem(p);
    setCurrentStep(1);
    const empty = { units: '', tens: '', hundreds: '', thousands: '' };
    setUserAnswer({ ...empty }); setUserIntermediate({ ...empty }); setUserCarry({ ...empty }); setUserCarry2({ ...empty });
    setUserHorizontalAnswer('');
    setShowPlusTen(false); setIsWrong(false); setWrongField(null);
    
    if (isCopyMode) {
        setUserRows(p.numbers.map(() => ({ ...empty })));
        setActiveFieldType('row0');
        const firstNum = p.numbers[0];
        setActiveColumn(firstNum >= 1000 ? 'thousands' : firstNum >= 100 ? 'hundreds' : firstNum >= 10 ? 'tens' : 'units');
    } else {
        setUserRows(p.numbers.map(n => numberToDigits(n)));
        setActiveFieldType(p.numbers.length === 3 ? 'intermediate' : 'answer');
        setActiveColumn('units');
    }
    if (isNewGame) { setScore(0); }
    setGameState(GameState.PLAYING);
  };

  const startGame = (level: Difficulty) => {
    setDifficulty(level);
    nextProblem(level, true);
  };

  const handleKeyPress = useCallback((val: string) => {
    if (gameState !== GameState.PLAYING) return;
    setIsWrong(false); setWrongField(null);

    const moveRightToLeft = (current: ActiveColumn): ActiveColumn => {
      if (current === 'units') return 'tens';
      if (current === 'tens') return 'hundreds';
      if (current === 'hundreds') return 'thousands';
      return current;
    };

    const moveLeftToRight = (current: ActiveColumn): ActiveColumn => {
      if (current === 'thousands') return 'hundreds';
      if (current === 'hundreds') return 'tens';
      if (current === 'tens') return 'units';
      return current;
    };

    if (activeFieldType === 'horizontalAnswer') {
        setUserHorizontalAnswer(prev => {
            const newVal = prev + val;
            return newVal.length > 5 ? prev : newVal; // Limit length
        });
        return;
    }

    if (activeFieldType === 'carry') {
        setUserCarry(prev => ({ ...prev, [activeColumn]: val }));
        setActiveFieldType('intermediate');
    } 
    else if (activeFieldType === 'carry2') {
        setUserCarry2(prev => ({ ...prev, [activeColumn]: val }));
        setActiveFieldType('answer');
    } 
    else if (activeFieldType === 'intermediate') {
        setUserIntermediate(prev => ({ ...prev, [activeColumn]: val }));
        setActiveColumn(moveRightToLeft(activeColumn));
    } 
    else if (activeFieldType === 'answer') {
        setUserAnswer(prev => ({ ...prev, [activeColumn]: val }));
        setActiveColumn(moveRightToLeft(activeColumn));
    } 
    else if (activeFieldType.startsWith('row')) {
        const idx = parseInt(activeFieldType.replace('row', ''));
        setUserRows(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], [activeColumn]: val };
            return next;
        });
        
        if (isCopyMode) {
          if (activeColumn !== 'units') {
              setActiveColumn(moveLeftToRight(activeColumn));
          } else {
              // Row is finished
              const nextRowIdx = idx + 1;
              const maxRowsForStep = currentStep === 1 ? 2 : 3;
              
              if (problem && nextRowIdx < maxRowsForStep) {
                  setActiveFieldType(`row${nextRowIdx}` as FieldType);
                  const nextNum = problem.numbers[nextRowIdx];
                  setActiveColumn(nextNum >= 1000 ? 'thousands' : nextNum >= 100 ? 'hundreds' : nextNum >= 10 ? 'tens' : 'units');
              } else {
                  setActiveFieldType(currentStep === 1 && problem?.numbers.length === 3 ? 'intermediate' : 'answer');
                  setActiveColumn('units');
              }
          }
        }
    }
  }, [activeColumn, activeFieldType, gameState, problem, isCopyMode, currentStep]);

  const handleDelete = useCallback(() => {
    if (activeFieldType === 'horizontalAnswer') {
        setUserHorizontalAnswer(prev => prev.slice(0, -1));
        return;
    }
    const setterMap: Record<string, React.Dispatch<React.SetStateAction<DigitState>>> = { 
      carry: setUserCarry, 
      carry2: setUserCarry2, 
      intermediate: setUserIntermediate, 
      answer: setUserAnswer 
    };
    if (setterMap[activeFieldType]) {
        setterMap[activeFieldType]((prev: DigitState) => ({ ...prev, [activeColumn]: '' }));
    } else if (activeFieldType.startsWith('row')) {
        const idx = parseInt(activeFieldType.replace('row', ''));
        setUserRows(prev => { 
          const next = [...prev]; 
          next[idx] = { ...next[idx], [activeColumn]: '' }; 
          return next; 
        });
    }
  }, [activeColumn, activeFieldType]);

  const parseInput = (state: DigitState) => parseInt(`${state.thousands}${state.hundreds}${state.tens}${state.units}` || '0', 10);

  const handleSubmit = useCallback(() => {
    if (!problem) return;
    
    // Copy Mode Verification
    if (isCopyMode) {
        if (parseInput(userRows[0]) !== problem.numbers[0]) { setIsWrong(true); setWrongField('row0'); return; }
        if (parseInput(userRows[1]) !== problem.numbers[1]) { setIsWrong(true); setWrongField('row1'); return; }
        if (currentStep >= 2 && parseInput(userRows[2]) !== problem.numbers[2]) { setIsWrong(true); setWrongField('row2'); return; }
    }

    // Step 1: Intermediate result for Triple Addition
    if (problem.numbers.length === 3 && currentStep === 1) {
        if (parseInput(userIntermediate) === problem.intermediateAnswer) {
            setCurrentStep(2);
            if (isCopyMode) {
              setActiveFieldType('row2');
              const n3 = problem.numbers[2];
              setActiveColumn(n3 >= 1000 ? 'thousands' : n3 >= 100 ? 'hundreds' : n3 >= 10 ? 'tens' : 'units');
            } else {
              setActiveFieldType('answer');
              setActiveColumn('units');
            }
        } else {
            setIsWrong(true); setWrongField('intermediate');
        }
        return;
    }

    // Step 2 (or 1 if simple): Vertical Final Answer
    // Logic: If user is on vertical answer, check it. If correct, move to horizontal step.
    if (activeFieldType === 'answer' || activeFieldType.startsWith('row') || activeFieldType.startsWith('carry')) {
       if (parseInput(userAnswer) === problem.answer) {
            setCurrentStep(3); // Move to horizontal step
            setActiveFieldType('horizontalAnswer');
       } else {
            setIsWrong(true); setWrongField('answer');
       }
       return;
    }

    // Step 3: Horizontal Answer
    if (activeFieldType === 'horizontalAnswer') {
        if (parseInt(userHorizontalAnswer) === problem.answer) {
            setGameState(GameState.SUCCESS);
            setCurrentPraise(PRAISES[Math.floor(Math.random() * PRAISES.length)]);
            setShowPlusTen(true); setScore(s => s + 10);
            triggerConfetti();
            setTimeout(() => nextProblem(difficulty), 2000);
        } else {
            setIsWrong(true); setWrongField('horizontalAnswer');
        }
    }

  }, [problem, userAnswer, userIntermediate, userRows, userHorizontalAnswer, currentStep, isCopyMode, difficulty, activeFieldType]);

  if (gameState === GameState.MENU) {
    return (
      <div className="h-screen bg-gradient-to-b from-blue-100 to-green-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-[3rem] shadow-2xl max-w-xl w-full text-center border-4 border-white">
          <Trophy className="text-blue-500 mx-auto mb-4 animate-bounce" size={48} />
          <h1 className="text-4xl font-black text-slate-800 mb-6 tracking-tight">數學直式大師</h1>
          
          <div className="flex gap-2 mb-6">
            <button onClick={() => setIsCopyMode(!isCopyMode)} className={`flex-1 p-4 rounded-2xl font-bold transition-all shadow-sm ${isCopyMode ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {isCopyMode ? '抄題模式 ON' : '快速計算 OFF'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MenuButton label="入門級 🧒" sub="1位數練習" color="bg-teal-400" onClick={() => startGame(Difficulty.BEGINNER)} />
            <MenuButton label="初級 🦁" sub="2位+1位" color="bg-green-400" onClick={() => startGame(Difficulty.EASY)} />
            <MenuButton label="中級 🦊" sub="兩位數(不進位)" color="bg-yellow-400" onClick={() => startGame(Difficulty.MEDIUM)} />
            <MenuButton label="高級 🐉" sub="進位挑戰" color="bg-orange-400" onClick={() => startGame(Difficulty.HARD)} />
            <MenuButton label="連加 (小) 🚀" sub="個位連加 (6+7+8)" color="bg-purple-400" onClick={() => startGame(Difficulty.TRIPLE_SINGLE)} />
            <MenuButton label="連加 (大) 💎" sub="雙位連加 (15+12+10)" color="bg-pink-500" onClick={() => startGame(Difficulty.TRIPLE_DOUBLE)} />
          </div>
        </div>
      </div>
    );
  }

  const getStepText = () => {
      if (gameState === GameState.SUCCESS) return currentPraise;
      if (currentStep === 3) return '最後一步：填寫橫式答案';
      if (currentStep === 1) return problem?.numbers.length === 3 ? '第一步：先算前兩個數' : '挑戰開始：計算答案';
      return '第二步：加上第三個數';
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {confetti.map(c => <div key={c.id} className="confetti" style={{left: c.left, backgroundColor: c.color, animationDelay: c.delay}} />)}
      
      <div className="flex justify-between items-center p-3 sm:p-4 bg-white/80 backdrop-blur-sm border-b z-20">
          <button onClick={() => setGameState(GameState.MENU)} className="p-2 sm:p-3 bg-white rounded-xl shadow-md active:scale-95 transition-transform"><ArrowLeft /></button>
          <div className="flex items-center gap-4">
              <div className="bg-yellow-100 px-4 sm:px-6 py-2 rounded-2xl border-2 border-yellow-300 font-black text-lg sm:text-xl flex items-center gap-2 shadow-sm">
                <Star className="text-yellow-500 fill-yellow-500" /> {score}
              </div>
          </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full overflow-hidden">
        <div className="flex-1 flex flex-col p-2 items-center justify-start overflow-y-auto">
            <div className="h-12 sm:h-16 flex items-center justify-center shrink-0">
                {gameState === GameState.SUCCESS ? (
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-green-500 animate-bounce-short flex items-center gap-2">
                    <Sparkles className="text-yellow-400" /> {currentPraise}
                  </h2>
                ) : (
                  <div className="text-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-700">
                      {getStepText()}
                    </h2>
                  </div>
                )}
            </div>
            
            {problem && (
                <div className="relative scale-[0.85] sm:scale-95 md:scale-100 origin-top transition-all">
                    {showPlusTen && <div className="absolute top-0 left-1/2 -translate-x-1/2 text-5xl font-black text-green-500 animate-float-up z-50">+10</div>}
                    <VerticalProblem 
                        problem={problem} 
                        userAnswer={userAnswer} 
                        userIntermediate={userIntermediate} 
                        userRows={userRows} 
                        userCarry={userCarry} 
                        userCarry2={userCarry2} 
                        userHorizontalAnswer={userHorizontalAnswer}
                        activeColumn={activeColumn} 
                        setActiveColumn={setActiveColumn} 
                        activeFieldType={activeFieldType} 
                        setActiveFieldType={setActiveFieldType} 
                        isWrong={isWrong} 
                        wrongField={wrongField} 
                        isSuccess={gameState === GameState.SUCCESS} 
                        isCopyMode={isCopyMode} 
                        currentStep={currentStep}
                    />
                </div>
            )}
        </div>
        
        <div className="w-full md:w-[420px] p-2 sm:p-4 md:p-8 bg-white/60 backdrop-blur-md border-t md:border-t-0 md:border-l flex flex-col justify-center shadow-lg shrink-0 z-30">
            <Keypad onPress={handleKeyPress} onDelete={handleDelete} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

const MenuButton: React.FC<{ label: string; sub: string; color: string; onClick: () => void }> = ({ label, sub, color, onClick }) => (
  <button onClick={onClick} className={`${color} text-white p-5 rounded-[2rem] shadow-lg active:scale-95 transition-all text-left group hover:brightness-105`}>
    <div className="font-black text-xl mb-1 group-hover:translate-x-1 transition-transform">{label}</div>
    <div className="text-white/80 text-xs font-bold">{sub}</div>
  </button>
);

export default App;