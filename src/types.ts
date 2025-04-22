import { Player } from './models/player.ts';

interface EdgeData {
  id: string;
  owner: string | null;
}

interface VertexData {
  id: string;
  owner: string | null;
  harbor: string | null;
  adjacentHexes: string[];
}

interface HexData {
  q: number;
  r: number;
  id: string;
  terrain: string;
  number: number | null;
  resource: keyof Resources | string;
  hasRobber: boolean;
}

interface GameBoard {
  hexes: object[];
  vertices: VertexData[];
  edges: EdgeData[];
}

interface Resources {
  wood: number;
  brick: number;
  sheep: number;
  wheat: number;
  ore: number;
  [key: string]: number;
}

interface DevCards {
  knight: number;
  'road-building': number;
  'year-of-plenty': number;
  monopoly: number;
}

interface Components {
  id: string;
  color: string | null;
}

interface GameState {
  gameId: string;
  diceRoll: number[];
  board: {
    hexes: object[];
    vertices: VertexData[];
    edges: EdgeData[];
  };
  availableActions: {
    canRoll: boolean;
  };
}

interface PlayersList {
  me: ReturnType<Player['getPlayerData']>;
  others: object[];
}

type RollDice = (start?: number, end?: number) => number;
type GamePhase = 'rolling' | 'setup' | 'main' | 'end';

export type {
  Components,
  DevCards,
  EdgeData,
  GameBoard,
  GamePhase,
  GameState,
  HexData,
  PlayersList,
  Resources,
  RollDice,
  VertexData,
};
