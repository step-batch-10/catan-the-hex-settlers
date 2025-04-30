export class Notifications {
  notificationTemplate;
  notificationActions;

  constructor(template, notificationActions) {
    this.notificationTemplate = template;
    this.notificationActions = notificationActions;
  }

  cloneTemplate() {
    return document.querySelector(this.notificationTemplate).content.cloneNode(true);
  }

  setTitle(notDiv, header) {
    if (isMyTurn())
      return notDiv.querySelector('.header').textContent = replaceYourName(header);
    notDiv.querySelector('.header').textContent = header;
  }

  setBody(notDiv, body) {
    notDiv.querySelector('.body').textContent = body;
  }

  createActionBtn(action) {
    const btn = document.createElement('div');
    btn.textContent = action;
    btn.classList.add('notification-btn')
    const handler = this.notificationActions?.[action];

    if (typeof handler === 'function') {
      btn.onclick = handler;
    } else {
      console.warn(`No handler found for action "${action}"`);
    }

    btn.classList.add('action-btn');

    return btn;
  }

  setActions(notDiv, actions) {
    const actionsDiv = notDiv.querySelector('.actions');
    const actionBtns = actions.map(this.createActionBtn.bind(this));
    actionsDiv.replaceChildren(...actionBtns);
  }

  show(notification, duration) {
    const notificationDiv = this.cloneTemplate();
    this.setTitle(notificationDiv, notification.header);
    this.setBody(notificationDiv, notification.body);
    
    if (notification.actions && !isMyTurn())
      this.setActions(notificationDiv, notification.actions)

    document.body.appendChild(notificationDiv);

    if (duration)
      setTimeout(() => {
        this.removeAllNotifications();
      }, duration * 1000);
  }

  showAll(notifications) {
    notifications.forEach(this.show.bind(this));
  }

  removeAllNotifications() {
    document.querySelectorAll('.notification-container').forEach(notification => notification.remove());
  }
}

const isMyTurn = () => {
  console.log(gameState.currentPlayerId, gameState.players.me.id);
  return gameState.currentPlayerId === gameState.players.me.id
}

const replaceYourName = (string) => {
  const newString = string.split(" ");
  newString[0] = "You";
  return newString.join(" ");
}