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
  clearInterval(id);
  let time = 3;

  const countdown = setInterval(() => {
    renderGameStartText(`Game will start in ${time--} seconds`);
    if (time < 0) {
      clearInterval(countdown);
      redirectToGame();
    }
  }, 1000);
};

const pollForStatus = () => {
  const id = setInterval(async () => {
    const response = await fetch("/gameStatus");
    const { isGameReady, playersCount } = await response.json();

    if (isGameReady) {
      launchGameTimer(id);
      return;
    }

    renderGameStartText(
      `Waiting for ${4 - playersCount} more player(s) to join`
    );
  }, 1000);
};

const main = () => {
  pollForStatus();
};

globalThis.onload = main;
