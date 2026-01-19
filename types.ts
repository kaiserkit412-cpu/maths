export enum Difficulty {
  BEGINNER = 'BEGINNER', // 1 digit + 1 digit
  EASY = 'EASY',         // 2 digits + 1 digit, No Carry
  MEDIUM = 'MEDIUM',     // 2 digits + 2 digits, No Carry
  HARD = 'HARD',         // 2 digits + 2 digits, With Carry
  EXPERT = 'EXPERT',     // 3 digits + 3 digits
  MASTER = 'MASTER'      // 4 digits mixed
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

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

export type ActiveColumn = 'units' | 'tens' | 'hundreds' | 'thousands';

export type FieldType = 'top' | 'bottom' | 'answer' | 'carry';