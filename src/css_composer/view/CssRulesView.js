import Backbone from 'backbone';
import CssRuleView from './CssRuleView';
import CssGroupRuleView from './CssGroupRuleView';

const $ = Backbone.$;

const getBlockId = (pfx, order) =>
  `${pfx}${order ? `-${parseFloat(order)}` : ''}`;

export default Backbone.View.extend({
  initialize(o) {
    const config = o.config || {};
    this.atRules = {};
    this.config = config;
    this.em = config.em;
    this.pfx = config.stylePrefix || '';
    this.className = this.pfx + 'rules';
    const coll = this.collection;
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset', this.render);
  },

  /**
   * Add to collection
   * @param {Object} model
   * @private
   * */
  addTo(model) {
    this.addToCollection(model);
  },

  /**
   * Add new object to collection
   * @param {Object} model
   * @param {Object} fragmentEl
   * @return {Object}
   * @private
   * */
  addToCollection(model, fragmentEl) {
    // If the render is not yet started
    if (!this.renderStarted) {
      return;
    }

    const fragment = fragmentEl || null;
    const { config } = this;
    const opts = { model, config };
    let rendered, view;

    // I have to render keyframes of the same name together
    // Unfortunately at the moment I didn't find the way of appending them
    // if not staticly, via appendData
    if (model.get('atRuleType') === 'keyframes') {
      const atRule = model.getAtRule();
      let atRuleEl = this.atRules[atRule];

      if (!atRuleEl) {
        const styleEl = document.createElement('style');
        atRuleEl = document.createTextNode('');
        styleEl.appendChild(document.createTextNode(`${atRule}{`));
        styleEl.appendChild(atRuleEl);
        styleEl.appendChild(document.createTextNode(`}`));
        this.atRules[atRule] = atRuleEl;
        rendered = styleEl;
      }

      view = new CssGroupRuleView(opts);
      atRuleEl.appendData(view.render().el.textContent);
    } else {
      view = new CssRuleView(opts);
      rendered = view.render().el;
    }

    const clsName = this.className;
    const mediaText = model.get('mediaText');
    const defaultBlockId = getBlockId(clsName);
    let blockId = defaultBlockId;

    // If the rule contains a media query it might have a different container
    // for it (eg. rules created with Device Manager)
    if (mediaText) {
      blockId = getBlockId(clsName, this.getMediaWidth(mediaText));
    }

    if (rendered) {
      const container = fragment || this.el;
      let contRules;

      // Try to find a specific container for the rule (if it
      // containes a media query), otherwise get the default one
      try {
        contRules = container.querySelector(`#${blockId}`);
      } catch (e) {}

      if (!contRules) {
        contRules = container.querySelector(`#${defaultBlockId}`);
      }

      contRules.appendChild(rendered);
    }

    return rendered;
  },

  getMediaWidth(mediaText) {
    return (
      mediaText &&
      mediaText
        .replace(`(${this.em.getConfig('mediaCondition')}: `, '')
        .replace(')', '')
    );
  },

  render() {
    this.renderStarted = 1;
    this.atRules = {};
    const { em, $el, className, collection } = this;
    const frag = document.createDocumentFragment();
    $el.empty();

    // Create devices related DOM structure, ensure also to have a default container
    const prs = em
      .get('DeviceManager')
      .getAll()
      .pluck('priority');
    prs.every(pr => pr) && prs.unshift(0);
    prs.forEach(pr =>
      $(`<div id="${getBlockId(className, pr)}"></div>`).appendTo(frag)
    );

    collection.each(model => this.addToCollection(model, frag));
    $el.append(frag);
    $el.attr('class', className);
    return this;
  }
});
