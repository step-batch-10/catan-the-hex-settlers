import { Bank } from './models/bank.ts';
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

interface GameData {
  hasWon: boolean;
  vertices: object[];
  edges: object[];
  diceRoll: number[];
  players: PlayersList;
  currentPlayer: string;
  availableActions: { canTrade: boolean; canRoll: boolean };
  gamePhase: GamePhase;
  currentPlayerId: string;
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
  playersInfo: object[];
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
type BuildType = 'settlement' | 'road' | 'city';
type Phase = 'initial' | 'main' | 'roadBuilding';
type StringSet = Set<string>;

export type DevelopmentCards =
  | 'knight'
  | 'monopoly'
  | 'year-of-plenty'
  | 'road-building'
  | 'victory-point';

interface Supply {
  resources: Resources;
  devCards: DevelopmentCards[];
}

export const defaultResources: Resources = {
  wool: 0,
  grain: 0,
  ore: 0,
  lumber: 0,
  brick: 0,
};

type Slot = {
  players: { id: string; name: string; color: string }[];
  gameId: string;
};

export const defaultSlot = (): Slot => ({
  gameId: '',
  players: [
    {
      id: 'p1',
      name: '',
      color: 'red',
    },
    {
      id: 'p2',
      name: '',
      color: 'blue',
    },
    {
      id: 'p3',
      name: '',
      color: 'orange',
    },
    {
      id: 'p4',
      name: '',
      color: 'green',
    },
  ],
});

type Result = { name: string; hasWon: boolean };

type ExpectedResponder = typeof Bank | typeof Player;

type Trader = Player | Bank;

interface Notification {
  header: string;
  body: string;
  actions: string[];
}

interface TradeStatus {
  isClosed: boolean;
  responder: ExpectedResponder;
  proposer: Trader;
  tradeResource: TradeResources;
}

export type {
  BuildType,
  Components,
  DevCards,
  DevCardTypes,
  DistributeResourceData,
  EdgeData,
  ExpectedResponder,
  GameBoard,
  GameData,
  GamePhase,
  GameState,
  HexData,
  Notification,
  Phase,
  PlayerAssets,
  PlayerData,
  PlayersList,
  RandomCard,
  ResourceProduction,
  Resources,
  Result,
  RollDice,
  Slot,
  SpecialCardOwners,
  StringSet,
  Supply,
  Trader,
  TradeResources,
  TradeStatus,
  VertexData,
};
