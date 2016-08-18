define(function(require) {

  var Utils = function(){

    var Sorter = require('./Sorter');

    return {
      /**
       * Name of the module
       * @type {String}
       * @private
       */
      name: 'Utils',

      /**
       * Initialize module
       */
      init: function() {
        return this;
      },

      Sorter: Sorter,
    };
  };

  return Utils;
});