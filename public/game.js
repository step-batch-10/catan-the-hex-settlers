const noTokenImages = {
  2: '/images/tokens/token-2.png',
  3: '/images/tokens/token-3.png',
  4: '/images/tokens/token-4.png',
  5: '/images/tokens/token-5.png',
  6: '/images/tokens/token-6.png',
  8: '/images/tokens/token-8.png',
  9: '/images/tokens/token-9.png',
  10: '/images/tokens/token-10.png',
  11: '/images/tokens/token-11.png',
  12: '/images/tokens/token-12.png',
};

const terrainImages = {
  forest: '/images/terrains/forest.png',
  pasture: '/images/terrains/pasture.png',
  mountains: '/images/terrains/mountains.png',
  hills: '/images/terrains/hills.png',
  fields: '/images/terrains/fields.png',
  desert: '/images/terrains/desert.png',
};

function* coordinates() {
  const ar = [3, 4, 5, 4, 3];
  for (const [index, length] of Object.entries(ar)) {
    for (let tileIndex = 0; tileIndex < length; tileIndex++) {
      yield {
        x: (Math.floor(length / 3) - (length % 3)) * 50 + 100 * tileIndex,
        y: 86.5 * index,
      };
    }
  }
}

const generateTiles = (tiles) => {
  const coordinate = coordinates();

  return tiles
    .map((tile) => {
      const coord = coordinate.next().value;
      const header = `<g transform="translate(${coord.x},${coord.y})" >`;
      const tilesImage = `<image
       href="${terrainImages[tile.terrain]}"
       x="10"
       y="10"
       width="90"
       height="110"
       transform="translate(-155,-237.5)"
     />`;

      const resourceNumber = `<image href="${noTokenImages[tile.terrainNumber]}"
       x="0"
       y="0"
       width="36"
       height="36"
       transform="translate(-120,-190)">
     </g>`;

      const template = `${header} ${tilesImage}`;

      return tile.terrainNumber === null ? template : template + resourceNumber;
    })
    .join('\n');
};

const appendText = (template, elementId, text) => {
  const element = template.getElementById(elementId);
  element.textContent = text;
};

const textDecStyle = (hasSpecialCard) =>
  (hasSpecialCard ? 'no-' : '') + 'line-through';

const setSpecialCardsStyles = (cloneTemplate, player) => {
  const largestArmy = cloneTemplate.getElementById('largest-army');
  const longestRoad = cloneTemplate.getElementById('longest-road');

  largestArmy.classList.add(textDecStyle(player.hasLargestArmy));
  longestRoad.classList.add(textDecStyle(player.hasLongestRoad));
};

const createProfileCard = (player) => {
  const clone = document.querySelector('#info-box-template');
  const cloneTemplate = clone.content.cloneNode(true);
  const resourceCount = player.resources;
  const color = cloneTemplate.getElementById('color');

  color.style.backgroundColor = player.color;

  setSpecialCardsStyles(cloneTemplate, player);
  appendText(cloneTemplate, 'player-name', player.name);
  appendText(cloneTemplate, 'vp', player.victoryPoints);
  appendText(cloneTemplate, 'dev-cards', player.devCards);
  appendText(cloneTemplate, 'resources', resourceCount);

  return cloneTemplate;
};

const displayResourceCount = ({ sheep, wood, brick, ore, wheat }) => {
  appendText(document, 'ore', ore);
  appendText(document, 'wood', wood);
  appendText(document, 'sheep', sheep);
  appendText(document, 'brick', brick);
  appendText(document, 'wheat', wheat);
};

const renderPlayerPanel = (player) => {
  const name = document.querySelector('#player-name');
  const color = document.querySelector('#color');

  name.textContent = player.name;
  color.style.backgroundColor = player.color;
  displayResourceCount(player.resources);
};

const renderPlayersData = (players) => {
  renderPlayerPanel(players.me);

  const list = document.querySelector('#player-list');
  list.innerHTML = '';
  players.others.forEach((player) => {
    const template = createProfileCard(player);
    list.append(template);
  });
};

const diceDotMap = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const renderDice = (diceId, value) => {
  const dice = document.getElementById(diceId);
  dice.innerHTML = '';

  const positions = diceDotMap[value];

  for (let i = 0; i < 9; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (positions.includes(i)) {
      dice.appendChild(dot);
    } else {
      const spacer = document.createElement('div');
      dice.appendChild(spacer);
    }
  }

  dice.classList.remove('dice');
  void dice.offsetWidth;
  dice.classList.add('dice');
};

const renderBoard = (hexes) => {
  const tilescontainer = document.querySelector('#tilesContainer');
  const tiles = generateTiles(hexes);
  tilescontainer.innerHTML = tiles;
};

const renderBothDice = (diceRoll) => {
  ['dice1', 'dice2'].forEach((diceId, i) => renderDice(diceId, diceRoll[i]));
};

const renderElements = (gameState) => {
  renderPieces(gameState);
  renderPlayersData(gameState.players);
  renderBothDice(gameState.diceRoll);
  // renderResources(gameState);
};

const notYourTurn = () => {
  alert('Not your turn');
};

const rollDiceHandler = async () => {
  const dice = await fetch('/game/dice/can-roll').then((res) => res.json());

  if (!dice.canRoll) return notYourTurn();
  await fetch('game/roll-dice', { method: 'POST' });
};

const addRollDiceEvent = () => {
  const diceContainer = document.querySelector('.dice-container');

  diceContainer.addEventListener('click', rollDiceHandler);
};

const isPieceTypeValid = (pieceType) =>
  new Set(['vertex', 'edge']).has(pieceType);

const build = async (event) => {
  const element = event.target;
  const targetElementId = element.id;
  const pieceType = element.classList[0];
  const fd = new FormData();
  fd.set('id', targetElementId);
  const { canBuild } = await fetch(`/game/can-build/${pieceType}`, {
    body: fd,
    method: 'POST',
  }).then((r) => r.json());

  if (canBuild) {
    const fd = new FormData();
    fd.set('id', targetElementId);
    return await fetch(`/game/build/${pieceType}`, {
      body: fd,
      method: 'POST',
    });
  }

  if (!isPieceTypeValid(pieceType) || !canBuild) {
    alert('You Cannot Build There..');
    return;
  }
};

const addBuildEvent = () => {
  const svg = document.getElementById('svg20');
  svg.addEventListener('click', build);
};

const addEventListeners = () => {
  addRollDiceEvent();
  addBuildEvent();
};

const renderEdges = (edges) => {
  edges.forEach(({ color, id }) => {
    const edge = document.getElementById(id);
    edge.style.fill = color;
    edge.style.opacity = 1;
  });
};

const renderVertices = (vertices) => {
  vertices.forEach(({ color, id }) => {
    const vertices = document.getElementById(id);
    vertices.style.fill = color;
    vertices.style.opacity = 1;
  });
};

const renderPieces = (gameState) => {
  const { vertices, edges } = gameState;

  renderVertices(vertices);
  renderEdges(edges);
};

const poll = () => {
  setInterval(async () => {
    const response = await fetch('/game/gameData');
    const gameState = await response.json();
    console.log(gameState);
    renderElements(gameState);
    // renderPieces(gameState);
    // renderBothDice(gameState.diceRoll);
  }, 1000);
};

const main = async () => {
  const response = await fetch('/game/gameState');
  const gameState = await response.json();

  addEventListeners();
  // renderElements(gameState);
  renderBoard(gameState.board.hexes);
  poll();
};

globalThis.onload = main;
