const markDice = (dots, diceContainer) => {
  const dice = document.getElementsByClassName(diceContainer)[0];
  dots.forEach((num) => {
    const dot = dice.getElementsByClassName(num)[0];
    dot.style.visibility = "visible";
  });
};

const diceHandler = (gameDots) => {
  const dice1 = gameDots["6"];
  const dice2 = gameDots["4"];
  markDice(dice1, "dice1");
  markDice(dice2, "dice2");
};

const main = () => {
  const gameDots = {
    1: [5],
    2: [1, 9],
    3: [4, 5, 6],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9],
  };

  const dots = gameDots["2"];
  markDice(dots, "dice1");
  markDice(dots, "dice2");

  const container = document.getElementsByClassName("dice-container")[0];
  container.addEventListener("click", () => diceHandler(gameDots));
};
  
globalThis.onload = main;
