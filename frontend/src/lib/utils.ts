import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Player } from './game/base';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRandomGameId() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function getHostPlayer(): Player {
  return Math.random() < 0.5 ? Player.PLAYER_ONE : Player.PLAYER_TWO;
}
