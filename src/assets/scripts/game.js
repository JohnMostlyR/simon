/**
 * Created by Johan on 24-5-2017.
 */
(function (window) {
  'use strict';

  function Game(controller) {
    this.controller = controller;
    this.simonSaid = [];
    this.userReplyPosition = -1;
    this.replyTimeoutTimerId = 0;
    this.replyTimeout = 5000; // ms
    this.tonePause = 1000; // ms
    this.delayBetweenTonesTimerId = 0;// ms
    this.toneLength = 500; // ms
    this.toneLengthTimerId = 0;// ms

    this.onLensPressSubscription = window.pubsubz.subscribe('onLensPress', () => {
      this.clearReplyTimeoutTimer();
    });

    this.onLensReleaseSubscription = window.pubsubz.subscribe('onLensRelease', (topic, lensPressedId) => {
      window.pubsubz.publish('onBusy', true);
      this.checkUserInput(lensPressedId, this.userReplyPosition += 1);
    });
  }

  const advance = function (sequence) {
    const chosen = Math.floor((Math.random() * 4) + 1);
    return sequence.concat([chosen]);
  };

  Game.prototype.setReplyTimeoutTimer = function () {
    this.clearReplyTimeoutTimer();
    this.replyTimeoutTimerId = setTimeout(() => {
      this.handleError();
    }, this.replyTimeout);
  };

  Game.prototype.clearReplyTimeoutTimer = function () {
    clearTimeout(this.replyTimeoutTimerId);
    this.replyTimeoutTimerId = 0;
  };

  Game.prototype.handleError = function () {
    this.userReplyPosition = -1;
    console.info('Incorrect');
    // play error sound
    if (this.controller.model.getProperty('strict')) {
      // in strict mode reset game
      this.start();
    } else {
      // in non-strict mode play simonSaid again so user can have another try
      this.speak(this.simonSaid);
    }
  };

  Game.prototype.listen = function () {
    this.setReplyTimeoutTimer();
    window.pubsubz.publish('onBusy', false);
  };

  Game.prototype.speak = function (sequence) {
    this.userReplyPosition = -1;
    this.controller.model.setProperty('count', sequence.length);
    let sequenceIndex = 0;

    // delay between tones
    this.delayBetweenTonesTimerId = setInterval(() => {
      this.controller.handleButtonPress(sequence[sequenceIndex]);

      // length of tone
      this.toneLengthTimerId = setTimeout(() => {
        this.controller.handleButtonRelease(sequence[sequenceIndex]);

        if (sequenceIndex < sequence.length) {
          sequenceIndex += 1; // next tone
        } else {
          clearInterval(this.delayBetweenTonesTimerId);
          this.listen();
        }
      }, this.toneLength);
    }, this.tonePause);
  };

  Game.prototype.stopSpeaking = function () {
    clearInterval(this.delayBetweenTonesTimerId);
    this.delayBetweenTonesTimerId = 0;
    clearTimeout(this.toneLengthTimerId);
    this.toneLengthTimerId = 0;
  };

  // Validate user input
  Game.prototype.checkUserInput = function (userSaid, atIndex) {
    console.info('user replied: ', userSaid);
    console.info('at index: ', atIndex);
    console.info('simon said: ', this.simonSaid[atIndex]);
    if (userSaid === this.simonSaid[atIndex]) {
      // User correctly replied
      if (atIndex === this.simonSaid.length - 1) {
        this.simonSaid = advance(this.simonSaid);
        this.speak(this.simonSaid);
      } else {
        this.listen();
      }
    } else {
      this.handleError();
    }
  };

  Game.prototype.clear = function () {
    this.stopSpeaking();
    this.clearReplyTimeoutTimer();
    this.simonSaid = [];
    this.controller.showCount(0);
    this.userReplyPosition = -1;
  };

  Game.prototype.start = function () {
    window.pubsubz.publish('onBusy', true);
    this.clear();
    this.simonSaid = advance(this.simonSaid);
    this.speak(this.simonSaid);
  };

  Game.prototype.stop = function () {
    window.pubsubz.publish('onBusy', true);
    console.info('Stop game');
    window.pubsubz.unsubscribe(this.onLensPressSubscription);
    window.pubsubz.unsubscribe(this.onLensReleaseSubscription);
    this.clear();
    this.controller = null;
    window.pubsubz.publish('onBusy', false);
  };

  window.Simon = window.Simon || {};
  window.Simon.Game = Game;
})(window);
