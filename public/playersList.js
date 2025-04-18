const appendText = (template, elementId, text) => {
  const element = template.getElementById(elementId);
  element.textContent += text;
};

const getSCTitleDecoration = (hasSpecialCard) =>
  hasSpecialCard ? "none" : "line-through";

const setSpecialCardsStyles = (cloneTemplate, player) => {
  const largestArmy = cloneTemplate.getElementById("largest-army");
  const longestRoad = cloneTemplate.getElementById("longest-road");

  largestArmy.style.textDecoration = getSCTitleDecoration(player.hasLargestArmy);
  longestRoad.style.textDecoration = getSCTitleDecoration(player.hasLongestRoad);
}


const createProfileCard = (player) => {
  const clone = document.querySelector('#info-box-template');
  const cloneTemplate = clone.content.cloneNode(true);
  const color = cloneTemplate.getElementById('color');
  
  color.style.backgroundColor = player.color;
  
  setSpecialCardsStyles(cloneTemplate, player);
  appendText(cloneTemplate, 'player-name', player.name);
  appendText(cloneTemplate, 'vp', player.victoryPoints);
  appendText(cloneTemplate, 'dev-cards', player.devCards);
  appendText(cloneTemplate, 'resources', player.resources);

  return cloneTemplate;
};

const displayResourceCount = ({ sheep, wood, brick, ore, wheat }) => {
  appendText(document, 'ore', ore);
  appendText(document, 'wood', wood);
  appendText(document, 'sheep', sheep);
  appendText(document, 'brick', brick);
  appendText(document, 'wheat', wheat);
};

const main = async () => {
  const response = await fetch('/players');
  const players = await response.json();
  const list = document.querySelector('#player-list');
  
  displayResourceCount(players.me.resources);

  players.others.forEach((player) => {
    const template = createProfileCard(player);
    list.append(template);
  });
};

globalThis.onload = main;