const renderGameStartText = (statusMessage) => {
  const textEle = document.querySelector("h1");

  if (textEle) {
    textEle.innerText = statusMessage;
  }
};

const redirectToGame = () => {
  setTimeout(() => {
    globalThis.location.href = "/game.html";
  }, 3000);
};

const launchGameTimer = (id) => {
  let time = 3;
  clearInterval(id);

  const countdown = setInterval(() => {
    renderGameStartText(`Game will start in ${time--} seconds`);
    if (time < 0) {
      clearInterval(countdown);
      redirectToGame();
    }
  }, 1000);
};

const id = setInterval(async () => {
  const response = await fetch("/gameStatus");
  const { isGameReady, playersCount } = await response.json();

  if (!isGameReady) {
    renderGameStartText(
      `Waiting for ${4 - playersCount} more player(s) to join`
    );
    return;
  }

  launchGameTimer(id);
}, 1000);

const main = () => {
  globalThis.addEventListener("load", main);
};

globalThis.onload = main;
