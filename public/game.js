const getTokenImageFile = (tokenNumber) =>
  `images/tokens/token-${tokenNumber}.png`;

const getTerrainImageFile = (terrain) => `images/terrains/${terrain}.png`;

const resourceCards = (resource) => `/images/resource-cards/${resource}.png`;

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
  const svgNS = "http://www.w3.org/2000/svg";

  return document.createElementNS(svgNS, svgElement);
};

const createImageTag = (imageFile, { x, y, width, height, transform }) => {
  const image = createSvgElement("image");

  image.setAttributeNS("http://www.w3.org/1999/xlink", "href", imageFile);
  image.setAttribute("x", x);
  image.setAttribute("y", y);
  image.setAttribute("width", width);
  image.setAttribute("height", height);
  image.setAttribute("transform", transform);

  return image;
};

const createTerrainImage = (terrain) => {
  const terrainImage = getTerrainImageFile(terrain);
  return createImageTag(terrainImage, {
    x: 10,
    y: 10,
    width: 90,
    height: 110,
    transform: "translate(-155,-237.5)",
  });
};

const createTokenImage = (terrainNumber) => {
  const tokenImage = getTokenImageFile(terrainNumber);
  return createImageTag(tokenImage, {
    x: 0,
    y: 0,
    width: 36,
    height: 36,
    transform: "translate(-120,-190)",
  });
};

const createTileElement = (tile, coord) => {
  const header = createSvgElement("g");
  header.setAttribute("transform", `translate(${coord.x}, ${coord.y})`);

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

const createProfileCard = (player) => {
  const cloneTemplate = cloneTemplateElement("#info-box-template");
  const color = cloneTemplate.querySelector("#color");
  const resourceCount = player.resources;

  color.style.backgroundColor = player.color;

  appendText(cloneTemplate, "#player-name", player.name);
  appendText(cloneTemplate, "#vp", player.victoryPoints);
  appendText(cloneTemplate, "#dev-cards", player.devCards);
  appendText(cloneTemplate, "#resources", resourceCount);
  appendText(cloneTemplate, "#largest-army", player.largestArmyCount);
  appendText(cloneTemplate, "#longest-road", player.longestRoadCount);

  return cloneTemplate;
};

const displayResourceCount = ({ wool, lumber, brick, ore, grain }) => {
  appendText(document, "#ore", ore);
  appendText(document, "#lumber", lumber);
  appendText(document, "#wool", wool);
  appendText(document, "#brick", brick);
  appendText(document, "#grain", grain);
};

const displaySpecialCardStat = (id, count) => {
  const counter = document.querySelector(`#${id}`);
  counter.textContent = count;
};

const updateSpecialCardsStats = (largestArmyCount, longestRoadCount) => {
  displaySpecialCardStat("largest-army-count", largestArmyCount);
  displaySpecialCardStat("longest-road-count", longestRoadCount);
};

const disableElement = (id) => {
  const element = document.querySelector(`#${id}`);
  element.classList.add("disable");
};

const renderSpecialCards = (hasLongestRoad, hasLargestArmy) => {
  if (!hasLargestArmy) disableElement("largest-army-icon");
  if (!hasLongestRoad) disableElement("longest-road-icon");
};

const renderPlayerPanel = (player) => {
  appendText(document, "#player-name", player.name);

  const color = document.querySelector("#color");
  color.style.backgroundColor = player.color;

  displayResourceCount(player.resources);
  updateSpecialCardsStats(player.largestArmyCount, player.longestRoadCount);
  renderSpecialCards(player.hasLongestRoad, player.hasLargestArmy);
};

const renderPlayersData = (players) => {
  renderPlayerPanel(players.me);

  const list = document.querySelector("#player-list");
  const profileCards = players.others.map((player) =>
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
    const cell = document.createElement("div");

    if (positions.includes(i)) cell.classList.add("dot");

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
  const tilescontainer = document.querySelector("#tilesContainer");
  const tiles = generateTiles(hexes);

  tilescontainer.replaceChildren(...tiles);
};

const renderDice = (diceRoll) => {
  ["dice1", "dice2"].forEach((diceId, i) => renderDie(diceId, diceRoll[i]));
};

const cloneTemplateElement = (id) => {
  const clone = document.querySelector(id);
  const cloneTemplate = clone.content.cloneNode(true);

  return cloneTemplate;
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

  showMessage("#current-player", ".player-turn", msg);
};

const createMaritimeTradeCenter = () => {
  const resources = globalThis.gameState.players.me.resources;
  const available = Object.entries(resources).filter(
    (resource) => resource[1] >= 4,
  );

  const tradeContainer = cloneTemplateElement("#tradeWithBank");
  const resourceContainer = tradeContainer.querySelector("#available-resource");
  const className =
    available.length > 3 ? `items-${available.length}` : "items-3";

  resourceContainer.classList.add(className);

  const availableElements = available.map(([resourceName]) => {
    const image = document.createElement("img");
    image.classList.add("card");
    image.id = `resource-${resourceName}`;
    image.src = resourceCards(resourceName);

    return image;
  });

  resourceContainer.append(...availableElements);

  return tradeContainer;
};

const addListenerToCard = () => {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) =>
    card.addEventListener("click", (e) =>
      e.target.classList.toggle("card-selected"),
    ),
  );
};

const tradeParser = (parsedCards, card) => {
  const action =
    card.parentElement.id === "return-resource"
      ? "incomingResources"
      : "outgoingResources";
  const cardName = card.id.split("-")[1];

  parsedCards[action][cardName] = action === "outgoingResources" ? 4 : 1;

  return parsedCards;
};

const parseCards = (cards) => {
  return cards.reduce(tradeParser, {
    outgoingResources: {},
    incomingResources: {},
  });
};

const isValidTrade = (trades) => {
  const { outgoingResources, incomingResources } = trades;
  const outgoingResourcesCount = Object.keys(outgoingResources).length;
  const incomingResourcesCount = Object.keys(incomingResources).length;

  if (outgoingResourcesCount <= 0)
    throw new Error("Please select a resource to trade away...");
  if (incomingResourcesCount <= 0)
    throw new Error("Please select a resource in return...");
};

const tradeWithBank = async (_e) => {
  try {
    const selectedCards = [...document.querySelectorAll(".card-selected")];
    const trades = parseCards(selectedCards);
    isValidTrade(trades);

    const body = JSON.stringify(trades);
    const response = await fetch("/game/trade/maritime", {
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      body,
    });

    if (response.status === 200) {
      document.querySelector("#floating-trade-menu").style.display = "none";
      const MTtrade = document.querySelector("#MTtrade-container");
      MTtrade.remove();
      globalThis.location = "#button-container";
    }
  } catch (e) {
    console.log("showing message");
    const msg = showMessage("#message-container", ".invalid-msg", e.message);

    setTimeout(() => {
      msg.remove();
    }, 2 * 1000);
  }
};

const navigateToMaritimeTrade = () => {
  const maritimeTraderContainer = createMaritimeTradeCenter();
  const tradesContents = document.querySelector("#trade-contents");

  tradesContents.appendChild(maritimeTraderContainer);
  globalThis.location = "#MTtrade-container";
  const confirmBtn = document.querySelector("#trade-confirm-btn");
  addListenerToCard();
  confirmBtn.addEventListener("click", tradeWithBank);
};

const openTradeCenter = () => {
  const tradesMenu = document.querySelector("#floating-trade-menu");
  tradesMenu.style.display = "block";
};

const rollDiceHandler = async () => {
  const dice = await fetch("/game/dice/can-roll").then((res) => res.json());
  if (!dice.canRoll) return;
  await fetch("game/roll-dice", { method: "POST" });
};

const addRollDiceEvent = () => {
  const diceContainer = document.querySelector(".dice-container");
  diceContainer.addEventListener("click", rollDiceHandler);
};

const buildAt = async (targetElementId, pieceType) => {
  const fd = new FormData();
  fd.set("id", targetElementId);

  return await fetch(`/game/build/${pieceType}`, {
    body: fd,
    method: "POST",
  });
};

const isValidBuilt = async (pieceType, fd) => {
  const { canBuild } = await fetch(`/game/can-build/${pieceType}`, {
    body: fd,
    method: "POST",
  }).then((r) => r.json());

  return canBuild;
};

const isPieceTypeValid = (pieceType) =>
  new Set(["vertex", "edge"]).has(pieceType);

const highlightElement = (element, currentPlayer) => {
  element.style.fill = currentPlayer.color;
  element.style.opacity = 0.4;
  element.classList.add("highlight");
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
  formData.set("id", targetElementId);

  const canBuild = await isValidBuilt(pieceType, formData);

  if (!canBuild) return element.classList.add("block");
  return { element, targetElementId, pieceType };
};

const build = async (event) => {
  const validationData = await getBuildValidationData(event);
  if (!validationData) return;

  const { targetElementId, pieceType } = validationData;
  return buildAt(targetElementId, pieceType);
};

const canBuildHandler = (currentPlayer) => async (event) => {
  const validationData = await getBuildValidationData(event);
  if (!validationData) return;

  const { element } = validationData;

  highlightElement(element, currentPlayer);
  setTimeout(lowLightElement(element, "highlight"), 1000);
};

const addBuildEvent = (currentPlayer) => {
  const svg = document.getElementById("svg20");
  svg.addEventListener("click", build);
  svg.addEventListener("mouseover", canBuildHandler(currentPlayer));
};

const passTurn = async () =>
  await fetch("/game/changeTurn", { method: "POST" });

const closeTradeOptions = () =>
  (document.querySelector("#floating-trade-menu").style.display = "none");

const addListener = (elementId, listener) => {
  const element = document.querySelector(elementId);
  element.addEventListener("click", listener);
};

const goBack = () => (globalThis.location = "#button-container");

const addClassToElement = (elementId, className) => {
  const element = document.querySelector(elementId);
  element.classList.add(className);
};

const removeClassFromElement = (elementId, className) => {
  const element = document.querySelector(elementId);
  element.classList.remove(className);
};

const applyPlayerActions = ({ canTrade }) => {
  const playerActionIcons = ["#trade", "#pass-btn"];

  if (canTrade) {
    playerActionIcons.forEach((id) => removeClassFromElement(id, "disable"));
    return;
  }

  playerActionIcons.forEach((id) => addClassToElement(id, "disable"));
};

const addTradeListeners = () => {
  addListener("#trade", openTradeCenter);
  addListener("#maritime-btn", navigateToMaritimeTrade);
};

const addNavigation = () => {
  addListener("#pass-btn", passTurn);
  addListener("#back-btn", goBack);
  addListener("#close-btn", closeTradeOptions);
};

const showDevCards = () => {
  const cloned = cloneTemplateElement("#all-dev-cards");
  const allDevCards = cloned.querySelector(".display-all-dev-card");
  const container = document.querySelector("#all-devs");
  const closeBar = cloned.querySelector(".close-btn");
  const existing = container.querySelector(".display-all-dev-card");

  if (existing) {
    existing.style.display = "flex";
    return;
  }

  container.append(allDevCards);

  closeBar.addEventListener("click", () => {
    allDevCards.style.display = "none";
  });
};

const addEventListeners = (gameState) => {
  addRollDiceEvent();
  addBuildEvent(gameState.players.me);
  addNavigation();
  addTradeListeners();
  addListener("#unplayed-dev", showDevCards);
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
  renderDice(gameState.diceRoll);
  displayPlayerTurn(gameState);
};

const poll = () => {
  setInterval(async () => {
    const response = await fetch("/game/gameData");
    const gameState = await response.json();
    globalThis.gameState = gameState;

    renderElements(gameState);
    applyPlayerActions(gameState.availableActions);
  }, 1000);
};

const main = async () => {
  const response = await fetch("/game/gameState");
  const gameState = await response.json();

  globalThis.gameState = gameState;
  addEventListeners(gameState);
  renderBoard(gameState.board.hexes);
  applyPlayerActions(gameState.availableActions);
  poll();
};

globalThis.onload = main;
