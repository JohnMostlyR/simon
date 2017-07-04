(function (window) {
  'use strict';

  const document = window.document;

  // create a synth and connect it to the master output (your speakers)
  const synth = new window.Tone.Synth().toMaster();

  /**
   * Each index corresponds to the node of a lens, clockwise where the red lens is number one.
   * @type {[Node]}
   */
  const lensesNodes = [0];
  [1, 2, 3, 4].forEach((idx) => {
    const lensNode = document.getElementById(`js-simon-${idx}-btn`);
    lensNode.classList.remove('is-active');
    lensNode.classList.add('is-not-active');
    lensesNodes.push(lensNode);
  });

  /**
   * Each index corresponds to the frequency of the tone to play with the corresponding lens.
   * @type {[number]}
   */
  const notes = [0, 329.628, 195.998, 261.626, 391.995];

  const subscriptions = {};
  const timers = {};

  /**
   * Light up the lens and play a tone corresponding to the lens indicated by lensIndex.
   * @param {number} lensIndex
   */
  function activateLens(lensIndex) {

    // switch on the selected lens, if any.
    if (lensIndex && lensIndex < lensesNodes.length) {
      synth.triggerAttack(notes[lensIndex]);

      lensesNodes[lensIndex].classList.remove('is-not-active');
      lensesNodes[lensIndex].classList.add('is-active');
    }
  }

  /**
   * Turn off the lens and mute the playing tone corresponding to the lens indicated by lensIndex.
   * @param {number} lensIndex
   */
  function deactivateLens(lensIndex) {
    synth.triggerRelease();

    // switch off the selected lens, if any.
    if (lensIndex && lensIndex < lensesNodes.length) {

      lensesNodes[lensIndex].classList.remove('is-active');
      lensesNodes[lensIndex].classList.add('is-not-active');
    } else {
      lensesNodes.forEach((lensNode) => {
        if (lensNode) {
          lensNode.classList.remove('is-active');
          lensNode.classList.add('is-not-active');
        }
      });
    }
  }

  function disableLenses() {
    lensesNodes.forEach((lensNode) => {
      if (lensNode) {
        lensNode.setAttribute('disabled', true);
      }
    });
  }

  function enableLenses() {
    lensesNodes.forEach((lensNode) => {
      if (lensNode) {
        lensNode.removeAttribute('disabled');
      }
    });
  }

  /**
   * The 'razz' tune to play when the player has completed the game.
   */
  function playRazz() {
    const sequence = [1, 3, 2, 4, 1, 3, 2, 4, 1, 3, 2, 4];
    let idx = -1;

    timers.pauseTimerId = setTimeout(function play() {
      if (!window.Simon.model.getPowerState()) {
        Object.keys(timers).forEach((timer) => {
          clearTimeout(timers[timer]);
        });
        return;
      }

      const lensIndex = sequence[idx += 1];

      synth.triggerAttack(notes[lensIndex]);

      lensesNodes[lensIndex].classList.remove('is-not-active');
      lensesNodes[lensIndex].classList.add('is-active');

      timers.playTimerId = setTimeout(() => {
        synth.triggerRelease();
        lensesNodes[lensIndex].classList.remove('is-active');
        lensesNodes[lensIndex].classList.add('is-not-active');

        if (idx < sequence.length - 1) {
          timers.pauseTimerId = setTimeout(play, 100);
        } else {
          clearTimeout(timers.pauseTimerId);
          clearTimeout(timers.playTimerId);
          window.pubsubz.publish('onShowWinFinished', true);
        }
      }, 100);
    }, 100);
  }

  subscriptions.onPower = window.pubsubz.subscribe('onPower', (topic, power) => {
    if (power) {
      subscriptions.onSimonListens = window.pubsubz.subscribe('onSimonListens', (topic, listens) => {
        if (listens) {
          enableLenses();
        } else {
          disableLenses();
        }
      });

      subscriptions.onSimonSpeaks = window.pubsubz.subscribe('onSimonSpeaks', (topic, isSaying) => {
        activateLens(isSaying);
      });

      subscriptions.onSimonFinishedSpeaking = window.pubsubz.subscribe(
        'onSimonFinishedSpeaking',
        (topic, said) => {
          deactivateLens(said);
        }
      );

      subscriptions.onCorrectReply = window.pubsubz.subscribe('onCorrectReply', (topic, reply) => {
        activateLens(reply);
      });

      subscriptions.onLensRelease = window.pubsubz.subscribe('onLensRelease', (topic, lensPressedId) => {
        deactivateLens(lensPressedId);
      });

      subscriptions.onWin = window.pubsubz.subscribe('onWin', () => {
        playRazz();
      });
    } else {
      const keys = Object.keys(subscriptions);
      [...keys]
        .filter((key) => {
          return (key !== 'onPower');
        })
        .forEach((key) => {
          window.pubsubz.unsubscribe(subscriptions[key]);
        });

      deactivateLens();
    }
  });

  subscriptions.onStart = window.pubsubz.subscribe('onStart', (topic, start) => {
    if (!start) {
      deactivateLens();
    }
  });
})(window);
