/*!
 * Pub/Sub implementation
 * http://addyosmani.com/
 * Licensed under the GPL
 * http://jsfiddle.net/LxPrq/
 */
(function (window) {
  'use strict';

  const topics = {};
  const pubsubz = {};
  let subUid = -1;

  pubsubz.publish = function (topic, args) {
    // console.info(`Publish topic ${topic} with args: ${JSON.stringify(args)}`);

    if (!topics[topic]) {
      return false;
    }


    // Place on a queue and schedule to run at the next opportunity; not immediately.
    // @link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout#Late_timeouts
    setTimeout(() => {
      topics[topic].forEach((subscriber) => {
        subscriber.func(topic, args);
      });
    }, 0);

    return true;
  };

  pubsubz.subscribe = function (topic, func) {
    if (!topics[topic]) {
      topics[topic] = [];
    }

    const token = (++subUid).toString();

    topics[topic].push({
      token,
      func,
    });

    return token;
  };

  pubsubz.unsubscribe = function (token) {
    Object.keys(topics).forEach((topic) => {
      if (Array.isArray(topics[topic])) {
        [].concat(topics[topic]).forEach((subscriber, idx) => {
          if (subscriber.token === token) {
            topics[topic].splice(idx, 1);
            return token;
          }
        });
      }
    });

    return false;
  };

  const getPubSubz = function () {
    return pubsubz;
  };

  window.pubsubz = getPubSubz();
})(window);
