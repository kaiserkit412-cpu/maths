import { Difficulty, Problem } from '../types';

export const generateProblem = (difficulty: Difficulty): Problem => {
  let top = 0;
  let bottom = 0;

  switch (difficulty) {
    case Difficulty.BEGINNER:
      // 1 digit + 1 digit (1-9)
      top = Math.floor(Math.random() * 9) + 1;
      bottom = Math.floor(Math.random() * 9) + 1;
      break;

    case Difficulty.EASY:
      // 2 digits + 1 digit, No Carry
      top = Math.floor(Math.random() * 80) + 10; // 10 to 89
      const maxUnitE = 9 - (top % 10);
      bottom = Math.floor(Math.random() * (maxUnitE + 1)); 
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
      // 2 digits + 2 digits, MUST Carry
      while (true) {
        top = Math.floor(Math.random() * 89) + 10;
        bottom = Math.floor(Math.random() * 89) + 5;
        const unitsCarry = (top % 10) + (bottom % 10) >= 10;
        if (unitsCarry) break;
      }
      break;
      
    case Difficulty.EXPERT:
       // 3 digits + 3 digits
       top = Math.floor(Math.random() * 800) + 100;
       bottom = Math.floor(Math.random() * 800) + 100;
       break;

    case Difficulty.MASTER:
       // 4 digits mixed, many carries
       top = Math.floor(Math.random() * 8999) + 1000;
       bottom = Math.floor(Math.random() * 8999) + 100;
       break;
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    topNumber: top,
    bottomNumber: bottom,
    answer: top + bottom
  };
};