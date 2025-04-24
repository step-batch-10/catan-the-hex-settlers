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
  robber: string;
}

interface Resources {
  lumber: number;
  brick: number;
  wool: number;
  grain: number;
  ore: number;
  [key: string]: number;
}

interface DevCardTypes {
  knight: number;
  'road-building': number;
  'year-of-plenty': number;
  monopoly: number;
  'victory-point': number;
}

interface DevCards {
  owned: DevCardTypes;
  played: DevCardTypes;
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
  availableActions: object;
  gamePhase: GamePhase;
}

interface DistributeResourceData {
  playerId: string;
  resource: keyof Resources;
  buildingType: string;
}

interface PlayersList {
  me: ReturnType<Player['getPlayerData']>;
  others: object[];
}

type RollDice = (start?: number, end?: number) => number;
type GamePhase = 'setup' | 'main' | 'end';
type PlayerAssets = 'road' | 'settlement' | 'city' | 'devCard';
type ResourceProduction = (keyof Resources | undefined)[] | undefined;
type RandomCard = (availableCards: object[]) => string;
interface TradeResources {
  incomingResources: Resources;
  outgoingResources: Resources;
}

interface SpecialCardOwners {
  largestArmy: number | null;
  longestRoad: number | null;
}

interface Supply {
  resources: Resources;
  devCards: DevCardTypes;
}

export const defaultResources: Resources = {
  wool: 0,
  grain: 0,
  ore: 0,
  lumber: 0,
  brick: 0,
};

export type {
  Components,
  DevCards,
  DevCardTypes,
  DistributeResourceData,
  EdgeData,
  GameBoard,
  GamePhase,
  GameState,
  HexData,
  PlayerAssets,
  PlayerData,
  PlayersList,
  RandomCard,
  ResourceProduction,
  Resources,
  RollDice,
  SpecialCardOwners,
  Supply,
  TradeResources,
  VertexData,
};
