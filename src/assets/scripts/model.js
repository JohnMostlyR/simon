window.simonModel = (function (window) {
  'use strict';

  const subscriptions = {};

  let powerOn = false;
  let strictMode = false;
  let gameStarted = false;

  subscriptions.onPower = window.pubsubz.subscribe('onPower', (topic, power) => {
    powerOn = power;
  });

  subscriptions.onStrictMode = window.pubsubz.subscribe('onStrict', (topic, strict) => {
    strictMode = strict;
  });

  return {
    getPowerState() {
      return powerOn;
    },
    setPowerState(state) {
      if (typeof state === typeof powerOn) {
        if (state !== powerOn) {
          powerOn = state;
        }
      }
    },
    getGameStarted() {
      return gameStarted;
    },
    setGameStarted(state) {
      if (typeof state === typeof gameStarted) {
        if (state !== gameStarted) {
          gameStarted = state;
          window.pubsubz.publish('onGameStarted', gameStarted);
        }
      }
    },
    getStrictMode() {
      return strictMode;
    },
    setStrictMode(state) {
      if (typeof state === typeof strictMode) {
        if (state !== strictMode) {
          strictMode = state;
        }
      }
    },
  };
})(window);
