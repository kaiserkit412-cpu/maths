import { Difficulty, Operation, Problem } from '../types';

export const generateProblem = (difficulty: Difficulty, operation: Operation): Problem => {
  let numbers: number[] = [];
  let answer = 0;
  let intermediateAnswer = 0;

  const isSub = operation === Operation.SUBTRACT;

  if (difficulty === Difficulty.TRIPLE_SINGLE || difficulty === Difficulty.TRIPLE_DOUBLE) {
    let n1, n2, n3;
    if (difficulty === Difficulty.TRIPLE_SINGLE) {
      n1 = Math.floor(Math.random() * 9) + 1;
      n2 = Math.floor(Math.random() * 9) + 1;
      n3 = Math.floor(Math.random() * 9) + 1;
    } else {
      n1 = Math.floor(Math.random() * 40) + 10;
      n2 = Math.floor(Math.random() * 40) + 10;
      n3 = Math.floor(Math.random() * 10) + 5;
    }
    numbers = [n1, n2, n3];
    intermediateAnswer = n1 + n2;
    answer = intermediateAnswer + n3;
    return {
      id: Math.random().toString(36).substr(2, 9),
      numbers,
      intermediateAnswer,
      answer,
      operation: Operation.ADD
    };
  }

  let top = 0;
  let bottom = 0;

  switch (difficulty) {
    case Difficulty.BEGINNER:
      top = Math.floor(Math.random() * 9) + 1;
      bottom = Math.floor(Math.random() * 9) + 1;
      if (isSub && top < bottom) [top, bottom] = [bottom, top];
      break;
    case Difficulty.EASY:
      top = Math.floor(Math.random() * 80) + 10;
      if (!isSub) {
        bottom = Math.floor(Math.random() * (9 - (top % 10)) + 1);
      } else {
        bottom = Math.floor(Math.random() * (top % 10) + 1);
      }
      break;
    case Difficulty.MEDIUM:
      while (true) {
        top = Math.floor(Math.random() * 80) + 10;
        bottom = Math.floor(Math.random() * 80) + 10;
        if (isSub && top < bottom) [top, bottom] = [bottom, top];
        if (!isSub) {
          if ((top % 10) + (bottom % 10) < 10 && Math.floor(top/10) + Math.floor(bottom/10) < 10) break;
        } else {
          if ((top % 10) >= (bottom % 10) && Math.floor(top/10) >= Math.floor(bottom/10)) break;
        }
      }
      break;
    case Difficulty.HARD:
      while (true) {
        top = Math.floor(Math.random() * 80) + 15;
        bottom = Math.floor(Math.random() * 80) + 10;
        if (isSub && top < bottom) [top, bottom] = [bottom, top];
        if (!isSub) {
          if ((top % 10) + (bottom % 10) >= 10) break;
        } else {
          if ((top % 10) < (bottom % 10)) break;
        }
      }
      break;
    case Difficulty.EXPERT:
       top = Math.floor(Math.random() * 800) + 100;
       bottom = Math.floor(Math.random() * 800) + 100;
       if (isSub && top < bottom) [top, bottom] = [bottom, top];
       break;
    default:
       top = 10; bottom = 5;
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    numbers: [top, bottom],
    answer: isSub ? top - bottom : top + bottom,
    operation
  };
};