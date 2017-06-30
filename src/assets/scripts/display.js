(function (window) {
  'use strict';

  const document = window.document;

  const firstDigitNode = document.getElementById('js-display-digit-one');
  const secondDigitNode = document.getElementById('js-display-digit-two');
  const display = {};
  const subscriptions = {};

  /**
   * @function update
   * @description Update display with a new value
   * @param count {number}
   */
  display.update = function (count = 0) {
    let showString = String(count);
    if (showString.length === 1) {
      showString = `0${showString}`;
    }

    firstDigitNode.innerHTML = showString.substr(0, 1) || '0';
    secondDigitNode.innerHTML = showString.substr(1, 1) || '0';
  };

  display.blink = function () {
    let blinkTimes = 2;
    let isOn = true;
    let blinkTimerId = setTimeout(function doBlink() {
      blinkTimes -= 1;

      if (isOn) {
        firstDigitNode.classList.remove('is-active');
        secondDigitNode.classList.remove('is-active');
      } else {
        firstDigitNode.classList.add('is-active');
        secondDigitNode.classList.add('is-active');
      }

      if (blinkTimes) {
        isOn = !isOn;
        blinkTimerId = setTimeout(doBlink, 500);
      }
    }, 500);
  };

  display.turnOn = function (reset = false) {
    firstDigitNode.innerHTML = '\u2013';
    secondDigitNode.innerHTML = '\u2013';
    firstDigitNode.classList.add('is-active');
    secondDigitNode.classList.add('is-active');
    display.blink();

    if (!reset) {
      subscriptions.onStart = window.pubsubz.subscribe('onStart', (topic, start) => {
        if (!start) {
          display.turnOn(true);
        }
      });

      subscriptions.onAdvance = window.pubsubz.subscribe('onAdvance', (topic, count) => {
        display.update(count);
      });
    }
  };

  display.turnOff = function () {
    firstDigitNode.classList.remove('is-active');
    secondDigitNode.classList.remove('is-active');
    firstDigitNode.innerHTML = '8';
    secondDigitNode.innerHTML = '8';

    window.pubsubz.unsubscribe(subscriptions.onAdvance);
    window.pubsubz.unsubscribe(subscriptions.onStart);
  };

  subscriptions.onPower = window.pubsubz.subscribe('onPower', (topic, power) => {
    if (power) {
      display.turnOn();
    } else {
      display.turnOff();
    }
  });
})(window);
