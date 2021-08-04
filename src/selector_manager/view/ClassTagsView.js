import { isEmpty, isArray, isString, debounce } from 'underscore';
import Backbone from 'backbone';
import ClassTagView from './ClassTagView';

export default Backbone.View.extend({
  template({
    labelInfo,
    labelStates,
    labelHead,
    iconSync,
    iconAdd,
    pfx,
    ppfx
  }) {
    return `
    <div id="${pfx}up" class="${pfx}header">
      <div id="${pfx}label" class="${pfx}header-label">${labelHead}</div>
      <div id="${pfx}status-c" class="${pfx}header-status">
        <span id="${pfx}input-c" data-states-c>
          <div class="${ppfx}field ${ppfx}select">
            <span id="${ppfx}input-holder">
              <select id="${pfx}states" data-states>
                <option value="">${labelStates}</option>
              </select>
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
      <input id="${pfx}new" data-input/>
      <span id="${pfx}add-tag" class="${pfx}tags-btn ${pfx}tags-btn__add" data-add>
        ${iconAdd}
      </span>
      <span class="${pfx}tags-btn ${pfx}tags-btn__sync" style="display: none" data-sync-style>
        ${iconSync}
      </span>
    </div>
    <div class="${pfx}sels-info">
      <div class="${pfx}label-sel">${labelInfo}:</div>
      <div class="${pfx}sels" data-selected></div>
      <div style="clear:both"></div>
    </div>`;
  },

  events: {
    'change [data-states]': 'stateChanged',
    'click [data-add]': 'startNewTag',
    'focusout [data-input]': 'endNewTag',
    'keyup [data-input]': 'onInputKeyUp',
    'click [data-sync-style]': 'syncStyle'
  },

  initialize(o = {}) {
    this.config = o.config || {};
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    this.className = this.pfx + 'tags';
    this.stateInputId = this.pfx + 'states';
    this.stateInputC = this.pfx + 'input-c';
    this.states = this.config.states || [];
    const { em } = this.config;
    const coll = this.collection;
    this.target = this.config.em;
    this.em = em;
    const toList = 'component:toggled component:update:classes';
    const toListCls = 'component:update:classes change:state';
    this.listenTo(em, toList, this.componentChanged);
    this.listenTo(em, 'styleManager:update', this.componentChanged);
    this.listenTo(em, toListCls, this.__handleStateChange);
    this.listenTo(em, 'styleable:change change:device', this.checkSync); // component:styleUpdate
    this.listenTo(coll, 'add', this.addNew);
    this.listenTo(coll, 'reset', this.renderClasses);
    this.listenTo(coll, 'remove', this.tagRemoved);
    this.delegateEvents();
  },

  syncStyle() {
    const { em } = this;
    const target = this.getTarget();
    const cssC = em.get('CssComposer');
    const opts = { noDisabled: 1 };
    const selectors = this.getCommonSelectors({ opts });
    const state = em.get('state');
    const mediaText = em.getCurrentMedia();
    const ruleComponents = [];
    const rule =
      cssC.get(selectors, state, mediaText) ||
      cssC.add(selectors, state, mediaText);
    let style;

    this.getTargets().forEach(target => {
      const ruleComponent = cssC.getIdRule(target.getId(), {
        state,
        mediaText
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
      state
    });
  },

  /**
   * Triggered when a tag is removed from collection
   * @param {Object} model Removed model
   * @private
   */
  tagRemoved(model) {
    this.updateStateVis();
  },

  /**
   * Create select input with states
   * @return {string} String of options
   * @private
   */
  getStateOptions() {
    const { states, em } = this;
    let result = [];

    states.forEach(state =>
      result.push(
        `<option value="${state.name}">${em.t(
          `selectorManager.states.${state.name}`
        ) ||
          state.label ||
          state.name}</option>`
      )
    );

    return result.join('');
  },

  /**
   * Add new model
   * @param {Object} model
   * @private
   */
  addNew(model) {
    this.addToClasses(model);
  },

  /**
   * Start tag creation
   * @param {Object} e
   * @private
   */
  startNewTag() {
    this.$addBtn.css({ display: 'none' });
    this.$input.show().focus();
  },

  /**
   * End tag creation
   * @param {Object} e
   * @private
   */
  endNewTag() {
    this.$addBtn.css({ display: '' });
    this.$input.hide().val('');
  },

  /**
   * Checks what to do on keyup event
   * @param  {Object} e
   * @private
   */
  onInputKeyUp(e) {
    if (e.keyCode === 13) this.addNewTag(this.$input.val());
    else if (e.keyCode === 27) this.endNewTag();
  },

  checkStates() {
    const state = this.em.getState();
    const statesEl = this.getStates();
    statesEl && statesEl.val(state);
  },

  /**
   * Triggered when component is changed
   * @param  {Object} e
   * @private
   */
  componentChanged: debounce(function({ targets } = {}) {
    this.updateSelection(targets);
  }),

  updateSelection(targets) {
    let trgs = targets || this.getTargets();
    trgs = isArray(trgs) ? trgs : [trgs];
    let selectors = [];

    if (trgs && trgs.length) {
      selectors = this.getCommonSelectors({ targets: trgs });
      this.checkSync({ validSelectors: selectors });
    }

    this.collection.reset(selectors);
    this.updateStateVis(trgs);

    return selectors;
  },

  getCommonSelectors({ targets, opts = {} } = {}) {
    const trgs = targets || this.getTargets();
    const selectors = trgs
      .map(tr => tr.getSelectors && tr.getSelectors().getValid(opts))
      .filter(i => i);
    return this._commonSelectors(...selectors);
  },

  _commonSelectors(...args) {
    if (!args.length) return [];
    if (args.length === 1) return args[0];
    if (args.length === 2)
      return args[0].filter(item => args[1].indexOf(item) >= 0);

    return args
      .slice(1)
      .reduce((acc, item) => this._commonSelectors(acc, item), args[0]);
  },

  checkSync: debounce(function() {
    const { $btnSyncEl, config, collection } = this;
    const target = this.getTarget();
    let hasStyle;

    if (target && config.componentFirst && collection.length) {
      const style = target.getStyle();
      hasStyle = !isEmpty(style);
    }

    $btnSyncEl && $btnSyncEl[hasStyle ? 'show' : 'hide']();
  }),

  getTarget() {
    return this.target.getSelected();
  },

  getTargets() {
    return this.target.getSelectedAll();
  },

  /**
   * Update states visibility. Hides states in case there is no tags
   * inside collection
   * @private
   */
  updateStateVis(target) {
    const em = this.em;
    const avoidInline = em && em.getConfig('avoidInlineStyle');
    const display = this.collection.length || avoidInline ? '' : 'none';
    this.getStatesC().css('display', display);
    this.updateSelector(target);
  },

  __handleStateChange() {
    this.updateSelector(this.getTargets());
  },

  /**
   * Update selector helper
   * @return {this}
   * @private
   */
  updateSelector(targets) {
    const elSel = this.el.querySelector('[data-selected]');
    const result = [];
    let trgs = targets || this.getTargets();
    trgs = isArray(trgs) ? trgs : [trgs];

    trgs.forEach(target => result.push(this.__getName(target)));
    elSel && (elSel.innerHTML = result.join(', '));
    this.checkStates();
  },

  __getName(target) {
    const { pfx, config, em } = this;
    const { selectedName, componentFirst } = config;
    let result;

    if (isString(target)) {
      result = `<span class="${pfx}sel-gen">${target}</span>`;
    } else {
      const sel = target && target.get && target.getSelectors();
      if (!sel) return;
      const selectors = sel.getStyleable();
      const state = em.get('state');
      const idRes = target.getId
        ? `<span class="${pfx}sel-cmp">${target.getName()}</span><span class="${pfx}sel-id">#${target.getId()}</span>`
        : '';
      result = this.collection.getFullString(selectors);
      result = result
        ? `<span class="${pfx}sel-rule">${result}</span>`
        : target.get('selectorsAdd') || idRes;
      result = componentFirst && idRes ? idRes : result;
      result += state ? `<span class="${pfx}sel-state">:${state}</span>` : '';
      result = selectedName ? selectedName({ result, state, target }) : result;
    }

    return result && `<span class="${pfx}sel">${result}</span>`;
  },

  /**
   * Triggered when the select with states is changed
   * @param  {Object} e
   * @private
   */
  stateChanged(ev) {
    const { em } = this;
    const { value } = ev.target;
    em.set('state', value);
  },

  /**
   * Add new tag to collection, if possible, and to the component
   * @param  {Object} e
   * @private
   */
  addNewTag(label) {
    const { em } = this;

    if (!label.trim()) return;

    if (em) {
      const sm = em.get('SelectorManager');
      const model = sm.add({ label });

      this.getTargets().forEach(target => {
        target.getSelectors().add(model);
        this.collection.add(model);
        this.updateStateVis();
      });
    }

    this.endNewTag();
  },

  /**
   * Add new object to collection
   * @param   {Object} model  Model
   * @param   {Object} fragmentEl   Fragment collection
   * @return {Object} Object created
   * @private
   * */
  addToClasses(model, fragmentEl = null) {
    const fragment = fragmentEl;
    const classes = this.getClasses();
    const rendered = new ClassTagView({
      model,
      config: this.config,
      coll: this.collection
    }).render().el;

    fragment ? fragment.appendChild(rendered) : classes.append(rendered);

    return rendered;
  },

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
  },

  /**
   * Return classes element
   * @return {HTMLElement}
   * @private
   */
  getClasses() {
    return this.$el.find('[data-selectors]');
  },

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
  },

  /**
   * Return states container element
   * @return {HTMLElement}
   * @private
   */
  getStatesC() {
    if (!this.$statesC) this.$statesC = this.$el.find('#' + this.stateInputC);
    return this.$statesC;
  },

  render() {
    const { em, pfx, ppfx, config, $el, el } = this;
    const { render, iconSync, iconAdd } = config;
    const tmpOpts = {
      iconSync,
      iconAdd,
      labelHead: em.t('selectorManager.label'),
      labelStates: em.t('selectorManager.emptyState'),
      labelInfo: em.t('selectorManager.selected'),
      ppfx,
      pfx,
      el
    };
    $el.html(this.template(tmpOpts));
    const renderRes = render && render(tmpOpts);
    renderRes && renderRes !== el && $el.empty().append(renderRes);
    this.$input = $el.find('[data-input]');
    this.$addBtn = $el.find('[data-add]');
    this.$classes = $el.find('#' + pfx + 'tags-c');
    this.$btnSyncEl = $el.find('[data-sync-style]');
    this.$input.hide();
    const statesEl = this.getStates();
    statesEl && statesEl.append(this.getStateOptions());
    this.renderClasses();
    $el.attr('class', `${this.className} ${ppfx}one-bg ${ppfx}two-color`);
    return this;
  }
});
