module.exports = () => {

  const Sorter = require('./Sorter');
  const Resizer = require('./Resizer');
  const Dragger = require('./Dragger');

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
    Dragger,
  };
};
