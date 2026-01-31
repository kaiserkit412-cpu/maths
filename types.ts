export enum Difficulty {
  BEGINNER = 'BEGINNER', // 1 digit
  EASY = 'EASY',         // 2 digits + 1 digit
  MEDIUM = 'MEDIUM',     // 2 digits + 2 digits, No Carry/Borrow
  HARD = 'HARD',         // 2 digits + 2 digits, With Carry/Borrow
  EXPERT = 'EXPERT',     // 3 digits
  TRIPLE_SINGLE = 'TRIPLE_SINGLE', // 1+1+1 (e.g. 6+7+8)
  TRIPLE_DOUBLE = 'TRIPLE_DOUBLE'  // 12+15+10
}

export enum Operation {
  ADD = 'ADD',
  SUBTRACT = 'SUBTRACT'
}

export interface Problem {
  id: string;
  numbers: number[]; // Can be [n1, n2] or [n1, n2, n3]
  answer: number;
  intermediateAnswer?: number; // n1 + n2
  operation: Operation;
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  SUCCESS = 'SUCCESS'
}

export interface DigitState {
  units: string;
  tens: string;
  hundreds: string;
  thousands: string;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

export type ActiveColumn = 'units' | 'tens' | 'hundreds' | 'thousands';

export type FieldType = 'row0' | 'row1' | 'row2' | 'intermediate' | 'answer' | 'carry' | 'carry2' | 'horizontalAnswer';