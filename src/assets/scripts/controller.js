(function (window) {
  'use strict';

  const subscriptions = {};
  const timers = {};
  const waitingTimeForStartingOverAfterWin = 3000; // milliseconds
  const game = window.simonGame;

  function handlePowerButton() {
    game.stop();
    Object.keys(timers).forEach((timer) => {
      clearTimeout(timers[timer]);
    });
    window.simonModel.setGameStarted(false);
  }

  function handleStartButton(start) {
    if (start) {
      // start new game
      game.start();
      window.simonModel.setGameStarted(true);
    } else if (window.simonModel.getGameStarted()) {
      // stop/reset game
      game.stop();
      window.simonModel.setGameStarted(false);
    }
  }

  subscriptions.onPower = window.pubsubz.subscribe('onPower', (topic, havePower) => {
    handlePowerButton(havePower);
  });

  subscriptions.onStart = window.pubsubz.subscribe('onStart', (topic, start) => {
    handleStartButton(start);
  });

  // After the winning tune wait a bit and start a new game
  subscriptions.onShowWinFinished = window.pubsubz.subscribe('onShowWinFinished', () => {
    timers.newGame = setTimeout(() => {
      handleStartButton(true);
    }, waitingTimeForStartingOverAfterWin);
  });
})(window);
