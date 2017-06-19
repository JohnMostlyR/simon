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
    this.powerOn = {
      value: false,
      validValues: [true, false],
    };

    this.gameStarted = {
      value: false,
      validValues: [true, false],
    };

    this.strict = {
      value: false,
      validValues: [true, false],
    };

    this.count = {
      value: 0,
    };
  }

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

    if (newValue !== this[property].value) {
      this[property].value = newValue;
      window.pubsubz.publish(`on${property.substr(0, 1).toUpperCase()}${property.substr(1)}`, newValue);
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
