/**
 * Created by Johan on 24-5-2017.
 */
(function (window) {
  'use strict';

  function Controller(model, view) {
    this.model = model;
    this.view = view;
    this.game = null;
    this.busy = true;

    this.onFormChangeSubscription = window.pubsubz.subscribe('onFormChange', (topic, data) => {
      console.info('changed element: ', data);
      const id = data[0];
      const value = data[1];

      switch (id) {
        case 'power':
          this.handlePowerButton(value);
          break;
        case 'start':
          if (this.model.getProperty('powerOn') && !this.model.getProperty('gameStarted')) {
            this.handleStartButton();
          }
          break;
        case 'strict':
          this.handleStrictMode(value);
          break;
        default:
          break;
      }
    });

    this.onLensPressSubscription = window.pubsubz.subscribe('onLensPress', (topic, id) => {
      console.info(`busy: ${this.busy}`);
      if (!this.busy) {
        this.handleButtonPress(id);
      }
    });

    this.onLensReleaseSubscription = window.pubsubz.subscribe('onLensRelease', (topic, id) => {
      if (!this.busy) {
        this.handleButtonRelease(id);
      }
    });

    this.onCountSubscription = window.pubsubz.subscribe('onCount', (topic, data) => {
      this.showCount(data);
    });

    this.onBusySubscription = window.pubsubz.subscribe('onBusy', (topic, busy) => {
      if (busy) {
        this.view.disableReplyButtons();
        this.busy = true;
      } else {
        this.view.enableReplyButtons();
        this.busy = false;
      }
    });
  }

  Controller.prototype.handlePowerButton = function (power) {
    console.info(`power up: ${power}`);

    if (this.model.getProperty('powerOn')) {
      this.model.setProperty('powerOn', false);

      if (this.model.getProperty('gameStarted')) {
        this.game.stop();
        this.game = null;
        this.model.setProperty('gameStarted', false);
      }

      this.view.showPowerOff();
    } else {
      this.model.setProperty('powerOn', true);
      this.view.showPowerOn();
    }
  };

  Controller.prototype.handleStartButton = function () {
    console.info('Starting');

    // reset
    this.model.setProperty('gameStarted', false);
    this.model.setProperty('count', 0);

    // start new game
    this.game = new window.Simon.Game(this);
    this.game.start();
    this.model.setProperty('gameStarted', true);
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
