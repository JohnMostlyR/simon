/**
 * Created by Johan on 24-5-2017.
 */
(function (window) {
  'use strict';

  function Simon() {
    this.model = new window.Simon.Model();
    this.view = new window.Simon.View();
    this.controller = new window.Simon.Controller(this.model, this.view);
  }

  const newSimon = new Simon();
})(window);
