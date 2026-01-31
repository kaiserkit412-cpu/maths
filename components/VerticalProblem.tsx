import React from 'react';
import { Problem, ActiveColumn, DigitState, FieldType, Operation } from '../types';

interface VerticalProblemProps {
  problem: Problem;
  userAnswer: DigitState;
  userIntermediate: DigitState;
  userRows: DigitState[];
  userCarry: DigitState;
  userCarry2: DigitState;
  userHorizontalAnswer: string;
  activeColumn: ActiveColumn;
  setActiveColumn: (col: ActiveColumn) => void;
  activeFieldType: FieldType;
  setActiveFieldType: (type: FieldType) => void;
  isWrong: boolean;
  wrongField: FieldType | null;
  isSuccess: boolean;
  isCopyMode: boolean;
  currentStep: number;
}

const VerticalProblem: React.FC<VerticalProblemProps> = ({ 
  problem, 
  userAnswer, 
  userIntermediate,
  userRows,
  userCarry,
  userCarry2,
  userHorizontalAnswer,
  activeColumn, 
  setActiveColumn,
  activeFieldType,
  setActiveFieldType,
  isWrong,
  wrongField,
  isSuccess,
  isCopyMode,
  currentStep
}) => {
  
  const isTriple = problem.numbers.length === 3;
  
  // Compact styling for iPad fitting
  const cellWidth = "w-10 sm:w-14 md:w-16"; 
  const cellHeight = isTriple ? "h-12 sm:h-14 md:h-16" : "h-14 sm:h-16 md:h-20"; // Shorter cells for triple mode
  const textSize = isTriple ? "text-2xl sm:text-3xl md:text-4xl" : "text-3xl sm:text-4xl md:text-5xl";
  const separatorHeight = isTriple ? "h-12 sm:h-14 md:h-16" : "h-14 sm:h-16 md:h-20";

  const Cell: React.FC<{ 
    children?: React.ReactNode; 
    hasSeparator?: boolean; 
    className?: string;
  }> = ({ children, hasSeparator, className = "" }) => (
    <div className={`relative flex items-center justify-center ${cellWidth} ${className} ${hasSeparator ? 'border-r border-slate-200 border-dashed' : ''}`}>
      {children}
    </div>
  );

  const renderInput = (column: ActiveColumn, value: string, type: FieldType, disabled: boolean = false) => {
    const isActive = activeColumn === column && activeFieldType === type;
    const isTargetWrong = isWrong && wrongField === type;
    const isReadOnly = !isCopyMode && type.startsWith('row');
    const isIntermediate = type === 'intermediate';

    const baseStyle = `${cellWidth} ${cellHeight} text-center ${textSize} font-bold outline-none transition-all rounded-lg select-none flex items-center justify-center`;
    
    let typeStyle = "";
    if (type === 'answer' || type === 'intermediate') {
        typeStyle = "border-b-4 border-slate-300 bg-slate-50 text-slate-800 cursor-pointer";
    } else {
        typeStyle = isReadOnly ? "border-none bg-transparent text-slate-800" : "border-2 border-slate-100 bg-transparent text-slate-600 hover:bg-slate-50 cursor-pointer";
    }

    if (isActive) {
        if (type === 'answer' || type === 'intermediate') {
            typeStyle = "border-b-4 border-indigo-500 bg-white text-indigo-700 ring-2 ring-indigo-200 shadow-lg transform -translate-y-1";
        } else if (!isReadOnly) {
            typeStyle = "border-2 border-blue-400 bg-blue-50 text-blue-600 shadow-md scale-105";
        }
    }

    // Fix: Ensure intermediate answer remains clear (not grayed out) when moving to next step
    if (disabled) {
        if (isIntermediate && currentStep > 1) {
            typeStyle = "border-none bg-slate-100 text-slate-800 cursor-default opacity-100"; // Keep opacity 100 for visibility
        } else {
            typeStyle = "opacity-40 grayscale cursor-not-allowed";
        }
    }

    if (isSuccess) typeStyle = type === 'answer' ? "border-none bg-green-100 text-green-700" : "opacity-60 text-slate-600";
    if (isTargetWrong && isActive) typeStyle = "border-red-500 bg-red-50 text-red-700 animate-shake";

    return (
      <div 
        onClick={() => !isSuccess && !disabled && !isReadOnly && (setActiveColumn(column), setActiveFieldType(type))}
        className={`${baseStyle} ${typeStyle}`}
      >
        {value}
      </div>
    );
  };

  const renderCarry = (column: ActiveColumn, value: string, type: 'carry' | 'carry2', disabled: boolean) => {
    const isActive = activeColumn === column && activeFieldType === type;
    // Compact carry circles
    const carrySize = isTriple ? "w-6 h-6 sm:w-8 sm:h-8 text-sm sm:text-lg" : "w-8 h-8 sm:w-10 sm:h-10 text-lg sm:text-2xl";
    
    const baseStyle = `${carrySize} rounded-full border-2 text-center font-bold flex items-center justify-center cursor-pointer transition-all mb-0.5`;
    let stateStyle = value ? "border-slate-400 bg-white text-slate-600" : "border-slate-200 border-dashed text-slate-400";
    if (isActive) stateStyle = "border-orange-400 bg-orange-50 text-orange-600 ring-2 ring-orange-200 scale-110 shadow-md";
    
    // Fix: Keep carry visible if it was used
    if (disabled) {
       if (value) stateStyle = "border-slate-300 bg-slate-50 text-slate-500 opacity-80 cursor-default";
       else stateStyle = "opacity-0 cursor-default";
    }

    return (
        <div onClick={() => !isSuccess && !disabled && (setActiveColumn(column), setActiveFieldType(type))} className={`${baseStyle} ${stateStyle}`}>
            {value}
        </div>
    );
  };

  const isHorizontalActive = activeFieldType === 'horizontalAnswer';
  
  return (
    <div className="flex flex-col items-center w-full">
      {/* Horizontal Equation Header */}
      <div className={`mb-2 sm:mb-4 px-4 py-2 sm:px-6 sm:py-3 rounded-2xl bg-white border-2 flex items-center flex-wrap justify-center gap-2 sm:gap-3 shadow-sm transition-colors ${isHorizontalActive ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-blue-100'}`}>
        <span className="text-xl sm:text-3xl font-bold text-slate-700 whitespace-nowrap">
          {problem.numbers.join(` + `)} = 
        </span>
        <div 
            onClick={() => {
                // Only allow clicking if we are at the final step (after vertical is done) or if already active
                if (currentStep === 3 || isSuccess) {
                    setActiveFieldType('horizontalAnswer');
                }
            }}
            className={`
                min-w-[60px] h-10 sm:h-12 px-3 rounded-lg border-2 flex items-center justify-center font-bold text-xl sm:text-2xl transition-all
                ${isHorizontalActive ? 'bg-white border-indigo-500 text-indigo-700 shadow-md scale-105' : 'bg-slate-50 border-slate-200 text-slate-800'}
                ${isWrong && wrongField === 'horizontalAnswer' ? 'border-red-500 bg-red-50 animate-shake' : ''}
                ${isSuccess ? 'border-green-400 bg-green-50 text-green-700' : ''}
            `}
        >
            {userHorizontalAnswer || '?'}
        </div>
      </div>

      <div className="p-2 sm:p-6 bg-white rounded-[1.5rem] shadow-xl border border-slate-200 w-auto inline-block">
        <div className="flex flex-col items-center">
          
          {/* STEP 1 CARRY */}
          <div className="flex justify-center mb-0.5">
             <Cell className="h-8" />
             <Cell className="h-8" hasSeparator>{renderCarry('thousands', userCarry.thousands, 'carry', currentStep > 1)}</Cell>
             <Cell className="h-8" hasSeparator>{renderCarry('hundreds', userCarry.hundreds, 'carry', currentStep > 1)}</Cell>
             <Cell className="h-8" hasSeparator>{renderCarry('tens', userCarry.tens, 'carry', currentStep > 1)}</Cell>
             <Cell className="h-8" />
          </div>

          {/* Row 1: N1 */}
          <div className="flex justify-center border-b border-slate-100 border-dashed">
            <Cell className={cellHeight} />
            <Cell className={cellHeight} hasSeparator>{renderInput('thousands', userRows[0].thousands, 'row0', currentStep > 1)}</Cell>
            <Cell className={cellHeight} hasSeparator>{renderInput('hundreds', userRows[0].hundreds, 'row0', currentStep > 1)}</Cell>
            <Cell className={cellHeight} hasSeparator>{renderInput('tens', userRows[0].tens, 'row0', currentStep > 1)}</Cell>
            <Cell className={cellHeight}>{renderInput('units', userRows[0].units, 'row0', currentStep > 1)}</Cell>
          </div>

          {/* Row 2: N2 */}
          <div className="flex justify-center border-b-4 border-slate-700">
            <Cell className={cellHeight}><span className={`${textSize} font-bold text-blue-500`}>+</span></Cell>
            <Cell className={cellHeight} hasSeparator>{renderInput('thousands', userRows[1].thousands, 'row1', currentStep > 1)}</Cell>
            <Cell className={cellHeight} hasSeparator>{renderInput('hundreds', userRows[1].hundreds, 'row1', currentStep > 1)}</Cell>
            <Cell className={cellHeight} hasSeparator>{renderInput('tens', userRows[1].tens, 'row1', currentStep > 1)}</Cell>
            <Cell className={cellHeight}>{renderInput('units', userRows[1].units, 'row1', currentStep > 1)}</Cell>
          </div>

          {/* Row 3: INTERMEDIATE */}
          <div className="flex justify-center mt-1 bg-slate-50/50 rounded-xl">
             <Cell className={separatorHeight} />
             <Cell className={separatorHeight} hasSeparator>{renderInput('thousands', isTriple ? userIntermediate.thousands : userAnswer.thousands, isTriple ? 'intermediate' : 'answer', isTriple && currentStep > 1)}</Cell>
             <Cell className={separatorHeight} hasSeparator>{renderInput('hundreds', isTriple ? userIntermediate.hundreds : userAnswer.hundreds, isTriple ? 'intermediate' : 'answer', isTriple && currentStep > 1)}</Cell>
             <Cell className={separatorHeight} hasSeparator>{renderInput('tens', isTriple ? userIntermediate.tens : userAnswer.tens, isTriple ? 'intermediate' : 'answer', isTriple && currentStep > 1)}</Cell>
             <Cell className={separatorHeight}>{renderInput('units', isTriple ? userIntermediate.units : userAnswer.units, isTriple ? 'intermediate' : 'answer', isTriple && currentStep > 1)}</Cell>
          </div>

          {isTriple && (
            <div className={`transition-all duration-700 flex flex-col items-center mt-1 pt-1 border-t-2 border-slate-100 ${currentStep === 1 ? 'opacity-30' : 'opacity-100'}`}>
                {/* STEP 2 CARRY */}
                <div className="flex justify-center mb-0.5">
                    <Cell className="h-8" />
                    <Cell className="h-8" hasSeparator>{renderCarry('thousands', userCarry2.thousands, 'carry2', currentStep === 1)}</Cell>
                    <Cell className="h-8" hasSeparator>{renderCarry('hundreds', userCarry2.hundreds, 'carry2', currentStep === 1)}</Cell>
                    <Cell className="h-8" hasSeparator>{renderCarry('tens', userCarry2.tens, 'carry2', currentStep === 1)}</Cell>
                    <Cell className="h-8" />
                </div>
                {/* Row 4: N3 */}
                <div className="flex justify-center border-b-4 border-slate-700">
                    <Cell className={cellHeight}><span className={`${textSize} font-bold text-purple-500`}>+</span></Cell>
                    <Cell className={cellHeight} hasSeparator>{renderInput('thousands', userRows[2].thousands, 'row2', currentStep === 1)}</Cell>
                    <Cell className={cellHeight} hasSeparator>{renderInput('hundreds', userRows[2].hundreds, 'row2', currentStep === 1)}</Cell>
                    <Cell className={cellHeight} hasSeparator>{renderInput('tens', userRows[2].tens, 'row2', currentStep === 1)}</Cell>
                    <Cell className={cellHeight}>{renderInput('units', userRows[2].units, 'row2', currentStep === 1)}</Cell>
                </div>
                {/* Row 5: FINAL ANSWER */}
                <div className="flex justify-center mt-1">
                    <Cell className={separatorHeight} />
                    <Cell className={separatorHeight} hasSeparator>{renderInput('thousands', userAnswer.thousands, 'answer', currentStep === 1)}</Cell>
                    <Cell className={separatorHeight} hasSeparator>{renderInput('hundreds', userAnswer.hundreds, 'answer', currentStep === 1)}</Cell>
                    <Cell className={separatorHeight} hasSeparator>{renderInput('tens', userAnswer.tens, 'answer', currentStep === 1)}</Cell>
                    <Cell className={separatorHeight}>{renderInput('units', userAnswer.units, 'answer', currentStep === 1)}</Cell>
                </div>
            </div>
          )}

          <div className="flex justify-center mt-2 opacity-30 text-[10px] font-bold text-slate-400">
             <Cell /><Cell hasSeparator>千</Cell><Cell hasSeparator>百</Cell><Cell hasSeparator>十</Cell><Cell>個</Cell>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerticalProblem;