const getDiceDots = (num) => {
  const diceDots = {
    1: [5],
    2: [1, 9],
    3: [4, 5, 6],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
  };

  return diceDots[num];
};

const markDice = (dots, diceContainer) => {
  const dice = document.getElementsByClassName(diceContainer)[0];
  dots.forEach((num) => {
    const dot = dice.getElementsByClassName(`cell-${num}`)[0];
    dot.style.visibility = 'visible';
  });
};

const resetDice = () => {
  document.querySelectorAll('.dot').forEach((dot) => {
    dot.style.visibility = 'hidden';
  });
};

const diceHandler = async () => {
  const dices = await fetch('/dice');
  const { dice1, dice2 } = await dices.json();

  resetDice();

  const d1 = getDiceDots(dice1);
  markDice(d1, 'dice1');

  const d2 = getDiceDots(dice2);
  markDice(d2, 'dice2');
};

const diceEnable = () => {
  const playerId = 'p1';
  setInterval(async () => {
    const canRoll = await fetch(`/canRoll/${playerId}`);
    const { isRolled } = await canRoll.json();
    if (isRolled) {
      const container = document.getElementsByClassName('dice-container')[0];
      container.removeEventListener('click', diceHandler);
    }
  }, 1000);
};

const main = () => {
  const dots = getDiceDots(1);
  markDice(dots, 'dice1');
  markDice(dots, 'dice2');
  diceEnable();
  const container = document.getElementsByClassName('dice-container')[0];
  container.addEventListener('click', diceHandler);
};

globalThis.onload = main;
