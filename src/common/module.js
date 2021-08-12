import { createId } from 'utils/mixins';

export default {
  getConfig(name) {
    const res = this.config || {};
    return name ? res[name] : res;
  },

  getAll() {
    return this.all || [];
  },

  getAllMap() {
    return this.getAll().reduce((acc, i) => {
      acc[i.get('id')] = i;
      return acc;
    }, {});
  },

  __catchAllEvent(event, model, coll, opts) {
    const { em, events } = this;
    const options = opts || coll;
    em && events.all && em.trigger(events.all, { event, model, options });
  },

  _createId(len = 16) {
    const all = this.getAll();
    const ln = all.length + len;
    const allMap = this.getAllMap();
    let id;

    do {
      id = createId(ln);
    } while (allMap[id]);

    return id;
  }
};
