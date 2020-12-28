import { View, Model } from 'backbone';
import { isString, flatten } from 'underscore';
import { h, text, patch } from './vdom';

export default View.extend({
  __h: h,
  __text: text,
  __patch: patch,
  render: 0,

  initialize({ tag, props = {}, children = [] }) {
    console.log('INIT', { tag, props, children });
    this.model = new Model({
      ...(this.props || {}),
      ...props
    });
    this.tag = tag;
    this.children = flatten(children, 1);
    this.listenTo(this.model, 'change', this.__create);
    this.init && this.init();
  },

  __rndrProps() {
    return {
      props: this.get(),
      set: p => this.set(p)
    };
  },

  __createVDom() {
    const rendered =
      this.render && this.render(this.__rndrProps()).__createVDom();
    this._vdom =
      rendered ||
      this.__h(
        this.tag,
        this.get(),
        this.children.map(chl =>
          isString(chl) ? this.__text(chl) : chl.__createVDom()
        )
      );
    return this._vdom;
  },

  __getRoot() {
    const { el, _el, _vdom } = this;
    const dom = _vdom && _vdom.dom;

    if (!dom && !_el && !el.firstChild) {
      el.appendChild(document.createElement('div'));
    }

    return dom || _el || el.firstChild;
  },

  __create(model) {
    const prev = model.previousAttributes();
    this.__chn = {
      ...(this.__chn || {}),
      ...model.changed
    };
    this.__prev = {
      ...Object.keys(this.__chn).reduce((o, i) => ((o[i] = prev[i]), o), {}),
      ...(this.__prev || {})
    };
    this.__tmo && clearTimeout(this.__tmo);
    this.__tmo = setTimeout(() => {
      const { __chn, __prev } = this;
      this.trigger('change', __chn, __prev);
      Object.keys(__chn).forEach(i =>
        this.trigger(`change:${i}`, __chn[i], __prev[i])
      );
      this.__chn = {};
      this.__prev = {};
      this.create();
    });
  },

  get(prop) {
    const attrs = this.model.attributes;
    return prop ? attrs[prop] : attrs;
  },

  set(props) {
    return this.model.set(props);
  },

  create() {
    const root = this.__getRoot();
    console.log('CREATE prepatch for', this.tag, {
      _el: this._el,
      _dom: this._vdom && this._vdom.dom
    });
    const vdom = this.__createVDom();
    this.__patch(root, vdom);
    this._el = vdom.dom;
    console.log('CREATE Patch', {
      innerHTML: this.__getRoot().outerHTML,
      vdomDOM: vdom.dom
    });
    return this.__getRoot();
  }
});
