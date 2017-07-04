window.simonView = (function (window) {
  'use strict';

  // create a synth and connect it to the master output (your speakers)
  const synth = new window.Tone.Synth().toMaster();
  const timers = {};
  const toneLength = 1500; // milliseconds
  const subscriptions = {};

  function showIncorrect() {
    synth.triggerAttack(84);
    timers.showErrorTimer = setTimeout(() => {
      synth.triggerRelease();
      window.pubsubz.publish('onIncorrectShowed', true);
    }, toneLength);
  }

  subscriptions.onIncorrectReplySubscription = window.pubsubz.subscribe('onIncorrectReply', () => {
    showIncorrect();
  });
})(window);
