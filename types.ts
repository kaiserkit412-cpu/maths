export enum Difficulty {
  EASY = 'EASY',     // 2 digits + 1 digit, No Carry
  MEDIUM = 'MEDIUM', // 2 digits + 2 digits, No Carry
  HARD = 'HARD',     // 2 digits + 2 digits, With Carry
  EXPERT = 'EXPERT'  // 3 digits mixed, With Carry
}

export interface Problem {
  id: string;
  topNumber: number;
  bottomNumber: number;
  answer: number;
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

export type ActiveColumn = 'units' | 'tens' | 'hundreds' | 'thousands';

export type FieldType = 'answer' | 'carry';