import { isString, isElement } from 'underscore';
import { createId, deepMerge, isDef } from 'utils/mixins';

export default class ModuleLegacy {
  getConfig(name) {
    return this.__getConfig(name);
  }

  getProjectData(data) {
    const obj = {};
    const key = this.storageKey;
    if (key) {
      obj[key] = data || this.getAll();
    }
    return obj;
  }

  loadProjectData(data = {}, { all, onResult, reset } = {}) {
    const key = this.storageKey;
    const opts = { action: 'load' };
    const coll = all || this.getAll();
    let result = data[key];

    if (typeof result == 'string') {
      try {
        result = JSON.parse(result);
      } catch (err) {
        this.__logWarn('Data parsing failed', { input: result });
      }
    }

    reset && result && coll.reset(null, opts);

    if (onResult) {
      result && onResult(result, opts);
    } else if (result && isDef(result.length)) {
      coll.reset(result, opts);
    }

    return result;
  }

  clear(opts = {}) {
    const { all } = this;
    all && all.reset(null, opts);
    return this;
  }

  __getConfig(name) {
    const res = this.config || {};
    return name ? res[name] : res;
  }

  getAll(opts = {}) {
    return this.all ? (opts.array ? [...this.all.models] : this.all) : [];
  }

  getAllMap() {
    return this.getAll().reduce((acc, i) => {
      acc[i.get(i.idAttribute)] = i;
      return acc;
    }, {});
  }

  __initConfig(def = {}, conf = {}) {
    this.config = deepMerge(def, conf);
    this.em = this.config.em;
    this.cls = [];
  }

  __initListen(opts = {}) {
    const { all, em, events } = this;
    all &&
      em &&
      all
        .on('add', (m, c, o) => em.trigger(events.add, m, o))
        .on('remove', (m, c, o) => em.trigger(events.remove, m, o))
        .on('change', (p, c) => em.trigger(events.update, p, p.changedAttributes(), c))
        .on('all', this.__catchAllEvent, this);
    // Register collections
    this.cls = [all].concat(opts.collections || []);
    // Propagate events
    (opts.propagate || []).forEach(({ entity, event }) => {
      entity.on('all', (ev, model, coll, opts) => {
        const options = opts || coll;
        const opt = { event: ev, ...options };
        [em, all].map(md => md.trigger(event, model, opt));
      });
    });
  }

  __remove(model, opts = {}) {
    const { em } = this;
    const md = isString(model) ? this.get(model) : model;
    const rm = () => {
      md && this.all.remove(md, opts);
      return md;
    };
    !opts.silent && em && em.trigger(this.events.removeBefore, md, rm, opts);
    return !opts.abort && rm();
  }

  __catchAllEvent(event, model, coll, opts) {
    const { em, events } = this;
    const options = opts || coll;
    em && events.all && em.trigger(events.all, { event, model, options });
    this.__onAllEvent();
  }

  __appendTo() {
    const elTo = this.getConfig().appendTo;

    if (elTo) {
      const el = isElement(elTo) ? elTo : document.querySelector(elTo);
      if (!el) return this.__logWarn('"appendTo" element not found');
      el.appendChild(this.render());
    }
  }

  __onAllEvent() {}

  __logWarn(str, opts) {
    this.em.logWarning(`[${this.name}]: ${str}`, opts);
  }

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

  __listenAdd(model, event) {
    model.on('add', (m, c, o) => this.em.trigger(event, m, o));
  }

  __listenRemove(model, event) {
    model.on('remove', (m, c, o) => this.em.trigger(event, m, o));
  }

  __listenUpdate(model, event) {
    model.on('change', (p, c) => this.em.trigger(event, p, p.changedAttributes(), c));
  }

  __destroy() {
    this.cls.forEach(coll => {
      coll.stopListening();
      coll.reset();
    });
    this.em = 0;
    this.config = 0;
    this.view?.remove();
    this.view = 0;
  }
}
