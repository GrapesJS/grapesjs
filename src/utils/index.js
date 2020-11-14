import Dragger from './Dragger';
import Sorter from './Sorter';
import Resizer from './Resizer';

export default () => {
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

    destroy() {},

    Sorter,
    Resizer,
    Dragger
  };
};
