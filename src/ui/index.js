import { bindAll } from 'underscore';
import Base from './elements/Base';
import InputField from './elements/InputField';

const buildIn = {
  InputField
};

export default () => ({
  name: 'UI',

  init(opts = {}) {
    this.els = {};
    this.em = opts.em;
    bindAll(this, 'el');
    Object.keys(buildIn).forEach(name => {
      this.add(name, buildIn[name]({ el: this.el }));
    });
    return this;
  },

  destroy() {
    ['em', 'els'].forEach(i => (this[i] = {}));
  },

  add(name, definition) {
    this.els[name] = Base.extend(definition);
  },

  get(name) {
    return this.els[name];
  },

  el(tag, props, ...children) {
    const Element = this.get(tag) || Base;
    return new Element({ tag, props, children });
  }
});

/*
let { el } = editor.UI;
let appEl = document.getElementById('app');
let inpEl = el('InputField', { myLabel: 'Hello2' });
inpEl.on('change', (next, prev) => console.log('Changed InputField', { next, prev }))
inpEl.on('change:value', (next, prev) => console.log('Changed InputField value', { next, prev }))
let mainEl = el('main', {}, [
    el('h1', {}, 'My text h1'),
    el('p', {}, 'My text p'),
    inpEl,
])
appEl.appendChild(mainEl.create())
*/
