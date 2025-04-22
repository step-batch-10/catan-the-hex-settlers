const getTokenImageFile = (tokenNumber) =>
  `images/tokens/token-${tokenNumber}.png`;

const getTerrainImageFile = (terrain) => `images/terrains/${terrain}.png`;

function* coordinates(ar) {
  for (const [index, length] of Object.entries(ar)) {
    for (let tileIndex = 0; tileIndex < length; tileIndex++) {
      yield {
        x: (Math.floor(length / 3) - (length % 3)) * 50 + 100 * tileIndex,
        y: 86.5 * index,
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

const createTerrainImage = (terrain) => {
  const terrainImage = getTerrainImageFile(terrain);
  return createImageTag(terrainImage, {
    x: 10,
    y: 10,
    width: 90,
    height: 110,
    transform: 'translate(-155,-237.5)',
  });
};

const createTokenImage = (terrainNumber) => {
  const tokenImage = getTokenImageFile(terrainNumber);
  return createImageTag(tokenImage, {
    x: 0,
    y: 0,
    width: 36,
    height: 36,
    transform: 'translate(-120,-190)',
  });
};

const createTileElement = (tile, coord) => {
  const header = createSvgElement('g');
  header.setAttribute('transform', `translate(${coord.x}, ${coord.y})`);

  const terrainImg = createTerrainImage(tile.terrain);
  header.appendChild(terrainImg);

  if (tile.terrainNumber) {
    const tokenImg = createTokenImage(tile.terrainNumber);
    header.appendChild(tokenImg);
  }

  return header;
};

const generateTiles = (tiles) => {
  const ar = [3, 4, 5, 4, 3];
  const coordinate = coordinates(ar);

  return tiles.map((tile) => createTileElement(tile, coordinate.next().value));
};

const appendText = (template, elementId, text) => {
  const element = template.querySelector(elementId);
  element.textContent = text;
};

const textDecStyle = (hasSpecialCard) =>
  (hasSpecialCard ? 'no-' : '') + 'line-through';

const setSpecialCardsStyles = (cloneTemplate, player) => {
  const largestArmy = cloneTemplate.getElementById('largest-army');
  largestArmy.classList.add(textDecStyle(player.hasLargestArmy));

  const longestRoad = cloneTemplate.getElementById('longest-road');
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
  6: [0, 2, 3, 5, 6, 8],
};

const restartAnimation = (dice, className) => {
  dice.classList.remove(className);
  void dice.offsetWidth;
  dice.classList.add(className);
};

const createDotGrid = (positions) => {
  const grid = [];
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    if (positions.includes(i)) {
      cell.classList.add('dot');
    }
    grid.push(cell);
  }
  return grid;
};

const renderDotGrid = (dice, grid) => {
  grid.forEach((cell) => dice.appendChild(cell));
};

const renderDice = (diceId, value) => {
  const dice = document.getElementById(diceId);
  dice.innerHTML = '';

  const positions = diceDotMap[value];

  const dotGrid = createDotGrid(positions);
  renderDotGrid(dice, dotGrid);

  restartAnimation(dice, 'dice');
};

const renderBoard = (hexes) => {
  const tilescontainer = document.querySelector('#tilesContainer');
  const tiles = generateTiles(hexes);

  tilescontainer.replaceChildren(...tiles);
};

const renderBothDice = (diceRoll) => {
  ['dice1', 'dice2'].forEach((diceId, i) => renderDice(diceId, diceRoll[i]));
};

const showMessage = (templateId, elementId, msg) => {
  const container =
    document.querySelector(elementId) ||
    cloneTemplateElement(templateId).querySelector(elementId);

  container.textContent = msg;
  document.body.appendChild(container);
  return container;
};

const displayPlayerTurn = (gameState) => {
  const isCurrentPlayer = gameState.currentPlayer !== gameState.players.me.name;
  const msg = isCurrentPlayer
    ? `current player - ${gameState.currentPlayer}`
    : `your turn`;

  showMessage('#current-player', '.player-turn', msg);
};

const notifyInValid = (msg) => {
  const msgBox = showMessage('#message-container', '.invalid-msg', msg);
  setTimeout(() => msgBox.remove(), 1000);
};

const notYourTurn = () => {
  notifyInValid('Not your turn');
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

const buildAt = async (targetElementId, pieceType) => {
  const fd = new FormData();
  fd.set('id', targetElementId);

  return await fetch(`/game/build/${pieceType}`, {
    body: fd,
    method: 'POST',
  });
};

const isValidBuilt = async (pieceType, fd) => {
  const { canBuild } = await fetch(`/game/can-build/${pieceType}`, {
    body: fd,
    method: 'POST',
  }).then((r) => r.json());

  return canBuild;
};

const isPieceTypeValid = (pieceType) =>
  new Set(['vertex', 'edge']).has(pieceType);

const highlightElement = (element, currentPlayer) => {
  element.style.fill = currentPlayer.color;
  element.style.opacity = 0.4;
  element.classList.add('highlight');
};

const lowLightElement = (element, className) => {
  return () => {
    element.style.opacity = 0;
    element.classList.remove(className);
  };
};

const getBuildValidationData = async (event) => {
  const element = event.target;
  const targetElementId = element.id;
  const pieceType = element.classList[0];

  if (!isPieceTypeValid(pieceType)) return null;

  const formData = new FormData();
  formData.set('id', targetElementId);

  const canBuild = await isValidBuilt(pieceType, formData);

  if (!canBuild) return null;

  return { element, targetElementId, pieceType };
};

const build = async (event) => {
  const validationData = await getBuildValidationData(event);
  if (!validationData) return notifyInValid('You Cannot Build There');

  const { targetElementId, pieceType } = validationData;
  return buildAt(targetElementId, pieceType);
};

const canBuildHandler = (currentPlayer) => async (event) => {
  const validationData = await getBuildValidationData(event);
  if (!validationData) return;

  const { element } = validationData;

  highlightElement(element, currentPlayer);
  setTimeout(lowLightElement(element, 'highlight'), 1000);
};

const addBuildEvent = (currentPlayer) => {
  const svg = document.getElementById('svg20');
  svg.addEventListener('click', build);
  svg.addEventListener('mouseover', canBuildHandler(currentPlayer));
};

const addEventListeners = (gameState) => {
  addRollDiceEvent();
  addBuildEvent(gameState.players.me);
};

const renderStructures = (structures) => {
  structures.forEach(({ color, id }) => {
    const structure = document.getElementById(id);
    structure.style.fill = color;
    structure.style.opacity = 1;
  });
};

const renderPieces = (gameState) => {
  const { vertices, edges } = gameState;

  renderStructures(vertices);
  renderStructures(edges);
};

const renderElements = (gameState) => {
  renderPieces(gameState);
  renderPlayersData(gameState.players);
  renderBothDice(gameState.diceRoll);
  displayPlayerTurn(gameState);
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

  addEventListeners(gameState);
  renderBoard(gameState.board.hexes);
  renderElements(gameState);
  addEventListeners(gameState);
  poll();
};

globalThis.onload = main;


