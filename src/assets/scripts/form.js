window.simonForm = (function (window) {
  'use strict';

  // PRIVATE
  const document = window.document;

  const formNode = document.querySelector('#js-simon-form');
  const powerButtonNode = formNode.querySelector('#js-simon-power');
  const startButtonNode = formNode.querySelector('#js-simon-start');
  const strictButtonNode = formNode.querySelector('#js-simon-strict');

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
            startButtonNode.removeAttribute('disabled');
            strictButtonNode.removeAttribute('disabled');
          } else {
            formNode.reset();
            startButtonNode.setAttribute('disabled', true);
            strictButtonNode.setAttribute('disabled', true);
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
      return powerButtonNode.checked;
    },
    getStartButtonValue() {
      return startButtonNode.checked;
    },
    getStrictButtonValue() {
      return strictButtonNode.checked;
    },
  };
})(window);
