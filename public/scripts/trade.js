export const tradeTypes = [{name:"Exchange", minimuTradeOffCount:4}, {name: "Trade", minimuTradeOffCount: 1}]

const tradeDetails = {
  outgoingResources: {},
  incomingResources : {},
  type : null,
  minimumTradeOffCount : 1,
}

const resetTradeDetails = () => {
  tradeDetails.incomingResources = {};
  tradeDetails.outgoingResources = {};
  tradeDetails.minimumTradeOffCount = 1;
  tradeDetails.type = null;
}

const listeners = {
}

const createEelement = (elementType,className = null,id = null,) =>
{
  const element = document.createElement(elementType);
  element.className = className;
  element.id = id;

  return element;
}

const rotateBackAllCards = () => {
  const rotateCards = document.querySelectorAll(".rotateY")
  rotateCards.forEach(card => card.classList.remove("rotateY"))
}

const setupTradeDetails = (trade) => {
  tradeDetails.type = trade.name
  tradeDetails.minimumTradeOffCount = trade.minimuTradeOffCount
}

const updateTradeOffResource = (modyfier, e) => {
  e.stopPropagation();
  const resource = e.target.closest(".resource").getAttribute('type')
  if (!tradeDetails.outgoingResources[resource])
    tradeDetails.outgoingResources[resource] = 0;

  tradeDetails.outgoingResources[resource] +=
    (tradeDetails.minimumTradeOffCount * modyfier);
}

const updateTradeInResource = (modyfier, e) => {
  e.stopPropagation();
  const resource = e.target.closest(".resource").getAttribute('type')
  if (!tradeDetails.incomingResources[resource])
    tradeDetails.incomingResources[resource] = 0;

  tradeDetails.incomingResources[resource] += (1 * modyfier)
}

export const replaceListeners = (elementSelector, listener, listenerType = "click") => {
  const cards = document.querySelectorAll(elementSelector);
  cards.forEach(card => {
    const elementType = card.getAttribute('type')
    const currentListener = listeners[elementType]?.[listenerType];
    if (currentListener)
      card.removeEventListener(listenerType, currentListener);

    card.addEventListener(listenerType, listener)
    if (!listeners[elementType]) listeners[elementType] = {};
      listeners[elementType][listenerType] = listener;
  })
}

export const decrementCount = (e) => {
  e.stopPropagation();
  updateTradeOffResource(-1 , e)
}

export const incrementCount = (e) => {
  e.stopPropagation();
  updateTradeOffResource(1, e);
}

export const removeClassFromElements = (elementSelector, className) => {
   const choosenResources = document.querySelectorAll(elementSelector);
  choosenResources.forEach(choosenResource => {
    choosenResource.classList.remove(className);
  })
}

const endTrading = () => {
  removeClassFromElements(".disabled", "disabled");
  resetTradeDetails();
  replaceListeners(".resource", showOptions(tradeTypes), "click")
}

const confirmTrade = async (e) => {
  e.stopPropagation();
  const choosenResources = document.querySelectorAll(".choosen");
  choosenResources.forEach(choosenResource => {
    choosenResource.classList.remove("choosen")
    choosenResource.classList.add("disabled")
  })
  
  const requestBody = {
    incomingResources: tradeDetails.incomingResources,
    outgoingResources: tradeDetails.outgoingResources
  }

  if (tradeDetails.type === "Exchange") {
    await fetch("game/trade/bank", { method: "POST", body: JSON.stringify(requestBody) })
    
    endTrading();
  }
    
}

const addToTradeIn = (e) => {
  e.stopPropagation();
  console.log("addToTradeIn fuction called ")
  const card = e.currentTarget;
  card.classList.add("choosen")
  updateTradeInResource(1, e);
  if (tradeDetails.type === "Exchange")
    confirmTrade(e);

  replaceListeners(".choosen", confirmTrade, "click")
  // showCursoMessage(".choosen", "click here to confirm trade")
}

export const addClassToElements = (elementSelector, className) => {
  const choosenResources = document.querySelectorAll(elementSelector);
  choosenResources.forEach(choosenResource => {
    choosenResource.classList.add(className);
    
  })
}

const confirmSelection = (e) => {
  e.stopPropagation();
  rotateBackAllCards();
  console.log("selection confirmed")
  const card = e.target.closest(".resource");
  card.classList.add("choosen")
  addClassToElements(".choosen", "disabled");
  removeClassFromElements(".choosen", "choosen");
  // showCursoMessage(".resource", "click to slect for trade innnn");
  // showCursoMessage(".disabled", "already selected for trade off");
  console.log("trade type", tradeDetails.type);
  
  replaceListeners(".resource", addToTradeIn, "click")
}

const addToTradeOff = (e) => {
  e.stopPropagation();
  console.log("addToTradeOff fuction called ")
  const card = e.currentTarget;
  card.classList.add("choosen")
  updateTradeOffResource(1, e);
  replaceListeners(".choosen", confirmSelection, "click")
  // showCursoMessage(".choosen", "click here to confirm the selection")
}

const beginTrade = (trade) => (e) => {
  console.log("in trade mode", trade)
  e.stopPropagation();
  rotateBackAllCards();
  const card = e.target.closest(".resource");

  setupTradeDetails(trade);
  updateTradeOffResource(1, e);
  card.classList.add("choosen");

  if (trade.name === "Exchange")
    return confirmSelection(e);

  replaceListeners(".resource", addToTradeOff, "click")
  replaceListeners(".choosen", confirmSelection, "click")
  // showCursoMessage(".choosen", "click here to confirm selections", )
  // card.classList.add("elavate");
}

const createTradeButton = (card, trade) => {
  const totalResourceCount = card.querySelector(".total-count").textContent;
  const optionText = createEelement("p", "option" );
  optionText.textContent = trade.name;
  // if (trade.name !== "trade with bank")
    optionText.addEventListener("click", beginTrade(trade))

  if (Number(totalResourceCount) < trade.minimuTradeOffCount)
    optionText.classList.add("disabled")

  return optionText;
}

export const showOptions = (trades) => (e) => {
  e.stopPropagation();
  rotateBackAllCards();

  const card = e.currentTarget;
  card.classList.toggle("rotateY")

  const optionButtons = trades.map(createTradeButton.bind(null, card));

  const cardBack = card.querySelector(".card-options")
  cardBack.replaceChildren(...optionButtons)
}

export const updateResourceCount = (resources) => {
  // wool, brick, lumber, ore, grain
  Object.entries(resources).forEach(([resourceType, count]) => {
    const card = document.querySelector(`[type="${resourceType}"]`);

    card.querySelector(".total-count").textContent = count;
  })
}

export const tradeControlls = () => {
  replaceListeners(".resource", showOptions(tradeTypes), "click")
}

// globalThis.onload = () => addListenerToCard(rotateY)
globalThis.onclick = () => {
  rotateBackAllCards()
}
