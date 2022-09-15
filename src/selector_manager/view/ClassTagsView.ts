import { isEmpty, isArray, isString, debounce } from 'underscore';
import { View } from '../../common';
import ClassTagView from './ClassTagView';
import html from '../../utils/html';
import EditorModel from '../../editor/model/Editor';
import SelectorManager from '..';
import State from '../model/State';
import Component from '../../dom_components/model/Component';
import Selector from '../model/Selector';
import Selectors from '../model/Selectors';

export default class ClassTagsView extends View<Selector> {
  template({ labelInfo, labelHead, iconSync, iconAdd, pfx, ppfx }: any) {
    return html` <div id="${pfx}up" class="${pfx}header">
        <div id="${pfx}label" class="${pfx}header-label">${labelHead}</div>
        <div id="${pfx}status-c" class="${pfx}header-status">
          <span id="${pfx}input-c" data-states-c>
            <div class="${ppfx}field ${ppfx}select">
              <span id="${ppfx}input-holder">
                <select id="${pfx}states" data-states></select>
              </span>
              <div class="${ppfx}sel-arrow">
                <div class="${ppfx}d-s-arrow"></div>
              </div>
            </div>
          </span>
        </div>
      </div>
      <div id="${pfx}tags-field" class="${ppfx}field">
        <div id="${pfx}tags-c" data-selectors></div>
        <input id="${pfx}new" data-input />
        <span id="${pfx}add-tag" class="${pfx}tags-btn ${pfx}tags-btn__add" data-add> $${iconAdd} </span>
        <span class="${pfx}tags-btn ${pfx}tags-btn__sync" style="display: none" data-sync-style> $${iconSync} </span>
      </div>
      <div class="${pfx}sels-info">
        <div class="${pfx}label-sel">${labelInfo}:</div>
        <div class="${pfx}sels" data-selected></div>
      </div>`;
  }

  events() {
    return {
      'change [data-states]': 'stateChanged',
      'click [data-add]': 'startNewTag',
      'focusout [data-input]': 'endNewTag',
      'keyup [data-input]': 'onInputKeyUp',
      'click [data-sync-style]': 'syncStyle',
    };
  }

  $input?: JQuery<HTMLElement>;
  $addBtn?: JQuery<HTMLElement>;
  $classes?: JQuery<HTMLElement>;
  $btnSyncEl?: JQuery<HTMLElement>;
  $states?: JQuery<HTMLElement>;
  $statesC?: JQuery<HTMLElement>;
  em: EditorModel;
  target: EditorModel;
  module: SelectorManager;

  pfx: string;
  ppfx: string;
  stateInputId: string;
  stateInputC: string;
  config: any;
  states: State[];

  constructor(o: any = {}) {
    super(o);
    this.config = o.config || {};
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    this.className = this.pfx + 'tags';
    this.stateInputId = this.pfx + 'states';
    this.stateInputC = this.pfx + 'input-c';
    this.states = this.config.states || [];
    const { em } = this.config;
    const coll = this.collection;
    this.target = em;
    const md = em.get('SelectorManager');
    this.module = md;
    this.em = em;
    this.componentChanged = debounce(this.componentChanged.bind(this), 0);
    this.checkSync = debounce(this.checkSync.bind(this), 0);
    const toList = 'component:toggled component:update:classes';
    const toListCls = 'component:update:classes change:state';
    this.listenTo(em, toList, this.componentChanged);
    this.listenTo(em, 'styleManager:update', this.componentChanged);
    this.listenTo(em, toListCls, this.__handleStateChange);
    this.listenTo(em, 'styleable:change change:device', this.checkSync); // component:styleUpdate
    this.listenTo(coll, 'add', this.addNew);
    this.listenTo(coll, 'reset', this.renderClasses);
    this.listenTo(coll, 'remove', this.tagRemoved);
    this.listenTo(
      md.getAll(),
      md.events.state,
      debounce(() => this.renderStates(), 0)
    );
    this.delegateEvents();
  }

  syncStyle() {
    const { em } = this;
    const target = this.getTarget();
    const cssC = em.get('CssComposer');
    const opts = { noDisabled: 1 };
    const selectors = this.getCommonSelectors({ opts });
    const state = em.get('state');
    const mediaText = em.getCurrentMedia();
    const ruleComponents: CSSRule[] = [];
    const rule = cssC.get(selectors, state, mediaText) || cssC.add(selectors, state, mediaText);
    let style;

    this.getTargets().forEach(target => {
      const ruleComponent = cssC.getIdRule(target.getId(), {
        state,
        mediaText,
      });
      style = ruleComponent.getStyle();
      ruleComponent.setStyle({});
      ruleComponents.push(ruleComponent);
    });

    style && rule.addStyle(style);
    em.trigger('component:toggled');
    em.trigger('component:sync-style', {
      component: target,
      selectors,
      mediaText,
      rule,
      ruleComponents,
      state,
    });
  }

  /**
   * Triggered when a tag is removed from collection
   * @param {Object} model Removed model
   * @private
   */
  tagRemoved(model?: State) {
    this.updateStateVis();
  }

  /**
   * Add new model
   * @param {Object} model
   * @private
   */
  addNew(model: State) {
    this.addToClasses(model);
  }

  /**
   * Start tag creation
   * @param {Object} e
   * @private
   */
  startNewTag() {
    this.$addBtn?.css({ display: 'none' });
    this.$input?.show().focus();
  }

  /**
   * End tag creation
   * @param {Object} e
   * @private
   */
  endNewTag() {
    this.$addBtn?.css({ display: '' });
    this.$input?.hide().val('');
  }

  /**
   * Checks what to do on keyup event
   * @param  {Object} e
   * @private
   */
  onInputKeyUp(e: KeyboardEvent) {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.addNewTag(this.$input?.val());
    } else if (e.keyCode === 27) {
      this.endNewTag();
    }
  }

  checkStates() {
    const state = this.em.getState();
    const statesEl = this.getStates();
    statesEl && statesEl.val(state);
  }

  /**
   * Triggered when component is changed
   * @param  {Object} e
   * @public
   */
  componentChanged({ targets }: any = {}) {
    this.updateSelection(targets);
  }

  updateSelection(targets: Component | Component[]) {
    let trgs = targets || this.getTargets();
    trgs = isArray(trgs) ? trgs : [trgs];
    let selectors: Selector[] = [];

    if (trgs && trgs.length) {
      selectors = this.getCommonSelectors({ targets: trgs });
      //@ts-ignore TODO This parameters are not in use why do we have them?
      this.checkSync({ validSelectors: selectors });
    }

    this.collection.reset(selectors);
    this.updateStateVis(trgs);
    this.module.__trgCustom();
    return selectors;
  }

  getCommonSelectors({ targets, opts = {} }: any = {}) {
    const trgs = targets || this.getTargets();
    return this.module.__getCommonSelectors(trgs, opts);
  }

  _commonSelectors(...args: any) {
    return this.module.__common(...args);
  }

  checkSync() {
    const { $btnSyncEl, config, collection } = this;
    const target = this.getTarget();
    let hasStyle;

    if (target && config.componentFirst && collection.length) {
      const style = target.getStyle();
      hasStyle = !isEmpty(style);
    }

    $btnSyncEl && $btnSyncEl[hasStyle ? 'show' : 'hide']();
  }

  getTarget() {
    return this.target.getSelected();
  }

  getTargets() {
    return this.target.getSelectedAll();
  }

  /**
   * Update states visibility. Hides states in case there is no tags
   * inside collection
   * @private
   */
  updateStateVis(targets?: Component[] | Component) {
    const em = this.em;
    const avoidInline = em && em.getConfig().avoidInlineStyle;
    const display = this.collection.length || avoidInline ? '' : 'none';
    this.getStatesC().css('display', display);
    this.updateSelector(targets);
  }

  __handleStateChange() {
    this.updateSelector(this.getTargets());
  }

  /**
   * Update selector helper
   * @return {this}
   * @private
   */
  updateSelector(targets?: Component[] | Component) {
    const elSel = this.el.querySelector('[data-selected]');
    const result: string[] = [];
    let trgs = targets || this.getTargets();
    trgs = isArray(trgs) ? trgs : [trgs];

    trgs.forEach(target => result.push(this.__getName(target)));
    elSel && (elSel.innerHTML = result.join(', '));
    this.checkStates();
  }

  __getName(target: Component): string {
    const { pfx, config, em } = this;
    const { selectedName, componentFirst } = config;
    let result;

    if (isString(target)) {
      result = html`<span class="${pfx}sel-gen">${target}</span>`;
    } else {
      const sel = target?.getSelectors();
      if (!sel) return '';
      const selectors = sel.getStyleable();
      const state = em.get('state');
      const idRes = target.getId
        ? html`<span class="${pfx}sel-cmp">${target.getName()}</span>
            <span class="${pfx}sel-id">#${target.getId()}</span>`
        : '';
      result = (this.collection as Selectors).getFullString(selectors);
      result = result ? html`<span class="${pfx}sel-rule">${result}</span>` : target.get('selectorsAdd') || idRes;
      result = componentFirst && idRes ? idRes : result;
      result += state ? html`<span class="${pfx}sel-state">:${state}</span>` : '';
      result = selectedName ? selectedName({ result, state, target }) : result;
    }

    return result && `<span class="${pfx}sel">${result}</span>`;
  }

  /**
   * Triggered when the select with states is changed
   * @param  {Object} e
   * @private
   */
  stateChanged(ev: any) {
    const { em } = this;
    const { value } = ev.target;
    em.set('state', value);
  }

  /**
   * Add new tag to collection, if possible, and to the component
   * @param  {Object} e
   * @private
   */
  addNewTag(value: any) {
    const label = value.trim();
    if (!label) return;
    this.module.addSelected({ label });
    this.endNewTag();
    // this.updateStateVis(); // Check if required
  }

  /**
   * Add new object to collection
   * @param   {Object} model  Model
   * @param   {Object} fragmentEl   Fragment collection
   * @return {Object} Object created
   * @private
   * */
  addToClasses(model: State, fragmentEl?: DocumentFragment) {
    const fragment = fragmentEl;
    const classes = this.getClasses();
    const rendered = new ClassTagView({
      model,
      config: this.config,
      coll: this.collection,
      module: this.module,
    }).render().el;

    fragment ? fragment.appendChild(rendered) : classes.append(rendered);

    return rendered;
  }

  /**
   * Render the collection of classes
   * @private
   */
  renderClasses() {
    const frag = document.createDocumentFragment();
    const classes = this.getClasses();
    classes.empty();
    this.collection.each(model => this.addToClasses(model, frag));
    classes.append(frag);
  }

  /**
   * Return classes element
   * @return {HTMLElement}
   * @private
   */
  getClasses() {
    return this.$el.find('[data-selectors]');
  }

  /**
   * Return states element
   * @return {HTMLElement}
   * @private
   */
  getStates() {
    if (!this.$states) {
      const el = this.$el.find('[data-states]');
      this.$states = el[0] && el;
    }
    return this.$states;
  }

  /**
   * Return states container element
   * @return {HTMLElement}
   * @private
   */
  getStatesC() {
    if (!this.$statesC) this.$statesC = this.$el.find('#' + this.stateInputC);
    return this.$statesC;
  }

  renderStates() {
    const { module, em } = this;
    const labelStates = em.t('selectorManager.emptyState');
    const options = module
      .getStates()
      .map(state => {
        const label = em.t(`selectorManager.states.${state.id}`) || state.getLabel() || state.id;
        return `<option value="${state.id}">${label}</option>`;
      })
      .join('');

    const statesEl = this.getStates();
    statesEl && statesEl.html(`<option value="">${labelStates}</option>${options}`);
    this.checkStates();
  }

  render() {
    const { em, pfx, ppfx, config, $el, el } = this;
    const { render, iconSync, iconAdd } = config;
    const tmpOpts = {
      iconSync,
      iconAdd,
      labelHead: em.t('selectorManager.label'),
      labelInfo: em.t('selectorManager.selected'),
      ppfx,
      pfx,
      el,
    };
    $el.html(this.template(tmpOpts));
    const renderRes = render && render(tmpOpts);
    renderRes && renderRes !== el && $el.empty().append(renderRes);
    this.$input = $el.find('[data-input]');
    this.$addBtn = $el.find('[data-add]');
    this.$classes = $el.find('#' + pfx + 'tags-c');
    this.$btnSyncEl = $el.find('[data-sync-style]');
    this.$input.hide();
    this.renderStates();
    this.renderClasses();
    $el.attr('class', `${this.className} ${ppfx}one-bg ${ppfx}two-color`);
    return this;
  }
}
