/**
 * Created by Johan on 24-5-2017.
 */
(function (window) {
  'use strict';

  function Game(strictMode = false) {
    this.strictMode = strictMode;
    this.simonSaid = [];
    this.userReplyPosition = -1;
    this.replyTimeout = 5000; // ms
    this.tonePause = 1000; // ms
    this.toneLength = 420; // ms
    this.subscriptions = {};
    this.lengthToWin = 20;
    this.timers = {};

    this.subscriptions.onLensPressSubscription = window.pubsubz.subscribe('onLensPress', (topic, lensPressedId) => {
      this.clearReplyTimeoutTimer();
      this.checkUserInput(lensPressedId, this.userReplyPosition += 1);
    });

    this.subscriptions.onLensReleaseSubscription = window.pubsubz.subscribe('onLensRelease', () => {
      window.pubsubz.publish('onBusy', true);
      this.advance();
    });

    this.subscriptions.onIncorrectShowedSubscription = window.pubsubz.subscribe('onIncorrectShowed', () => {
      if (this.strictMode) {
        // in strict mode reset game
        this.start();
      } else {
        // in non-strict mode play sequence again so user can have another try
        this.speak(this.simonSaid);
      }
    });

    this.onStrictSubscription = window.pubsubz.subscribe('onStrict', (topic, data) => {
      this.strictMode = data;
    });
  }

  const addNewItem = function (sequence) {
    const chosen = Math.floor((Math.random() * 4) + 1);
    return sequence.concat([chosen]);
  };

  Game.prototype.setReplyTimeoutTimer = function () {
    this.clearReplyTimeoutTimer();
    this.timers.replyTimeoutTimerId = setTimeout(() => {
      window.pubsubz.publish('onBusy', true);
      this.handleError();
    }, this.replyTimeout);
  };

  Game.prototype.clearReplyTimeoutTimer = function () {
    clearTimeout(this.timers.replyTimeoutTimerId);
    this.timers.replyTimeoutTimerId = 0;
  };

  Game.prototype.handleError = function () {
    this.userReplyPosition = -1;
    window.pubsubz.publish('onIncorrectReply', true);
  };

  Game.prototype.listen = function () {
    this.setReplyTimeoutTimer();
    window.pubsubz.publish('onBusy', false);
  };

  Game.prototype.speak = function (sequence) {
    const sequenceLength = sequence.length;
    let sequenceIndex = 0;

    this.userReplyPosition = -1;

    // delay between tones
    this.timers.delayBetweenTonesTimerId = setInterval(() => {
      window.pubsubz.publish('onSimonSpeaks', sequence[sequenceIndex]);

      // length of tone
      this.timers.toneLengthTimerId = setTimeout(() => {
        window.pubsubz.publish('onSimonFinishedSpeaking', sequence[sequenceIndex]);

        if (sequenceIndex < sequenceLength - 1) {
          sequenceIndex += 1; // next tone
        } else {
          clearInterval(this.timers.delayBetweenTonesTimerId);
          return this.listen();
        }
      }, this.toneLength);
    }, this.tonePause);
  };

  Game.prototype.advance = function () {
    if (this.userReplyPosition === this.simonSaid.length - 1) {
      if (this.simonSaid.length === this.lengthToWin) {
        window.pubsubz.publish('onWin', this.simonSaid);
      } else {
        this.simonSaid = addNewItem(this.simonSaid);
        window.pubsubz.publish('onAdvance', this.simonSaid.length);
        this.speak(this.simonSaid);
      }
    } else {
      this.listen();
    }
  };

  // Validate user input
  Game.prototype.checkUserInput = function (userSaid, atIndex) {
    if (userSaid === this.simonSaid[atIndex]) {
      // User correctly replied
      window.pubsubz.publish('onCorrectReply', userSaid);
    } else {
      this.handleError();
    }
  };

  Game.prototype.reset = function () {
    window.pubsubz.publish('onBusy', true);
    Object.keys(this.timers).forEach((timer) => {
      clearTimeout(this.timers[timer]);
    });
    this.simonSaid = [];
    window.pubsubz.publish('onAdvance', 0);
    this.userReplyPosition = -1;
  };

  Game.prototype.start = function () {
    this.reset();
    this.simonSaid = addNewItem(this.simonSaid);
    window.pubsubz.publish('onAdvance', this.simonSaid.length);
    this.speak(this.simonSaid);
  };

  Game.prototype.stop = function () {
    this.reset();
    Object.keys(this.subscriptions).forEach((subscription) => {
      window.pubsubz.unsubscribe(this.subscriptions[subscription]);
    });
  };

  window.Simon = window.Simon || {};
  window.Simon.Game = Game;
})(window);
