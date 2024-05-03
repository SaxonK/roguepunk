import { Player, PlayerState } from './interfaces'

export type PlayerObject = Omit<Player, 'update' | 'render'>;
export type PlayerStateObject = Omit<PlayerState, 'update' | 'render'>;