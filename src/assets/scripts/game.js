/**
 * Created by Johan on 24-5-2017.
 */
(function (window) {
  'use strict';

  function Game(controller) {
    this.controller = controller;
    this.sequence = [];
    this.delayBetweenTones = 1000; // ms
    this.lengthOfTone = 500; // ms
    this.lastUserInputTimerId = 0;
    this.waitingTimeBeforeCheckingUsrInput = 3000; // ms
    this.speedFactor = 1;
    this.delayBetweenTonesTimerId = 0;
    this.toneLengthTimerId = 0;

    this.controller.view.subscribe('onMouseDown', () => {
      if (this.controller.allowUserInput) {
        this.clearTimer();
      }
    });

    this.controller.view.subscribe('onMouseUp', () => {
      if (this.controller.allowUserInput) {
        this.setTimer();
      }
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
    this.controller.allowUserInput = false;
    // play error sound
    if (this.controller.model.getProperty('strict')) {
      // in strict mode reset game
      this.start();
    } else {
      // in non-strict mode play sequence again so user can have another try
      this.speak(this.sequence);
    }
  };

  Game.prototype.listen = function () {
    this.controller.allowUserInput = true;
    this.setTimer();
  };

  Game.prototype.speak = function (sequence) {
    this.controller.allowUserInput = false;
    console.info('Speak out new sequence: ', sequence);
    this.controller.showCount(sequence.length);
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
    console.info('check checkUserInput: ');
    console.info('simon: ', this.sequence);
    console.info('user: ', this.controller.userSequence);
    this.userSequence = [].concat(this.controller.userSequence);
    this.controller.userSequence = []; // Clear user input buffer

    this.controller.allowUserInput = false;

    if (this.userSequence.length !== this.sequence.length) {
      this.handleError();
      return;
    }

    const errors = this.sequence.filter((item, idx) => {
      return (item !== this.userSequence[idx]);
    });

    if (errors.length) {
      this.handleError();
      return;
    }

    console.info('Correct');
    this.sequence = advance(this.sequence);
    console.info('New sequence: ', this.sequence);
    this.speak(this.sequence);
  };

  Game.prototype.clear = function () {
    this.stopSpeaking();
    this.clearTimer();
    this.sequence = [];
    this.controller.showCount(0);
  };

  Game.prototype.start = function () {
    this.controller.allowUserInput = false;
    this.clear();
    this.sequence = advance(this.sequence);
    this.speak(this.sequence);
    this.controller.allowUserInput = true;
  };

  Game.prototype.stop = function () {
    console.info('Stop game');
    this.clear();
    this.controller.allowUserInput = true;
    this.controller = null;
  };

  window.Simon = window.Simon || {};
  window.Simon.Game = Game;
})(window);
