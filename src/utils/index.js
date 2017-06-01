module.exports = () => {

  var Sorter = require('./Sorter');

  var Resizer = require('./Resizer');

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
    init() {
      return this;
    },

    Sorter,

    Resizer,
  };
};
