const appendText = (template, elementId, text) => {
  const element = template.getElementById(elementId);
  element.textContent += text;
};

const createProfileCard = (player) => {
  const clone = document.querySelector('#info-box-template');
  const cloneTemplate = clone.content.cloneNode(true);
  const resourceCount = player.resources;
  const color = cloneTemplate.getElementById('color');

  color.style.backgroundColor = player.color;

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

const renderPlayersData = (players) => {
  const list = document.querySelector('#player-list');
  displayResourceCount(players.me.resources);
  players.others.forEach((player) => {
    const template = createProfileCard(player);
    list.append(template);
  });
};

const main = async () => {
  const response = await fetch('/game/gameState');
  const gameState = await response.json();

  renderPlayersData(gameState.players);
};

globalThis.onload = main;
