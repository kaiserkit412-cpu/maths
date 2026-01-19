import React from 'react';
import { Problem, ActiveColumn, DigitState, FieldType } from '../types';

interface VerticalProblemProps {
  problem: Problem;
  userAnswer: DigitState;
  userTop: DigitState;
  userBottom: DigitState;
  userCarry: DigitState;
  activeColumn: ActiveColumn;
  setActiveColumn: (col: ActiveColumn) => void;
  activeFieldType: FieldType;
  setActiveFieldType: (type: FieldType) => void;
  isWrong: boolean;
  wrongField: FieldType | null;
  isSuccess: boolean;
  isCopyMode: boolean;
}

const VerticalProblem: React.FC<VerticalProblemProps> = ({ 
  problem, 
  userAnswer, 
  userTop,
  userBottom,
  userCarry,
  activeColumn, 
  setActiveColumn,
  activeFieldType,
  setActiveFieldType,
  isWrong,
  wrongField,
  isSuccess,
  isCopyMode
}) => {
  
  // Cell wrapper to handle layout and separators
  const Cell: React.FC<{ 
    children?: React.ReactNode; 
    hasSeparator?: boolean; 
    className?: string;
  }> = ({ children, hasSeparator, className = "" }) => (
    <div className={`
      relative flex items-center justify-center 
      w-12 sm:w-20
      ${className}
      ${hasSeparator ? 'border-r-2 border-slate-200 border-dashed' : ''} 
    `}>
      {children}
    </div>
  );

  // Helper to render the operator
  const renderOperator = (symbol: string | null) => (
    <div className="flex items-end justify-center w-full h-full pb-3 text-4xl sm:text-5xl font-bold text-indigo-500">
      {symbol || ''}
    </div>
  );

  // Helper to render an input box (used for Answer, Top, Bottom)
  const renderInput = (column: ActiveColumn, value: string, type: FieldType) => {
    const isActive = activeColumn === column && activeFieldType === type;
    const isTargetWrong = isWrong && wrongField === type; // Only shake if this specific row is wrong
    
    // Determine if this specific input is read-only (based on Copy Mode)
    const isReadOnly = !isCopyMode && (type === 'top' || type === 'bottom');

    // Base styles
    const baseStyle = "w-10 sm:w-16 h-12 sm:h-20 text-center text-3xl sm:text-5xl font-bold outline-none transition-all rounded-lg select-none flex items-center justify-center";
    
    // Type specific styling
    let typeStyle = "";
    if (type === 'answer') {
        typeStyle = "border-b-4 border-slate-300 bg-slate-50 text-slate-800 cursor-pointer";
    } else {
        if (isReadOnly) {
             typeStyle = "border-none bg-transparent text-slate-800 cursor-default"; // Plain text look
        } else {
             typeStyle = "border-2 border-slate-100 bg-transparent text-slate-600 hover:bg-slate-50 cursor-pointer";
        }
    }

    // State styling
    if (isActive) {
        if (type === 'answer') {
            typeStyle = "border-b-4 border-indigo-500 bg-white text-indigo-700 ring-2 ring-indigo-200 shadow-lg transform -translate-y-1 cursor-pointer";
        } else if (!isReadOnly) {
            typeStyle = "border-2 border-blue-400 bg-blue-50 text-blue-600 shadow-md scale-105 cursor-pointer";
        }
    }

    if (isSuccess) {
         // Success state overrides
         if (type === 'answer') typeStyle = "border-none bg-green-100 text-green-700";
         else typeStyle = "border-none bg-transparent text-slate-600 opacity-60";
    }

    if (isTargetWrong && isActive) typeStyle = "border-red-500 bg-red-50 text-red-700 animate-shake"; // Only shake active wrong field
    if (isTargetWrong && !isActive) typeStyle = "border-red-200 bg-red-50 text-red-400"; // Passive error state

    return (
      <div 
        onClick={(e) => {
          e.stopPropagation();
          // Only allow activating if not success AND not readonly
          if(!isSuccess && !isReadOnly) {
            setActiveColumn(column);
            setActiveFieldType(type);
          }
        }}
        className={`${baseStyle} ${typeStyle}`}
      >
        {value}
      </div>
    );
  };

  // Helper to render an input circle for CARRY
  const renderCarry = (column: ActiveColumn, value: string) => {
    const isActive = activeColumn === column && activeFieldType === 'carry';
    
    const baseStyle = "w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 text-center text-lg sm:text-2xl font-bold flex items-center justify-center cursor-pointer transition-all select-none mb-1";
    
    let stateStyle = "border-slate-200 border-dashed text-slate-400 bg-transparent hover:bg-slate-50";
    if (value) stateStyle = "border-slate-400 border-solid text-slate-600 bg-white";
    if (isActive) stateStyle = "border-orange-400 border-solid bg-orange-50 text-orange-600 ring-2 ring-orange-200 scale-110 shadow-md";
    if (isSuccess && value) stateStyle = "border-green-300 bg-green-50 text-green-600";
    
    return (
        <div 
            onClick={(e) => {
                e.stopPropagation();
                if(!isSuccess) {
                    setActiveColumn(column);
                    setActiveFieldType('carry');
                }
            }}
            className={`${baseStyle} ${stateStyle}`}
        >
            {value}
        </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      
      {/* Horizontal Problem Display (Source to Copy) - Only show in Copy Mode to reduce clutter if not needed? 
          Actually user said "turn off copy", implies they don't need to see horizontal if they have vertical pre-filled.
          But horizontal equation is always good for context. I'll keep it but maybe visual style changes?
          Let's keep it consistent.
      */}
      <div className="mb-6 bg-indigo-50 px-6 py-4 rounded-2xl border-2 border-indigo-100 shadow-sm flex items-center gap-3">
        <span className="text-3xl sm:text-4xl font-bold text-slate-700 tracking-wider">
          {problem.topNumber} + {problem.bottomNumber} = 
        </span>
        <div className="w-12 h-12 bg-white rounded-lg border-2 border-indigo-200 flex items-center justify-center text-indigo-300 font-bold text-xl">
            ?
        </div>
      </div>

      {/* Vertical Grid Container */}
      <div className="p-4 sm:p-8 bg-white rounded-[2rem] shadow-xl border border-slate-200">
        <div className="flex flex-col items-center">
          
          {/* Row 0: Carry Inputs */}
          <div className="flex justify-center mb-1">
             <Cell className="h-10 sm:h-12" />
             <Cell className="h-10 sm:h-12" hasSeparator>{renderCarry('thousands', userCarry.thousands)}</Cell>
             <Cell className="h-10 sm:h-12" hasSeparator>{renderCarry('hundreds', userCarry.hundreds)}</Cell>
             <Cell className="h-10 sm:h-12" hasSeparator>{renderCarry('tens', userCarry.tens)}</Cell>
             <Cell className="h-10 sm:h-12" >{/* No carry for units */}</Cell>
          </div>

          {/* Row 1: Top Number (Input) */}
          <div className="flex justify-center border-b border-slate-100 border-dashed">
            <Cell className="h-16 sm:h-24">{renderOperator(null)}</Cell>
            <Cell className="h-16 sm:h-24" hasSeparator>{renderInput('thousands', userTop.thousands, 'top')}</Cell>
            <Cell className="h-16 sm:h-24" hasSeparator>{renderInput('hundreds', userTop.hundreds, 'top')}</Cell>
            <Cell className="h-16 sm:h-24" hasSeparator>{renderInput('tens', userTop.tens, 'top')}</Cell>
            <Cell className="h-16 sm:h-24">{renderInput('units', userTop.units, 'top')}</Cell>
          </div>

          {/* Row 2: Bottom Number (Input) */}
          <div className="flex justify-center border-b-4 border-slate-700">
            <Cell className="h-16 sm:h-24">{renderOperator('+')}</Cell>
            <Cell className="h-16 sm:h-24" hasSeparator>{renderInput('thousands', userBottom.thousands, 'bottom')}</Cell>
            <Cell className="h-16 sm:h-24" hasSeparator>{renderInput('hundreds', userBottom.hundreds, 'bottom')}</Cell>
            <Cell className="h-16 sm:h-24" hasSeparator>{renderInput('tens', userBottom.tens, 'bottom')}</Cell>
            <Cell className="h-16 sm:h-24">{renderInput('units', userBottom.units, 'bottom')}</Cell>
          </div>

          {/* Row 3: Answer Inputs */}
          <div className="flex justify-center mt-2">
             <Cell className="h-16 sm:h-24" />
             <Cell className="h-16 sm:h-24" hasSeparator>
                {/* Always show answer inputs, let user navigate freely */}
                {renderInput('thousands', userAnswer.thousands, 'answer')}
             </Cell>
             <Cell className="h-16 sm:h-24" hasSeparator>
                {renderInput('hundreds', userAnswer.hundreds, 'answer')}
             </Cell>
             <Cell className="h-16 sm:h-24" hasSeparator>
                {renderInput('tens', userAnswer.tens, 'answer')}
             </Cell>
             <Cell className="h-16 sm:h-24">
                {renderInput('units', userAnswer.units, 'answer')}
             </Cell>
          </div>

          {/* Column Labels */}
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