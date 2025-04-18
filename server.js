import { createApp } from './src/app.js';

const main = (port) => {
  const gameData = {
    gameId: 'abc123',
    playerId: 'p1',
    currentPlayerId: 'p2',
    phase: 'main',
    diceRoll: [1, 2],
    winner: null,
    players: {
      me: {
        id: 'p1',
        name: 'Adil',
        color: 'blue',
        victoryPoints: 5,
        resources: { wood: 1, brick: 2, sheep: 0, wheat: 1, ore: 0 },
        roads: ['e12', 'e13'],
        settlements: ['v5', 'v19'],
        cities: [],
        devCards: { knight: 1, 'road-building': 1 },
        hasLongestRoad: false,
        hasLargestArmy: false
      },
      others: [
        {
          id: 'p2',
          name: 'Dora',
          color: 'blue',
          victoryPoints: 5,
          resources: 6,
          roads: ['e12', 'e13'],
          settlements: ['v5', 'v19'],
          cities: [],
          devCards: 2,
          hasLongestRoad: false,
          hasLargestArmy: false
        },
        {
          id: 'p3',
          name: 'Raja',
          color: 'orange',
          victoryPoints: 5,
          resources: 6,
          roads: ['e12', 'e13'],
          settlements: ['v5', 'v19'],
          cities: [],
          devCards: 2,
          hasLongestRoad: false,
          hasLargestArmy: false
        },
        {
          id: 'p4',
          name: 'Vineet',
          color: 'red',
          victoryPoints: 5,
          resources: 6,
          roads: ['e12', 'e13'],
          settlements: ['v5', 'v19'],
          cities: [],
          devCards: 2,
          hasLongestRoad: false,
          hasLargestArmy: false
        }
      ]
    },
    board: {
      hexes: [
        {
          id: 'h1',
          q: 0,
          r: 0,
          terrain: 'forest',
          number: 8,
          hasRobber: false
        },
        {
          id: 'h2',
          q: 1,
          r: 0,
          terrain: 'hill',
          number: 6,
          hasRobber: true
        }
      ],
      vertices: [
        {
          id: 'v5',
          owner: 'p1',
          type: 'settlement',
          harbor: '3:1',
          adjacentHexes: ['h1', 'h2', 'h3']
        }
      ],
      edges: [
        {
          id: 'e12',
          owner: 'p1',
          v1: 'v5',
          v2: 'v6'
        }
      ]
    },
    supply: {
      ore: 9,
      lumber: 9,
      brick: 9,
      wool: 9,
      grain: 9,
      devCardsRemaining: 15
    },
    availableActions: {
      canRoll: false,
      canBuildSettlement: true,
      canBuildRoad: true,
      canBuyDevCard: false,
      canTrade: true
    },
    logs: [
      { message: 'Adil built a settlement', turn: 3, timestamp: '...' },
      { message: 'Vineet rolled an 8', turn: 3, timestamp: '...' }
    ]
  };

  Deno.serve({ port }, createApp(gameData).fetch);
};

main(Deno.args[0] || 3000);
