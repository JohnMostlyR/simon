/**
 * Created by Johan on 24-5-2017.
 */
(function (window) {
  'use strict';

  const document = window.document;

  function View() {
    this.formNode = document.getElementById('js-simon-form');
    this.buttonNodes = [0];
    [1, 2, 3, 4].forEach((idx) => {
      const buttonNode = document.getElementById(`js-simon-${idx}-btn`);
      buttonNode.classList.remove('is-active');
      buttonNode.classList.add('is-not-active');
      this.buttonNodes.push(buttonNode);
    });

    this.audioNodes = [0];
    [1, 2, 3, 4].forEach((idx) => {
      const audioNode = document.getElementById(`js-simon-sound-${idx}`);
      audioNode.pause();
      audioNode.currentTime = 0;
      this.audioNodes.push(audioNode);
    });
  }

  View.prototype.showPowerOn = function () {
    const startButton = document.getElementById('js-simon-start');
    const strictButton = document.getElementById('js-simon-strict');
    startButton.removeAttribute('disabled');
    strictButton.removeAttribute('disabled');
  };

  View.prototype.showPowerOff = function () {
    this.formNode.reset();
    const startButton = document.getElementById('js-simon-start');
    const strictButton = document.getElementById('js-simon-strict');
    startButton.setAttribute('disabled', 'disabled');
    strictButton.setAttribute('disabled', 'disabled');
  };

  View.prototype.showStart = function () {
    //
  };

  View.prototype.showStrict = function () {

  };

  View.prototype.startSpeaking = function (button) {

    // switch on the selected button, if any.
    if (button && button < this.buttonNodes.length) {
      const audioNode = this.audioNodes[button];
      audioNode.play();

      const btnNode = this.buttonNodes[button];
      btnNode.classList.remove('is-not-active');
      btnNode.classList.add('is-active');
    }
  };

  View.prototype.stopSpeaking = function (button) {

    // switch off the selected button, if any.
    if (button && button < this.buttonNodes.length) {
      const audioNode = this.audioNodes[button];
      audioNode.pause();
      audioNode.currentTime = 0;

      const btnNode = this.buttonNodes[button];
      btnNode.classList.remove('is-active');
      btnNode.classList.add('is-not-active');
    }
  };

  View.prototype.updateDisplay = function (show) {
    if (show) {
      const firstDigit = show.substr(0, 1) || '0';
      const secondDigit = show.substr(1, 1) || '0';

      const firstDigitNode = document.getElementById('js-display-digit-one');
      firstDigitNode.innerHTML = firstDigit;

      const secondDigitNode = document.getElementById('js-display-digit-two');
      secondDigitNode.innerHTML = secondDigit;
    }
  };

  View.prototype.showError = function (msg) {
    //
  };

  View.prototype.showWin = function () {
    //
  };

  View.prototype.subscribe = function (event, subscriber) {
    switch (event) {
      case 'onFormChange':
        this.formNode.addEventListener('change', ev => {
          if (ev.target && ev.target.id) {
            const normalizedId = ev.target.id.toLowerCase();

            if (normalizedId.substr(0, 9) !== 'js-simon-') {
              return;
            }

            ev.stopPropagation();

            const normalizedIdPart = normalizedId.substring(9); // Remove namespace: js-simon-
            subscriber(normalizedIdPart, ev.target.checked);
          }
        }, false);
        break;
      case 'onMouseDown':
        window.addEventListener('mousedown', (ev) => {
          if (ev.target && ev.target.id) {
            const normalizedId = ev.target.id.toLowerCase();

            if (normalizedId.substr(0, 9) !== 'js-simon-') {
              return;
            }

            ev.stopPropagation();

            const normalizedIdPart = normalizedId.substring(9); // Remove namespace: js-simon-

            if (normalizedIdPart.substr(-3, 3) === 'btn') {
              ev.preventDefault();
              subscriber(window.parseInt(normalizedIdPart.substring(0, normalizedIdPart.length - 4)), 10);
            }
          }
        }, false);
        break;
      case 'onMouseUp':
        window.addEventListener('mouseup', (ev) => {
          if (ev.target && ev.target.id) {
            const normalizedId = ev.target.id.toLowerCase();

            if (normalizedId.substr(0, 9) !== 'js-simon-') {
              return;
            }

            ev.stopPropagation();

            const normalizedIdPart = normalizedId.substring(9); // Remove namespace: js-simon-

            if (normalizedIdPart.substr(-3, 3) === 'btn') {
              ev.preventDefault();
              subscriber(window.parseInt(normalizedIdPart.substring(0, normalizedIdPart.length - 4)), 10);
            }
          }
        }, false);
        break;
      default:
        console.error(`No such event: ${event}`);
        break;
    }
  };

  window.Simon = window.Simon || {};
  window.Simon.View = View;
})(window);
