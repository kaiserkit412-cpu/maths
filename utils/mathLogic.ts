import { Difficulty, Problem } from '../types';

export const generateProblem = (difficulty: Difficulty): Problem => {
  let top = 0;
  let bottom = 0;

  switch (difficulty) {
    case Difficulty.EASY:
      // 2 digits + 1 digit, No Carry
      // Unit sum must be < 10
      top = Math.floor(Math.random() * 80) + 10; // 10 to 89
      // Ensure units don't carry
      const maxUnit = 9 - (top % 10);
      bottom = Math.floor(Math.random() * (maxUnit + 1)); 
      if (bottom === 0) bottom = 1; 
      break;

    case Difficulty.MEDIUM:
      // 2 digits + 2 digits, No Carry
      while (true) {
        top = Math.floor(Math.random() * 80) + 10;
        bottom = Math.floor(Math.random() * 80) + 10;
        
        const unitsSum = (top % 10) + (bottom % 10);
        const tensSum = (Math.floor(top / 10) % 10) + (Math.floor(bottom / 10) % 10);
        
        if (unitsSum < 10 && tensSum < 10) break;
      }
      break;

    case Difficulty.HARD:
      // 2 digits + 1 or 2 digits, MUST Carry in at least one column
      while (true) {
        top = Math.floor(Math.random() * 89) + 10;
        bottom = Math.floor(Math.random() * 89) + 5;
        
        const unitsCarry = (top % 10) + (bottom % 10) >= 10;
        // Limit max sum to avoid 3 digits for cleaner UI if desired, but 3 digits is fine (100+)
        if (unitsCarry) break;
      }
      break;
      
    case Difficulty.EXPERT:
       // Random mixed, high chance of carry
       top = Math.floor(Math.random() * 899) + 100;
       bottom = Math.floor(Math.random() * 899) + 10;
       break;
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    topNumber: top,
    bottomNumber: bottom,
    answer: top + bottom
  };
};