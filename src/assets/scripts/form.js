/**
 * Created by Johan on 28-6-2017.
 */
window.Simon = window.Simon || {};

window.Simon.form = (function (window) {
  'use strict';

  // PRIVATE
  const document = window.document;

  const formNode = document.querySelector('#js-simon-form');
  const powerButton = formNode.querySelector('#js-simon-power');
  const startButton = formNode.querySelector('#js-simon-start');
  const strictButton = formNode.querySelector('#js-simon-strict');

  formNode.addEventListener('change', (ev) => {
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

      // window.pubsubz.publish('onFormChange', parameters);

      switch (parameters.id) {
        case 'power':
          if (parameters.value) {
            startButton.removeAttribute('disabled');
            strictButton.removeAttribute('disabled');
          } else {
            formNode.reset();
            startButton.setAttribute('disabled', true);
            strictButton.setAttribute('disabled', true);
          }
          window.pubsubz.publish('onPower', parameters.value);
          break;
        case 'start':
          window.pubsubz.publish('onStart', parameters.value);
          break;
        case 'strict':
          window.pubsubz.publish('onStrict', parameters.value);
          break;
        default:
          break;
      }
    }
  });

  // PUBLIC
  return {
    getPowerButtonValue() {
      return powerButton.checked;
    },
    getStartButtonValue() {
      return startButton.checked;
    },
    getStrictButtonValue() {
      return strictButton.checked;
    },
  };
})(window);
