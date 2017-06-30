/**
 * Created by Johan on 24-5-2017.
 */
window.Simon = window.Simon || {};

window.Simon.game = (function (window) {
  'use strict';

  const lengthToWin = 20;
  const replyTimeout = 5000; // ms
  const subscriptions = {};
  const timers = {};
  const toneLength = 420; // ms
  const tonePause = 1000; // ms

  let simonSaid = [];
  let userReplyPosition = -1;

  const handleError = function () {
    window.pubsubz.publish('onSimonListens', false);
    userReplyPosition = -1;
    window.pubsubz.publish('onIncorrectReply', true);
  };

  const clearReplyTimeoutTimer = function () {
    clearTimeout(timers.replyTimeoutTimerId);
    timers.replyTimeoutTimerId = 0;
  };

  const setReplyTimeoutTimer = function () {
    clearReplyTimeoutTimer();
    timers.replyTimeoutTimerId = setTimeout(() => {
      handleError();
    }, replyTimeout);
  };

  const listen = function () {
    window.pubsubz.publish('onSimonListens', true);
    setReplyTimeoutTimer();
  };

  const speak = function (sequence) {
    window.pubsubz.publish('onSimonListens', false);
    const sequenceLength = sequence.length;
    let sequenceIndex = 0;

    userReplyPosition = -1;

    // delay between tones
    timers.delayBetweenTonesTimerId = setInterval(() => {
      window.pubsubz.publish('onSimonSpeaks', sequence[sequenceIndex]);

      // length of tone
      timers.toneLengthTimerId = setTimeout(() => {
        window.pubsubz.publish('onSimonFinishedSpeaking', sequence[sequenceIndex]);

        if (sequenceIndex < sequenceLength - 1) {
          sequenceIndex += 1; // next tone
        } else {
          clearInterval(timers.delayBetweenTonesTimerId);
          return listen();
        }
      }, toneLength);
    }, tonePause);
  };

  const addNewItem = function (sequence) {
    const chosen = Math.floor((Math.random() * 4) + 1);
    return sequence.concat([chosen]);
  };

  const advance = function () {
    if (userReplyPosition === simonSaid.length - 1) {
      if (simonSaid.length === lengthToWin) {
        window.pubsubz.publish('onWin', simonSaid);
      } else {
        simonSaid = addNewItem(simonSaid);
        window.pubsubz.publish('onAdvance', simonSaid.length);
        speak(simonSaid);
      }
    } else {
      listen();
    }
  };

  // Validate user input
  const checkUserInput = function (userSaid, atIndex) {
    if (userSaid === simonSaid[atIndex]) {
      // User correctly replied
      window.pubsubz.publish('onCorrectReply', userSaid);
      window.pubsubz.publish('onSimonListens', true);
    } else {
      handleError();
    }
  };

  const reset = function () {
    window.pubsubz.publish('onSimonListens', false);
    Object.keys(subscriptions).forEach((subscription) => {
      window.pubsubz.unsubscribe(subscriptions[subscription]);
    });
    Object.keys(timers).forEach((timer) => {
      clearTimeout(timers[timer]);
      timers[timer] = 0;
    });
    simonSaid = [];
    userReplyPosition = -1;
  };

  const start = function () {
    reset();
    subscriptions.onLensPressSubscription = window.pubsubz.subscribe('onLensPress', (topic, lensPressedId) => {
      clearReplyTimeoutTimer();
      checkUserInput(lensPressedId, userReplyPosition += 1);
    });

    subscriptions.onLensReleaseSubscription = window.pubsubz.subscribe('onLensRelease', () => {
      window.pubsubz.publish('onSimonListens', false);
      advance();
    });

    subscriptions.onIncorrectShowedSubscription = window.pubsubz.subscribe('onIncorrectShowed', () => {
      if (window.Simon.model.getStrictMode()) {
        // in strict mode reset game
        start();
      } else {
        // in non-strict mode play sequence again so user can have another try
        speak(simonSaid);
      }
    });

    simonSaid = addNewItem(simonSaid);
    window.pubsubz.publish('onAdvance', simonSaid.length);
    speak(simonSaid);
  };

  const stop = function () {
    reset();
  };

  // PUBLIC
  return {
    start,
    stop,
  };
})(window);
