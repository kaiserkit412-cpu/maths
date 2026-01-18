import React from 'react';
import { Problem, ActiveColumn, DigitState } from '../types';

interface VerticalProblemProps {
  problem: Problem;
  userAnswer: DigitState;
  activeColumn: ActiveColumn;
  setActiveColumn: (col: ActiveColumn) => void;
  isWrong: boolean;
  isSuccess: boolean;
}

const VerticalProblem: React.FC<VerticalProblemProps> = ({ 
  problem, 
  userAnswer, 
  activeColumn, 
  setActiveColumn,
  isWrong,
  isSuccess
}) => {
  
  // Split numbers into digits for alignment
  const getDigits = (num: number) => {
    const s = num.toString().padStart(4, ' '); // Supports up to 9999
    return {
      thousands: s[0],
      hundreds: s[1],
      tens: s[2],
      units: s[3]
    };
  };

  const topD = getDigits(problem.topNumber);
  const botD = getDigits(problem.bottomNumber);

  // Cell wrapper to handle layout and separators
  const Cell: React.FC<{ 
    children?: React.ReactNode; 
    hasSeparator?: boolean; 
    className?: string;
  }> = ({ children, hasSeparator, className = "" }) => (
    <div className={`
      relative flex items-center justify-center 
      w-12 sm:w-20 h-16 sm:h-24 
      ${hasSeparator ? 'border-r-2 border-slate-200 border-dashed' : ''} 
      ${className}
    `}>
      {children}
    </div>
  );

  // Helper to render a single digit
  const renderDigit = (digit: string) => (
    <div className="flex items-end justify-center w-full h-full pb-2 text-4xl sm:text-6xl font-bold text-slate-700">
      {digit !== ' ' ? digit : ''}
    </div>
  );

  // Helper to render the operator
  const renderOperator = (symbol: string | null) => (
    <div className="flex items-end justify-center w-full h-full pb-3 text-4xl sm:text-5xl font-bold text-indigo-500">
      {symbol || ''}
    </div>
  );

  // Helper to render an input box
  const renderInput = (column: ActiveColumn, value: string) => {
    const isActive = activeColumn === column;
    const baseStyle = "w-10 sm:w-16 h-12 sm:h-20 border-b-4 text-center text-3xl sm:text-5xl font-bold outline-none transition-all cursor-pointer rounded-lg select-none flex items-center justify-center";
    
    let stateStyle = "border-slate-300 bg-slate-50 text-slate-800";
    if (isActive) stateStyle = "border-indigo-500 bg-white text-indigo-700 ring-2 ring-indigo-200 shadow-lg transform -translate-y-1";
    if (isSuccess) stateStyle = "border-green-500 bg-green-100 text-green-700 border-none ring-0";
    if (isWrong && isActive) stateStyle = "border-red-500 bg-red-50 text-red-700 animate-shake";

    return (
      <div 
        onClick={(e) => {
          e.stopPropagation();
          if(!isSuccess) setActiveColumn(column);
        }}
        className={`${baseStyle} ${stateStyle}`}
      >
        {value}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      
      {/* Horizontal Problem Display */}
      <div className="mb-6 bg-indigo-50 px-6 py-3 rounded-2xl border-2 border-indigo-100 shadow-sm">
        <span className="text-2xl sm:text-3xl font-bold text-slate-600 tracking-wider">
          {problem.topNumber} + {problem.bottomNumber} = ?
        </span>
      </div>

      {/* Vertical Grid Container */}
      <div className="p-4 sm:p-8 bg-white rounded-[2rem] shadow-xl border border-slate-200">
        <div className="flex flex-col items-center">
          
          {/* Top Row */}
          <div className="flex justify-center border-b border-slate-100 border-dashed">
            <Cell>{renderOperator(null)}</Cell>
            <Cell hasSeparator>{renderDigit(topD.thousands)}</Cell>
            <Cell hasSeparator>{renderDigit(topD.hundreds)}</Cell>
            <Cell hasSeparator>{renderDigit(topD.tens)}</Cell>
            <Cell>{renderDigit(topD.units)}</Cell>
          </div>

          {/* Bottom Row */}
          <div className="flex justify-center border-b-4 border-slate-700">
            <Cell>{renderOperator('+')}</Cell>
            <Cell hasSeparator>{renderDigit(botD.thousands)}</Cell>
            <Cell hasSeparator>{renderDigit(botD.hundreds)}</Cell>
            <Cell hasSeparator>{renderDigit(botD.tens)}</Cell>
            <Cell>{renderDigit(botD.units)}</Cell>
          </div>

          {/* Answer Inputs Row */}
          <div className="flex justify-center mt-2">
             {/* Spacer for operator column */}
             <Cell />

             {/* Thousands Input */}
             <Cell hasSeparator>
                <div className={parseInt(userAnswer.thousands) > 0 || activeColumn === 'thousands' || problem.answer > 999 ? 'opacity-100' : 'opacity-10 pointer-events-none'}>
                  {renderInput('thousands', userAnswer.thousands)}
                </div>
             </Cell>

             {/* Hundreds Input */}
             <Cell hasSeparator>
                <div className={parseInt(userAnswer.hundreds) > 0 || activeColumn === 'hundreds' || activeColumn === 'thousands' || problem.answer > 99 ? 'opacity-100' : 'opacity-10 pointer-events-none'}>
                  {renderInput('hundreds', userAnswer.hundreds)}
                </div>
             </Cell>

             {/* Tens Input */}
             <Cell hasSeparator>
                {renderInput('tens', userAnswer.tens)}
             </Cell>

             {/* Units Input */}
             <Cell>
                {renderInput('units', userAnswer.units)}
             </Cell>
          </div>

          {/* Column Labels (Optional Helper) */}
          <div className="flex justify-center mt-1 opacity-30 text-xs font-bold text-slate-400">
             <Cell />
             <Cell hasSeparator>千</Cell>
             <Cell hasSeparator>百</Cell>
             <Cell hasSeparator>十</Cell>
             <Cell>個</Cell>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VerticalProblem;