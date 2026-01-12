import { atom } from 'jotai';

import { Player, playerEnum } from '@/lib/game/base';

export const gameIdAtom = atom<string>('');

export const playerAtom = atom<Player>(playerEnum.enum.player_one);
