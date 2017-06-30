/**
 * Created by Johan on 24-5-2017.
 */
window.Simon = window.Simon || {};

window.Simon.view = (function (window) {
  'use strict';

  // create a synth and connect it to the master output (your speakers)
  const synth = new window.Tone.Synth().toMaster();
  const timers = {};
  const subscriptions = {};

  function showIncorrect() {
    synth.triggerAttack(84);
    timers.showErrorTimer = setTimeout(() => {
      synth.triggerRelease();
      window.pubsubz.publish('onIncorrectShowed', true);
    }, 1500);
  }

  subscriptions.onIncorrectReplySubscription = window.pubsubz.subscribe('onIncorrectReply', () => {
    showIncorrect();
  });
})(window);
