const appendText = (template, elementId, text) => {
  const element = template.getElementById(elementId);
  element.textContent += text;
};

const totalResources = (resources) =>
  Object.values(resources).reduce((sum, count) => sum + count, 0);

const createProfileCard = (player) => {
  const clone = document.querySelector('#info-box-template');
  const cloneTemplate = clone.content.cloneNode(true);
  const resourceCount = totalResources(player.resources);
  const color = cloneTemplate.getElementById('color');

  color.style.backgroundColor = player.color;

  appendText(cloneTemplate, 'player-name', player.name);
  appendText(cloneTemplate, 'vp', player.victoryPoints);
  appendText(cloneTemplate, 'dev-cards', player.devCards);
  appendText(cloneTemplate, 'resources', resourceCount);

  return cloneTemplate;
};

const main = async () => {
  const response = await fetch('/players');
  const players = await response.json();
  console.log(players);
  const list = document.querySelector('#player-list');

  players.others.forEach((player) => {
    const template = createProfileCard(player);
    list.append(template);
  });
};

globalThis.onload = main;
