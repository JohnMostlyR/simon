/**
 * Created by Johan on 24-5-2017.
 */
(function (window) {
  'use strict';

  function Controller(model, view) {
    this.model = model;
    this.view = view;
    this.game = null;
    this.waitingTimeForStartingOverAfterWin = 5000; // ms

    this.onFormChangeSubscription = window.pubsubz.subscribe('onFormChange', (topic, data) => {
      switch (data.id) {
        case 'power':
          this.handlePowerButton(data.value);
          break;
        case 'start':
          if (this.model.getProperty('powerOn')) {
            this.handleStartButton(data.value);
          }
          break;
        case 'strict':
          this.handleStrictMode(data.value);
          break;
        default:
          break;
      }
    });

    this.onSimonSpeaksSubscription = window.pubsubz.subscribe('onSimonSpeaks', (topic, saying) => {
      this.handleButtonPress(saying);
    });

    this.onSimonFinishedSpeakingSubscription = window.pubsubz.subscribe('onSimonFinishedSpeaking', (topic, said) => {
      this.handleButtonRelease(said);
    });

    this.onLensPressSubscription = window.pubsubz.subscribe('onCorrectReply', (topic, id) => {
      this.handleButtonPress(id);
    });

    this.onLensReleaseSubscription = window.pubsubz.subscribe('onLensRelease', (topic, id) => {
      this.handleButtonRelease(id);
    });

    this.onCountSubscription = window.pubsubz.subscribe('onCount', (topic, data) => {
      this.showCount(data);
    });

    this.onBusySubscription = window.pubsubz.subscribe('onBusy', (topic, busy) => {
      if (busy) {
        this.view.disableReplyButtons();
      } else {
        this.view.enableReplyButtons();
      }
    });

    this.onIncorrectReplySubscription = window.pubsubz.subscribe('onIncorrectReply', () => {
      this.view.showIncorrect();
    });

    this.onWinSubscription = window.pubsubz.subscribe('onWin', (topic, sequence) => {
      this.view.showWin(sequence.slice(-1));
    });

    this.onShowWinFinishedSubscription = window.pubsubz.subscribe('onShowWinFinished', () => {
      setTimeout(() => {
        this.handleStartButton();
      }, this.waitingTimeForStartingOverAfterWin);
    });
  }

  Controller.prototype.handlePowerButton = function (power) {
    if (this.model.getProperty('powerOn')) {
      this.model.setProperty('powerOn', false);

      if (this.model.getProperty('gameStarted')) {
        this.game.stop();
        this.game = null;
        this.model.setProperty('gameStarted', false);
      }
    } else {
      this.model.setProperty('powerOn', true);
    }
  };

  Controller.prototype.handleStartButton = function (start) {

    // reset
    this.model.setProperty('count', 0);

    if (start) {
      // start new game
      this.game = new window.Simon.Game(this.model.getProperty('strict'));
      this.game.start();
      this.model.setProperty('gameStarted', true);
    } else {
      if (this.model.getProperty('gameStarted')) {
        this.game.stop();
        this.game = null;
        this.model.setProperty('gameStarted', false);
      }
    }
  };

  Controller.prototype.handleStrictMode = function (strict) {
    this.model.setProperty('strict', strict);
  };

  Controller.prototype.handleButtonPress = function (id) {
    this.view.startSpeaking(id);
  };

  Controller.prototype.handleButtonRelease = function (id) {
    this.view.stopSpeaking(id);
  };

  Controller.prototype.showCount = function (count = 0) {
    let showString = String(count);
    if (showString.length === 1) {
      showString = `0${showString}`;
    }
    this.view.updateDisplay(showString);
  };

  window.Simon = window.Simon || {};
  window.Simon.Controller = Controller;
})(window);
