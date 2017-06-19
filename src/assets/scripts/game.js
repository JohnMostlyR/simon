/**
 * Created by Johan on 24-5-2017.
 */
(function (window) {
  'use strict';

  function Game(controller) {
    this.controller = controller;
    this.simonSaid = [];
    this.userSaid = [];
    this.delayBetweenTones = 1000; // ms
    this.lengthOfTone = 500; // ms
    this.lastUserInputTimerId = 0;
    this.waitingTimeBeforeCheckingUsrInput = 3000; // ms
    this.speedFactor = 1;
    this.delayBetweenTonesTimerId = 0;// ms
    this.toneLengthTimerId = 0;// ms

    this.onMouseDownSubscription = window.pubsubz.subscribe('onMouseDown', () => {
      this.clearTimer();
    });

    this.onMouseUpSubscription = window.pubsubz.subscribe('onMouseUp', (topic, id) => {
      this.userSaid.push(id);
      console.info('User said: ', this.userSaid);
      this.setTimer();
    });
  }

  const advance = function (sequence) {
    const chosen = Math.floor((Math.random() * 4) + 1);
    return sequence.concat([chosen]);
  };

  Game.prototype.setTimer = function () {
    this.clearTimer();
    this.lastUserInputTimerId = setTimeout(() => {
      this.checkUserInput();
    }, this.waitingTimeBeforeCheckingUsrInput * this.speedFactor);
  };

  Game.prototype.clearTimer = function () {
    clearTimeout(this.lastUserInputTimerId);
    this.lastUserInputTimerId = 0;
  };

  Game.prototype.handleError = function () {
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
    window.pubsubz.publish('onBusy', false);
    this.setTimer();
  };

  Game.prototype.speak = function (sequence) {
    console.info('Simon speak: ', sequence);
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
      }, this.lengthOfTone);
    }, this.delayBetweenTones);
  };

  Game.prototype.stopSpeaking = function () {
    clearInterval(this.delayBetweenTonesTimerId);
    this.delayBetweenTonesTimerId = 0;
    clearTimeout(this.toneLengthTimerId);
    this.toneLengthTimerId = 0;
  };

  Game.prototype.checkUserInput = function () {
    window.pubsubz.publish('onBusy', true);

    // Validate user input
    console.info('simon: ', this.simonSaid);
    console.info('user: ', this.userSaid);
    this.userSequenceCopy = [].concat(this.userSaid);
    console.info('User said copy: ', this.userSequenceCopy);
    this.userSaid = [];// Clear user input buffer

    this.controller.allowUserInput = false;

    if (this.userSequenceCopy.length !== this.simonSaid.length) {
      this.handleError();
      return;
    }

    const errors = this.simonSaid.filter((item, idx) => {
      return (item !== this.userSequenceCopy[idx]);
    });

    if (errors.length) {
      this.handleError();
      return;
    }

    // User correctly replied
    this.simonSaid = advance(this.simonSaid);
    this.speak(this.simonSaid);
  };

  Game.prototype.clear = function () {
    this.stopSpeaking();
    this.clearTimer();
    this.simonSaid = [];
    this.controller.showCount(0);
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
    window.pubsubz.unsubscribe(this.onMouseDownSubscription);
    window.pubsubz.unsubscribe(this.onMouseUpSubscription);
    this.clear();
    this.controller = null;
    window.pubsubz.publish('onBusy', false);
  };

  window.Simon = window.Simon || {};
  window.Simon.Game = Game;
})(window);
