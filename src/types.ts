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
  lumber: number;
  brick: number;
  wool: number;
  grain: number;
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

interface PlayerData {
  id: string;
  name: string;
  color: string;
  resources: Resources;
  roads: string[];
  settlements: string[];
  cities: string[];
  devCards: DevCards;
  hasLargestArmy: boolean;
  hasLongestRoad: boolean;
  victoryPoints: number;
}

interface GameState {
  gameId: string;
  diceRoll: number[];
  board: {
    hexes: object[];
    vertices: VertexData[];
    edges: EdgeData[];
  };
  players: { me: { resources: Resources } };
  playerId: string;
  currentPlayerId: string;
  gamePhase: GamePhase;
}

interface DistributeResourceData {
  playerId: string;
  resource: string;
  buildingType: string;
}

interface PlayersList {
  me: ReturnType<Player['getPlayerData']>;
  others: object[];
}

type RollDice = (start?: number, end?: number) => number;
type GamePhase = 'setup' | 'main' | 'end';
type Structures = 'road' | 'settlement' | 'city';
type ResourceProduction = (keyof Resources | undefined)[] | undefined;

interface TradeResources {
  incomingResources: Resources;
  outgoingResources: Resources;
}

export type {
  Components,
  DevCards,
  DistributeResourceData,
  EdgeData,
  GameBoard,
  GamePhase,
  GameState,
  HexData,
  PlayerData,
  PlayersList,
  ResourceProduction,
  Resources,
  RollDice,
  Structures,
  TradeResources,
  VertexData,
};
