const getTokenImageFile = (tokenNumber) =>
  `images/tokens/token-${tokenNumber}.png`;

const getTerrainImageFile = (terrain) => `images/terrains/${terrain}.png`;

function* coordinates(ar) {
  for (const [index, length] of Object.entries(ar)) {
    for (let tileIndex = 0; tileIndex < length; tileIndex++) {
      yield {
        x: (Math.floor(length / 3) - (length % 3)) * 50 + 100 * tileIndex,
        y: 86.5 * index
      };
    }
  }
}

const createSvgElement = (svgElement) => {
  const svgNS = 'http://www.w3.org/2000/svg';

  return document.createElementNS(svgNS, svgElement);
};

const createImageTag = (imageFile, { x, y, width, height, transform }) => {
  const image = createSvgElement('image');

  image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', imageFile);
  image.setAttribute('x', x);
  image.setAttribute('y', y);
  image.setAttribute('width', width);
  image.setAttribute('height', height);
  image.setAttribute('transform', transform);

  return image;
};

const generateTiles = (tiles) => {
  const ar = [3, 4, 5, 4, 3];
  const coordinate = coordinates(ar);

  return tiles.map((tile) => {
    const coord = coordinate.next().value;
    const header = createSvgElement('g');
    header.setAttribute('transform', `translate(${coord.x}, ${coord.y})`);

    const terrainImage = getTerrainImageFile(tile.terrain);
    const tilesImage = createImageTag(terrainImage, {
      x: 10,
      y: 10,
      width: 90,
      height: 110,
      transform: 'translate(-155,-237.5)'
    });

    if (!tile.terrainNumber) {
      header.appendChild(tilesImage);
      return header;
    }

    const tokenImage = getTokenImageFile(tile.terrainNumber);
    const resourceNumber = createImageTag(tokenImage, {
      x: 0,
      y: 0,
      width: 36,
      height: 36,
      transform: 'translate(-120,-190)'
    });

    header.append(tilesImage, resourceNumber);
    return header;
  });
};

const appendText = (template, elementId, text) => {
  const element = template.querySelector(elementId);
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

const cloneTemplateElement = (id) => {
  const clone = document.querySelector(id);
  const cloneTemplate = clone.content.cloneNode(true);

  return cloneTemplate;
};

const createProfileCard = (player) => {
  const cloneTemplate = cloneTemplateElement('#info-box-template');
  const color = cloneTemplate.querySelector('#color');
  const resourceCount = player.resources;

  color.style.backgroundColor = player.color;

  setSpecialCardsStyles(cloneTemplate, player);
  appendText(cloneTemplate, '#player-name', player.name);
  appendText(cloneTemplate, '#vp', player.victoryPoints);
  appendText(cloneTemplate, '#dev-cards', player.devCards);
  appendText(cloneTemplate, '#resources', resourceCount);

  return cloneTemplate;
};

const displayResourceCount = ({ sheep, wood, brick, ore, wheat }) => {
  appendText(document, '#ore', ore);
  appendText(document, '#wood', wood);
  appendText(document, '#sheep', sheep);
  appendText(document, '#brick', brick);
  appendText(document, '#wheat', wheat);
};

const renderPlayerPanel = (player) => {
  appendText(document, '#player-name', player.name);

  const color = document.querySelector('#color');
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
  6: [0, 2, 3, 5, 6, 8]
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

  tilescontainer.replaceChildren(...tiles);
};

const renderBothDice = (diceRoll) => {
  ['dice1', 'dice2'].forEach((diceId, i) => renderDice(diceId, diceRoll[i]));
};

const renderToast = (gameState) => {
  const toastDiv =
    document.querySelector('.toast') ||
    cloneTemplateElement('#player-status').querySelector('.toast');

  const isCurrentPlayer = gameState.currentPlayer !== gameState.players.me.name;
  const msg = isCurrentPlayer
    ? `current player - ${gameState.currentPlayer}`
    : `your turn`;

  toastDiv.textContent = msg;
  toastDiv.style.display = 'block';
  document.body.appendChild(toastDiv);
};

const renderMsg = (msg) => {
  const msgDiv =
    document.querySelector('.msg') ||
    cloneTemplateElement('#message-container').querySelector('.msg');

  msgDiv.textContent = msg;
  document.body.appendChild(msgDiv);

  setTimeout(() => {
    msgDiv.remove();
  }, 1000);
};

const renderElements = (gameState) => {
  renderPieces(gameState);
  renderPlayersData(gameState.players);
  renderBothDice(gameState.diceRoll);
  renderToast(gameState);
};

const notYourTurn = () => {
  renderMsg('Not your turn');
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
    method: 'POST'
  }).then((r) => r.json());

  if (canBuild) {
    const fd = new FormData();
    fd.set('id', targetElementId);
    return await fetch(`/game/build/${pieceType}`, {
      body: fd,
      method: 'POST'
    });
  }

  if (!isPieceTypeValid(pieceType) || !canBuild) {
    renderMsg('You Cannot Build There..');
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

    renderElements(gameState);
  }, 2000);
};

const main = async () => {
  const response = await fetch('/game/gameState');
  const gameState = await response.json();

  addEventListeners();
  renderBoard(gameState.board.hexes);
  poll();
};

globalThis.onload = main;
