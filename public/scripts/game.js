import { Notifications } from './notification.js';
import {
  showOptions,
  tradeTypes,
  updateResourceCount,
  tradeControlls,
  removeClassFromElements,
  addClassToElements,
  replaceListeners,
} from './trade.js';

const notificationActions = {
  Accept: () => {
    fetch('game/trade/player/accept', { method: 'POST' });
  },

  'test button': () => alert('hello'),
  Reject: () => {
    document.querySelector('.notification-container').remove();
  },
};

const notifications = new Notifications('#notification', notificationActions);

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

const restartAnimation = (el, className) => {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
};

const createTileElement = (tile, coord) => {
  const header = createSvgElement('g');
  header.setAttribute('transform', `translate(${coord.x}, ${coord.y})`);
  header.id = tile.id;

  const terrainImg = createTerrainImage(tile.terrain);
  header.appendChild(terrainImg);

  if (tile.hasRobber) {
    const robber = createImageTag('./images/tokens/robber.png', {
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      transform: 'translate(-125,-200)',
    });

    header.appendChild(robber);
    return header;
  }

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

const assignPlayerId = (player, element) => {
  element.setAttribute('id', player.id);
};

const createProfileCard = (player) => {
  const cloneTemplate = cloneTemplateElement('#player-row-template');
  const playerInfoCard = cloneTemplate.querySelector('.player-row');
  playerInfoCard.style.setProperty('--color', player.color);

  assignPlayerId(player, playerInfoCard);
  appendText(playerInfoCard, '.player-name', player.name);
  appendText(playerInfoCard, '.vp', player.victoryPoints);
  appendText(playerInfoCard, '.dev-card', player.devCards);
  appendText(playerInfoCard, '.resources', player.resources);
  appendText(playerInfoCard, '.largest-army', player.largestArmyCount);
  appendText(playerInfoCard, '.longest-road', player.longestRoadCount);
  if (player.hasLargestArmy)
    addClassToElement('owned', '.largest-army', playerInfoCard);
  if (player.hasLongestRoad)
    addClassToElement('owned', '.longest-road', playerInfoCard);

  return playerInfoCard;
};

const displayDevCardsCount = (devCards) => {
  const totalCards = Object.values(devCards.owned).reduce(
    (sum, count) => sum + Number(count),
    0,
  );

  appendText(document, '#dev-count', totalCards);
};

const displaySpecialCardStat = (id, count) => {
  const counter = document.querySelector(`#${id}`);
  counter.textContent = count;
};

const updateSpecialCardsStats = (largestArmyCount, longestRoadCount) => {
  displaySpecialCardStat('largest-army-count', largestArmyCount);
  displaySpecialCardStat('longest-road-count', longestRoadCount);
};

const disableElement = (id) => {
  const element = document.querySelector(`#${id}`);
  element.classList.add('disable');
};

const renderSpecialCards = (hasLongestRoad, hasLargestArmy) => {
  !hasLargestArmy
    ? disableElement('largest-army-icon')
    : removeClassFromElements(`#largest-army-icon`, 'disable');

  !hasLongestRoad
    ? disableElement('longest-road-icon')
    : removeClassFromElements(`#longest-road-icon`, 'disable');
};

const renderPlayerPanel = (player) => {
  updateResourceCount(player.resources);
  appendText(document, '#player-name', player.name);
  displayDevCardsCount(player.devCards);
  updateSpecialCardsStats(player.largestArmyCount, player.longestRoadCount);
  renderSpecialCards(player.hasLongestRoad, player.hasLargestArmy);
};

const renderPlayersData = (players) => {
  renderPlayerPanel(players.me);

  const list = document.querySelector('.players-details');

  const profileCards = players.playersInfo.map((player) =>
    createProfileCard(player),
  );

  list.replaceChildren(...profileCards);
};

const diceDotMap = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const createDotGrid = (positions) => {
  const grid = [];

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');

    if (positions.includes(i)) cell.classList.add('dot');

    grid.push(cell);
  }

  return grid;
};

const renderDie = (diceId, value) => {
  const dice = document.getElementById(diceId);
  const positions = diceDotMap[value];
  const dotGrid = createDotGrid(positions);

  dice.replaceChildren(...dotGrid);
};

const renderBoard = (hexes) => {
  const tilescontainer = document.querySelector('#tilesContainer');
  const tiles = generateTiles(hexes);

  tilescontainer.replaceChildren(...tiles);
};

const renderDice = (diceRoll) => {
  ['dice1', 'dice2'].forEach((diceId, i) => renderDie(diceId, diceRoll[i]));
};

const cloneTemplateElement = (id) => {
  const clone = document.querySelector(id);
  const cloneTemplate = clone.content.cloneNode(true);

  return cloneTemplate;
};

const highlightPosition = (id, className) => {
  const ele = document.getElementById(id);

  if (!ele) return;

  ele.style.opacity = 0.7;
  ele.classList.add(className);
};

const highlightSettlement = (id, className) => {
  const ele = document.getElementById(id);
  if (!ele) return;
  const settlement = ele.querySelector('path');
  if (settlement) return settlement.classList.add(className);

  ele.classList.add(className);
};

const showPossibleSettlementsOrRoads = async () => {
  const res = await fetch('/game/possible-positions').then((i) => i.json());
  if (res.settlements) {
    [...res.cities, ...res.settlements].forEach((id) =>
      highlightSettlement(id, 'available-settlement'),
    );
  }

  if (res.roads) {
    res.roads.forEach((id) => highlightPosition(id, 'available-road'));
  }
};

const moveRobber = async (event) => {
  const fd = new FormData();
  fd.set('id', event.target.parentElement.id);
  const disableElements = ['#pass-btn', '#buy-dev-card'];
  const { isValid } = await fetch('/game/can-place-robber', {
    method: 'POST',
    body: fd,
  }).then((res) => res.json());

  if (!isValid) return renderMsg("you can't place there");

  await fetch('/game/moveRobber', { method: 'POST', body: fd });
  addBuildEvent();
  disableElements.forEach((selector) =>
    removeClassFromElements(selector, 'disable'),
  );
};

const renderBoardHexes = async () => {
  const response = await fetch('/game/gameState');
  const gameState = await response.json();
  renderBoard(gameState.board.hexes);
};

const addListenerToElements = (elements, listener) => {
  elements.forEach((element) => {
    element.addEventListener('click', listener);
  });
};

const removeListenerToElements = (elements, listener) => {
  elements.forEach((element) => {
    element.removeEventListener('click', listener);
  });
};

const handleRobberCase = () => {
  const svg = document.getElementById('svg20'); //only terrains
  const settlements = svg.querySelectorAll('.settlement');
  const roads = svg.querySelectorAll('.edge');
  const disableElements = ['pass-btn', 'buy-dev-card'];

  disableElements.forEach((id) => disableElement(id));
  removeListenerToElements(settlements, build);
  removeListenerToElements(roads, build);
  svg.addEventListener('click', moveRobber);
};

const rollDiceHandler = async () => {
  const outcome = await fetch('/game/dice/can-roll').then((res) => res.json());

  if (!outcome.canRoll) return;

  const response = await fetch('/game/dice/roll', { method: 'POST' }).then(
    (res) => res.json(),
  );

  const dice = document.querySelectorAll('.dice');
  dice.forEach((die) => restartAnimation(die, 'roll'));

  renderDice(response.rolled);
  if (response.isRobber) {
    renderMsg('Move the Robber');
    handleRobberCase();
  }
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

const getParentId = (element) => {
  if (element.id.startsWith('path'))
    return element.parentElement.parentElement.id;

  const isSettlement = element.getAttribute('type') === 'vertex' || 'edge';

  return isSettlement ? element.id : element.parentElement.id;
};

const getPieceType = (element) => {
  if (element.getAttribute('type') === 'vertex') return 'vertex';
  if (element.getAttribute('type') === 'edge') return 'edge';

  const pieceType = element.id.startsWith('path') ? 'vertex' : 'edge';
  return pieceType;
};

const getBuildValidationData = async (event) => {
  const element = event.target;
  const targetElementId = getParentId(element);
  const pieceType = getPieceType(element);

  if (!isPieceTypeValid(pieceType)) return null;

  const formData = new FormData();
  formData.set('id', targetElementId);

  const canBuild = await isValidBuilt(pieceType, formData);
  if (!canBuild) return element.classList.add('block');
  return { element, targetElementId, pieceType };
};

const removeSvgAnimation = () => {
  const allSettlements =
    document.querySelectorAll('.available-settlement') || [];
  const allRoads = document.querySelectorAll('.available-road') || [];

  for (let i = 0; i < allSettlements.length; i++) {
    allSettlements[i].classList.remove('available-settlement');
  }

  for (let i = 0; i < allRoads.length; i++) {
    allRoads[i].style.opacity = 0;
    allRoads[i].classList.remove('available-road');
  }
};

const build = async (event) => {
  const validationData = await getBuildValidationData(event);
  if (!validationData) return;

  const { targetElementId, pieceType } = validationData;
  removeSvgAnimation();
  return buildAt(targetElementId, pieceType);
};

const addBuildEvent = () => {
  const svg = document.getElementById('svg20');
  const roads = svg.querySelectorAll('.edge');
  const settlements = svg.querySelectorAll('.pieces');
  svg.removeEventListener('click', moveRobber);
  addListenerToElements(settlements, build);
  addListenerToElements(roads, build);
};

const passTurn = async () => {
  await fetch('/game/changeTurn', { method: 'POST' });
  removeSvgAnimation();
};

const addClassToElement = (className, elementId, parent) => {
  const element = (parent || document).querySelector(elementId);
  element.classList.add(className);
};

const applyPlayerActions = ({ canTrade, canRoll }) => {
  const playerActionIcons = ['#pass-btn', '#buy-dev-card', '.resource'];
  const dice = ['#dice1', '#dice2'];

  dice.forEach((id) => addClassToElement('disable', id));
  playerActionIcons.forEach((id) => addClassToElements(id, 'disable'));

  if (canRoll) {
    dice.forEach((id) => removeClassFromElements(id, 'disable'));
    return;
  }

  if (canTrade) {
    playerActionIcons.forEach((id) => removeClassFromElements(id, 'disable'));
    return;
  }
};

const renderMsg = (msg) => {
  const msgBox =
    document.querySelector('invalid-msg') ||
    cloneTemplateElement('#message-container').querySelector('.invalid-msg');

  msgBox.textContent = msg;
  document.body.appendChild(msgBox);

  setTimeout(() => msgBox.remove(), 2000);
};

const buyDevCard = async () => {
  const response = await fetch('/game/buy/dev-card', { method: 'PATCH' });
  const outcome = await response.json();

  if (!outcome.isSucceed) {
    return renderMsg(outcome.message);
  }

  renderMsg(outcome.result);
};

const addListener = (elementId, listener, type = 'click') => {
  const element = document.querySelector(elementId);
  element.addEventListener(type, listener);
};

const addNavigation = () => {
  addListener('#pass-btn', passTurn);
};

const getTotalDevsCount = (cards) => {
  const total = Object.values(cards).reduce(
    (sum, availableCount) => availableCount + sum,
    0,
  );

  const element = document.querySelector('#dev-count');
  element.textContent = total;
};

const getAvailableCardsCount = (allDevCards) => {
  const { gameState } = globalThis;
  const me = gameState.players.me;
  const ownedDevCards = me.devCards.owned;
  const currentPlayer = gameState.currentPlayer;
  const isCurrentTurn = me.name === currentPlayer;
  const hasRolled = gameState.availableActions.canTrade;

  allDevCards.forEach((eachType) => {
    const type = eachType.parentElement.id;
    const count = ownedDevCards[type];

    eachType.textContent = count;
    count < 1 || !isCurrentTurn || !hasRolled
      ? disableElement(type)
      : removeClassFromElements(`#${type}`, 'disable');
  });
};

const getChoosenResource = (resolve) => {
  replaceListeners('.resource', selectMonopoly, 'click');

  function selectMonopoly(event) {
    resolve(event.target.parentElement.parentElement.getAttribute('type'));
  }
};

const chooseResource = async (event) => {
  renderMsg('Click on the resource you want to play monopoly on');
  closeDevPanel(event);

  const chosenResource = await new Promise(getChoosenResource);

  replaceListeners('.resource', showOptions(tradeTypes), 'click');
  return chosenResource;
};

function closeDevPanel(event) {
  event.target.parentElement.parentElement.style.display = 'none';
}

const playDevCard = async (event) => {
  const devCard = event.target.parentElement.id;
  const fd = new FormData();
  if (devCard === 'monopoly') {
    const resource = await chooseResource(event);
    fd.set('resource', resource);
  }

  const res = await fetch(`/game/play/${devCard}`, {
    method: 'POST',
    body: fd,
  });

  if (res.ok) {
    updateDevCards();
    closeDevPanel(event);
  }
};

const updateDevCards = () => {
  const container = document.querySelector('#all-devs');
  const existingDevCards = container.querySelector('#display-all-dev-card');

  if (existingDevCards) {
    existingDevCards.style.display = 'flex';
    const allDevCounts = existingDevCards.querySelectorAll('.count');
    const allExistingDevs = existingDevCards.querySelectorAll('.devCardSet');
    addListenerToDevCards(allExistingDevs);
    getAvailableCardsCount(allDevCounts);
    return;
  }

  const cloned = cloneTemplateElement('#all-dev-cards');
  const devCardPanel = cloned.querySelector('#display-all-dev-card');
  const closeBtn = cloned.querySelector('.close-btn');
  const allDevTypes = cloned.querySelectorAll('.count');
  const allDevs = cloned.querySelectorAll('.devCardSet');
  container.append(devCardPanel);

  closeBtn.addEventListener(
    'click',
    () => (devCardPanel.style.display = 'none'),
  );

  addListenerToDevCards(allDevs);

  allDevs.forEach((devCard) => {
    devCard.addEventListener('dblclick', playDevCard);
  });

  getAvailableCardsCount(allDevTypes);
};

const addListenerToDevCards = (allDevs) => {
  allDevs.forEach((devCard) => {
    devCard.addEventListener('dblclick', playDevCard);
  });
};

const addEventListeners = (gameState) => {
  addRollDiceEvent();
  addBuildEvent(gameState.players.me);
  addNavigation();
  tradeControlls();
  addListener('#buy-dev-card', buyDevCard);
  addListener('#dev-cards', updateDevCards);
};

const renderStructures = (structures) => {
  structures.forEach(({ color, id }) => {
    const structure = document.getElementById(id);
    structure.classList.add('built');
    structure.style.opacity = 1;
    structure.style.setProperty('--color', color);
  });
};

const renderCity = (city, color, id) => {
  const elements = city.querySelectorAll('path');
  const settlement = document.getElementById(id);
  const settlementElement = settlement.querySelector('path');
  settlementElement.style.opacity = 0;

  elements.forEach((element) => {
    element.classList.add('built');
    element.style.opacity = 0.9;
    element.style.fill = color;
  });
};

const renderSettlements = (settlements) => {
  settlements.forEach(({ color, id }) => {
    const settlement = document.getElementById(id);
    const element = settlement.querySelector('path');
    element.classList.add('built');
    element.classList.add('settlement');
    element.style.opacity = 1;
    element.style.setProperty('--color', color);
  });
};

const renderCities = (cities) => {
  cities.forEach(({ color, id }) => {
    const settlement = document.getElementById(id);
    const city = settlement.querySelector('g');
    renderCity(city, color, id);
  });
};

const renderPieces = (gameState) => {
  const { vertices, edges, cities } = gameState;

  renderSettlements(vertices);
  renderStructures(edges);
  renderCities(cities);
};

const highlightPlayersTurn = (currentPlayerId) => {
  const playerInfoCard = document.getElementById(currentPlayerId);

  playerInfoCard.classList.add('current-player');
};

const renderElements = (gameState) => {
  renderPieces(gameState);
  renderPlayersData(gameState.players);
  renderDice(gameState.diceRoll);
  showPossibleSettlementsOrRoads();
  highlightPlayersTurn(gameState.currentPlayerId);
};

const poll = () => {
  setInterval(async () => {
    const response = await fetch('/game/gameData');
    if (response.redirected) return globalThis.location.assign(response.url);

    const gameState = await response.json();
    globalThis.gameState = gameState;
    removeSvgAnimation();
    notifications.removeAllNotifications();
    notifications.showAll(gameState.notifications);
    renderBoardHexes();
    renderElements(gameState);
    applyPlayerActions(gameState.availableActions);
    addListener('#dev-cards', updateDevCards);
    getTotalDevsCount(gameState.players.me.devCards.owned);
  }, 1000);
};

const main = async () => {
  const response = await fetch('/game/gameState');
  const gameState = await response.json();

  globalThis.gameState = gameState;
  addEventListeners(gameState);
  renderBoard(gameState.board.hexes);
  applyPlayerActions(gameState.availableActions);
  poll();
};

globalThis.onload = main;
