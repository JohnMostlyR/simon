/**
 * Created by Johan on 24-5-2017.
 */
(function (window) {
  'use strict';

  function Controller(model, view) {
    this.model = model;
    this.view = view;
    this.game = null;
    this.powerOn = false;
    this.gameStarted = false;
    this.userSequence = [];
    this.allowUserInput = false;

    this.view.subscribe('onFormChange', (id, value) => {
      console.info(`changed element id: ${id}, value: ${value}`);

      switch (id) {
        case 'power':
          this.handlePowerButton(value);
          break;
        case 'start':
          if (this.powerOn && !this.gameStarted) {
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

    this.view.subscribe('onMouseDown', (id) => {
      if (this.allowUserInput) {
        this.handleButtonPress(id);
      }
    });

    this.view.subscribe('onMouseUp', (id) => {
      if (this.allowUserInput) {
        this.userSequence.push(id);
        this.handleButtonRelease(id);
      }
    });

    // this.view.subscribe('onInput', (id) => {
    //   console.info(`pressed: ${id}`);
    // });
  }

  Controller.prototype.handlePowerButton = function (power) {
    console.info(`power up: ${power}`);

    if (power) {
      this.powerOn = true;
      this.view.showPowerOn();
    } else {
      this.powerOn = false;

      if (this.gameStarted) {
        this.game.stop();
        this.game = null;
        this.gameStarted = false;
      }

      this.view.showPowerOff();
    }
  };

  Controller.prototype.handleStartButton = function () {
    console.info('Starting');

    // reset
    this.userSequence = [];
    this.allowUserInput = false;
    this.gameStarted = false;
    this.model.setProperty('count', 0);

    // start new game
    this.game = new window.Simon.Game(this);
    this.game.start();
    this.gameStarted = true;
  };

  Controller.prototype.handleStrictMode = function (strict) {
    console.info(`Strict mode: ${strict}`);

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
