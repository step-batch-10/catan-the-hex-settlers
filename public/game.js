const appendText = (template, elementId, text) => {
  const element = template.getElementById(elementId);
  element.textContent += text;
};

const textDecStyle = (hasSpecialCard) =>
  (hasSpecialCard ? 'no-' : '') + 'line-through';

const setSpecialCardsStyles = (cloneTemplate, player) => {
  const largestArmy = cloneTemplate.getElementById('largest-army');
  const longestRoad = cloneTemplate.getElementById('longest-road');
  largestArmy.classList.add(textDecStyle(player.largestArmy));
  longestRoad.classList.add(textDecStyle(player.longestRoad));
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

function renderDice(diceId, value) {
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
}

const main = async () => {
  const response = await fetch('/game/gameState');
  
  const gameState = await response.json();
  
  renderDice('dice1', 3);
  renderDice('dice2', 5);
  renderPlayersData(gameState.players);
};

globalThis.onload = main;
