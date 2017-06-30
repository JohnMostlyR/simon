(function (window) {
  'use strict';

  const subscriptions = {};
  const timers = {};
  const waitingTimeForStartingOverAfterWin = 5000; // ms
  const game = window.Simon.game;

  function handlePowerButton() {
    game.stop();
    Object.keys(timers).forEach((timer) => {
      clearTimeout(timers[timer]);
    });
    window.Simon.model.setGameStarted(false);
  }

  function handleStartButton(start) {
    if (start) {
      // start new game
      game.start();
      window.Simon.model.setGameStarted(true);
    } else {
      if (window.Simon.model.getGameStarted()) {
        game.stop();
        window.Simon.model.setGameStarted(false);
      }
    }
  }

  subscriptions.onPower = window.pubsubz.subscribe('onPower', (topic, havePower) => {
    handlePowerButton(havePower);
  });

  subscriptions.onStart = window.pubsubz.subscribe('onStart', (topic, start) => {
    handleStartButton(start);
  });

  subscriptions.onShowWinFinished = window.pubsubz.subscribe('onShowWinFinished', () => {
    timers.newGame = setTimeout(() => {
      handleStartButton(true);
    }, waitingTimeForStartingOverAfterWin);
  });
})(window);
