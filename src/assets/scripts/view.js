/**
 * Created by Johan on 24-5-2017.
 */
(function (window) {
  'use strict';

  const document = window.document;

  // create a synth and connect it to the master output (your speakers)
  const synth = new window.Tone.Synth().toMaster();

  function View() {
    this.formNode = document.querySelector('#js-simon-form');
    this.formNode.addEventListener('change', ev => {
      if (ev.target && ev.target.id) {
        const normalizedId = ev.target.id.toLowerCase();

        if (normalizedId.substr(0, 9) !== 'js-simon-') {
          return;
        }

        ev.stopPropagation();

        const normalizedIdPart = normalizedId.substring(9); // Remove namespace: js-simon-
        const parameters = {
          id: normalizedIdPart,
          value: ev.target.checked,
        };
        window.pubsubz.publish('onFormChange', parameters);
      }
    });

    this.startButton = this.formNode.querySelector('#js-simon-start');
    this.strictButton = this.formNode.querySelector('#js-simon-strict');

    this.buttonNodes = [0];
    [1, 2, 3, 4].forEach((idx) => {
      const buttonNode = document.getElementById(`js-simon-${idx}-btn`);
      buttonNode.classList.remove('is-active');
      buttonNode.classList.add('is-not-active');
      this.buttonNodes.push(buttonNode);
    });

    // this.notes = [0, 220, 164.814, 138.591, 82.407];
    // this.notes = [0, 311.127, 207.652, 247.942, 415.305];
    this.notes = [0, 329.628, 195.998, 261.626, 391.995];
    this.timers = {};
    this.subscriptions = {};

    this.subscriptions.onPowerSubscription = window.pubsubz.subscribe('onPowerOn', (topic, value) => {
      if (value) {
        this.showPowerOn();
      } else {
        this.showPowerOff();
      }
    });
  }

  View.prototype.showPowerOn = function () {
    this.startButton.removeAttribute('disabled');
    this.strictButton.removeAttribute('disabled');
  };

  View.prototype.showPowerOff = function () {
    synth.triggerRelease();
    Object.keys(this.timers).forEach((timer) => {
      clearTimeout(this.timers[timer]);
    });
    this.formNode.reset();
    this.startButton.setAttribute('disabled', 'disabled');
    this.strictButton.setAttribute('disabled', 'disabled');
  };

  View.prototype.showStart = function () {
    //
  };

  View.prototype.showStrict = function () {

  };

  View.prototype.startSpeaking = function (button) {

    // switch on the selected button, if any.
    if (button && button < this.buttonNodes.length) {
      synth.triggerAttack(this.notes[button]);

      const btnNode = this.buttonNodes[button];
      btnNode.classList.remove('is-not-active');
      btnNode.classList.add('is-active');
    }
  };

  View.prototype.stopSpeaking = function (button) {

    // switch off the selected button, if any.
    if (button && button < this.buttonNodes.length) {
      synth.triggerRelease();

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

  View.prototype.showIncorrect = function () {
    synth.triggerAttack(84);
    this.timers.showErrorTimer = setTimeout(() => {
      synth.triggerRelease();
      window.pubsubz.publish('onIncorrectShowed', true);
    }, 1500);
  };

  View.prototype.showWin = function (lastItem) {
    const self = this;
    const sequence = [1, 3, 2, 4, 1, 3, 2, 4, 1, 3, 2, 4];
    let idx = -1;

    self.timers.pauseTimerId = setTimeout(function play() {
      if (!document.querySelector('#js-simon-power').checked) {
        Object.keys(self.timers).forEach((timer) => {
          clearTimeout(self.timers[timer]);
        });
        return;
      }

      const button = sequence[idx += 1];
      synth.triggerAttack(self.notes[button]);
      const btnNode = self.buttonNodes[button];
      btnNode.classList.remove('is-not-active');
      btnNode.classList.add('is-active');

      self.timers.playTimerId = setTimeout(() => {
        synth.triggerRelease();
        btnNode.classList.remove('is-active');
        btnNode.classList.add('is-not-active');

        if (idx < sequence.length - 1) {
          self.timers.pauseTimerId = setTimeout(play, 100);
        } else {
          clearTimeout(self.timers.pauseTimerId);
          clearTimeout(self.timers.playTimerId);
          window.pubsubz.publish('onShowWinFinished', true);
        }
      }, 100);
    }, 100);
  };

  View.prototype.disableReplyButtons = function () {
    this.buttonNodes.forEach((buttonNode) => {
      if (buttonNode) {
        buttonNode.setAttribute('disabled', true);
      }
    });
  };

  View.prototype.enableReplyButtons = function () {
    this.buttonNodes.forEach((buttonNode) => {
      if (buttonNode) {
        buttonNode.removeAttribute('disabled');
      }
    });
  };

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
        window.pubsubz.publish(
          'onLensPress',
          window.parseInt(normalizedIdPart.substring(0, normalizedIdPart.length - 4), 10)
        );
      }
    }
  }, false);

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
        window.pubsubz.publish(
          'onLensRelease',
          window.parseInt(normalizedIdPart.substring(0, normalizedIdPart.length - 4), 10)
        );
      }
    }
  }, false);

  window.Simon = window.Simon || {};
  window.Simon.View = View;
})(window);
