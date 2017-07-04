window.simonEvents = (function (window) {
  function normalize(event) {
    if (event.target && event.target.id) {
      const normalizedId = event.target.id.toLowerCase();

      if (normalizedId.substr(0, 9) !== 'js-simon-') {
        return;
      }

      event.stopPropagation();

      const normalizedIdPart = normalizedId.substring(9); // Remove namespace: js-simon-

      if (normalizedIdPart.substr(-3, 3) === 'btn') {
        event.preventDefault();
        return window.parseInt(normalizedIdPart.substring(0, normalizedIdPart.length - 4), 10);
      }
    }
  }

  window.addEventListener('mousedown', (ev) => {
    const normalized = normalize(ev);

    if (normalized) {
      window.pubsubz.publish('onLensPress', normalized);
    }
  });

  window.addEventListener('mouseup', (ev) => {
    const normalized = normalize(ev);

    if (normalized) {
      window.pubsubz.publish('onLensRelease', normalized);
    }
  });
})(window);
