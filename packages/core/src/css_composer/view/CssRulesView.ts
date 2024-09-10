import { bindAll } from 'underscore';

import { View } from '../../common';
import { createEl } from '../../utils/dom';
import CssRuleView from './CssRuleView';
import CssGroupRuleView from './CssGroupRuleView';
import EditorModel from '../../editor/model/Editor';
import CssRule from '../model/CssRule';

const getBlockId = (pfx: string, order?: string | number) => `${pfx}${order ? `-${parseFloat(order as string)}` : ''}`;

export default class CssRulesView extends View {
  atRules: Record<string, any>;
  config: Record<string, any>;
  em: EditorModel;
  pfx: string;
  renderStarted?: boolean;

  constructor(o: any) {
    super(o);
    bindAll(this, 'sortRules');

    const config = o.config || {};
    this.atRules = {};
    this.config = config;
    this.em = config.em;
    this.pfx = config.stylePrefix || '';
    this.className = this.pfx + 'rules';
    const coll = this.collection;
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset', this.render);
  }

  /**
   * Add to collection
   * @param {Object} model
   * @private
   * */
  addTo(model: CssRule) {
    this.addToCollection(model);
  }

  /**
   * Add new object to collection
   * @param {Object} model
   * @param {Object} fragmentEl
   * @return {Object}
   * @private
   * */
  addToCollection(model: CssRule, fragmentEl?: DocumentFragment) {
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
        styleEl.appendChild(document.createTextNode('}'));
        this.atRules[atRule] = atRuleEl;
        rendered = styleEl;
      }

      view = new CssGroupRuleView(opts);
      atRuleEl.appendData(view.render().el.textContent);
    } else {
      view = new CssRuleView(opts);
      rendered = view.render().el;
    }

    const clsName = this.className!;
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

      contRules?.appendChild(rendered);
    }

    return rendered;
  }

  getMediaWidth(mediaText: string) {
    return mediaText && mediaText.replace(`(${this.em.getConfig().mediaCondition}: `, '').replace(')', '');
  }

  sortRules(a: number, b: number) {
    const { em } = this;
    const isMobFirst = (em.getConfig().mediaCondition || '').indexOf('min-width') !== -1;

    if (!isMobFirst) return 0;

    const left = isMobFirst ? a : b;
    const right = isMobFirst ? b : a;

    return left - right;
  }

  render() {
    this.renderStarted = true;
    this.atRules = {};
    const { em, $el, collection } = this;
    const cls = this.className!;
    const frag = document.createDocumentFragment();
    $el.empty();

    // Create devices related DOM structure, ensure also to have a default container
    const prs = em.Devices.getAll().pluck('priority').sort(this.sortRules) as number[];
    prs.every((pr) => pr) && prs.unshift(0);
    prs.forEach((pr) => frag.appendChild(createEl('div', { id: getBlockId(cls, pr) })));

    collection.each((model) => this.addToCollection(model, frag));
    $el.append(frag);
    $el.attr('class', cls);
    return this;
  }
}
