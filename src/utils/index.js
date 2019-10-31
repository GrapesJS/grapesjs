import Dragger from './Dragger';
import Sorter from './Sorter';
import Resizer from './Resizer';
import Localization from './Localization';

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

    Sorter,
    Resizer,
    Dragger,
    Localization
  };
};
