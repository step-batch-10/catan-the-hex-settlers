const cloneTemplateElement = (id) => {
  const clone = document.querySelector(id);
  const cloneTemplate = clone.content.cloneNode(true);

  return cloneTemplate;
};

const addClassToElement = (className, elementId, parent) => {
  const element = (parent || document).querySelector(elementId);
  element.classList.add(className);
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
  appendText(playerInfoCard, '.largest-army', player.largestArmyCount);
  appendText(playerInfoCard, '.longest-road', player.longestRoadCount);
  if (player.hasLargestArmy)
    addClassToElement('owned', '.largest-army', playerInfoCard);
  if (player.hasLongestRoad)
    addClassToElement('owned', '.longest-road', playerInfoCard);

  return playerInfoCard;
};

const renderPlayersData = (players) => {
  const list = document.querySelector('.players-details');
  const profileCards = players.map((player) => createProfileCard(player));

  list.replaceChildren(...profileCards);
};

const highlightWinner = (winner) => {
  const winnersPanel = document.querySelector(`#${winner.id}`);
  winnersPanel.style.backgroundColor = 'gold';
  document.querySelector('#winner-name').textContent = winner.name + '  Won';
};

const renderResults = async () => {
  const res = await fetch('/game/results');
  const results = await res.json();

  renderPlayersData(results);
  highlightWinner(results[0]);
};

const main = () => {
  renderResults();
};

globalThis.onload = main;
