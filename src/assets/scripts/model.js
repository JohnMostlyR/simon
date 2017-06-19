/**
 * Created by Johan on 24-5-2017.
 */
(function (window) {
  'use strict';

  /**
   * Creates a new model
   * @constructor
   */
  function Model() {
    this.count = {
      value: 0,
      subscribers: [],
    };

    this.strict = {
      value: false,
      validValues: [true, false],
      subscribers: [],
    };
  }

  /**
   * @method subscribe
   * @description Registers new subscribers
   * @param {string} property - The string representation of the property to get notifications from
   * @param {Function} subscriber - Callback to the subscriber
   */
  Model.prototype.subscribe = function (property, subscriber) {
    if (this[property] && Array.isArray(this[property].subscribers) && typeof subscriber === 'function') {
      this[property].subscribers.push(subscriber);
    }
  };

  /**
   * @method setProperty
   * @description Updates or sets a given property with a given value
   * @param {string} property - The string representation of the property to update
   * @param {*} newValue - The value to update the property with
   */
  Model.prototype.setProperty = function (property, newValue) {
    if (!this[property] || typeof this[property] !== 'object') {
      console.error(`Property '${property}' does not exist`);
      return;
    }

    if (arguments.length !== 2) {
      console.error('Called with less than the required arguments');
      return;
    }

    if ('validValues' in this[property] && Array.isArray(this[property].validValues)) {
      if (this[property].validValues.indexOf(newValue) < 0) {
        console.error(`Value '${newValue}' is not a valid value for property '${property}'`);
        return;
      }
    }

    if ('subscribers' in this[property] && Array.isArray(this[property].subscribers)) {
      if (newValue !== this[property].value) {
        this[property].value = newValue;
        this[property].subscribers.forEach((subscriber) => {
          subscriber(this[property].value);
        });
      }
    } else {
      console.error(`You cannot subscribe to property: ${property}`);
      return;
    }
  };

  /**
   * @method getProperty
   * @param {string} property
   */
  Model.prototype.getProperty = function (property) {
    if (!this[property] || typeof this[property] !== 'object') {
      console.error(`Property '${property}' does not exist`);
      return;
    }

    return this[property].value;
  };

  window.Simon = window.Simon || {};
  window.Simon.Model = Model;
})(window);
