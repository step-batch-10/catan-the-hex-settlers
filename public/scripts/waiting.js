const displayGameStarts = (time) => {
  const textEle = document.querySelector('#status');

  textEle.innerText = `Game will start in ${time} seconds...`;
  textEle.id = 'game-time-text';
};

const redirectToGame = (id) => {
  setTimeout(() => {
    clearInterval(id);
    globalThis.location.href = '/game.html';
  }, 3000);
};

const pollForStatus = () => {
  let time = 3;

  const id = setInterval(async () => {
    const response = await fetch('/gameStatus');
    const { isGameReady } = await response.json();
    if (!isGameReady) return;
    displayGameStarts(time--);
    redirectToGame(id);
  }, 1000);
};

const main = () => {
  pollForStatus();
};

globalThis.onload = main;
