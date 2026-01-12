import { atom } from 'jotai';

import { Player } from '@/lib/game/base';

export const gameIdAtom = atom<string>('');

export const playerAtom = atom<Player>(Player.PLAYER_ONE);
