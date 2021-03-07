import Backbone from 'backbone';
import Device from './Device';

export default Backbone.Collection.extend({
  model: Device,

  comparator: (left, right) => {
    const rightP = right.get('priority');
    const leftP = left.get('priority');
    const rightC = right.get('mediaCondition');
    const leftC = left.get('mediaCondition');

    if (!leftC || !rightC) {
      return leftC == rightC || !rightC ? 1 : -1;
    }

    if (leftC == rightC) {
      return (rightP - leftP) * (leftC == 'max-width' ? 1 : -1);
    }

    return rightC == 'max-width' ? -1 : 1;
  },

  getSorted() {
    return this.sort();
  }
});
