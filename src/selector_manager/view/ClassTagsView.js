import { isEmpty, debounce } from 'underscore';
import Backbone from 'backbone';
import ClassTagView from './ClassTagView';

export default Backbone.View.extend({
  template({ selectedLabel, statesLabel, label, pfx, ppfx }) {
    return `
    <div id="${pfx}up">
      <div id="${pfx}label">${label}</div>
      <div id="${pfx}status-c">
        <span id="${pfx}input-c">
          <div class="${ppfx}field ${ppfx}select">
            <span id="${ppfx}input-holder">
              <select id="${pfx}states" data-states>
                <option value="">${statesLabel}</option>
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
      <div id="${pfx}tags-c"></div>
      <input id="${pfx}new" data-input/>
      <span id="${pfx}add-tag" class="${pfx}tags-btn ${pfx}tags-btn__add" data-add>
        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
      </span>
      <span class="${pfx}tags-btn ${pfx}tags-btn__sync" style="display: none" data-sync-style>
        <svg viewBox="0 0 24 24"><path d="M12 18c-3.31 0-6-2.69-6-6 0-1 .25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4m0-11V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8z"></path></svg>
      </span>
    </div>
    <div class="${pfx}sels-info">
      <div class="${pfx}label-sel">${selectedLabel}:</div>
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
    const emitter = this.getStyleEmitter();
    const coll = this.collection;
    this.target = this.config.em;
    this.em = em;

    const toList = 'component:toggled component:update:classes';
    this.listenTo(em, toList, this.componentChanged);
    this.listenTo(emitter, 'styleManager:update', this.componentChanged);
    this.listenTo(
      em,
      'component:update:classes change:state',
      this.updateSelector
    );
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
    });

    style && rule.addStyle(style);
    em.trigger('component:toggled');
    em.trigger('component:sync-style', {
      component: target,
      selectors,
      mediaText,
      rule,
      ruleComponent,
      state
    });
  },

  getStyleEmitter() {
    const { em } = this;
    const sm = em && em.get('StyleManager');
    const emitter = sm && sm.getEmitter();
    return emitter || {};
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

  /**
   * Triggered when component is changed
   * @param  {Object} e
   * @private
   */
  componentChanged: debounce(function() {
    const { em } = this;
    const target = this.getTarget();
    const state = em.get('state');
    let validSelectors = [];

    if (target) {
      this.getStates().val(state);
      validSelectors = this.getCommonSelectors();
      this.checkSync({ validSelectors });
    }

    this.collection.reset(validSelectors);
    this.updateStateVis(target);
  }),

  getCommonSelectors({ targets, opts = {} } = {}) {
    const trgs = targets || this.getTargets();
    const selectors = trgs.map(tr => tr.getSelectors().getValid(opts));
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

  checkSync: debounce(function({ validSelectors }) {
    const { $btnSyncEl, config } = this;
    const target = this.getTarget();
    const sel =
      validSelectors || (target && target.getSelectors().getValid()) || [];
    let hasStyle;

    if (target && config.componentFirst && sel.length) {
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
    const display = this.collection.length || avoidInline ? 'block' : 'none';
    this.getStatesC().css('display', display);
    this.updateSelector(target);
  },

  /**
   * Update selector helper
   * @return {this}
   * @private
   */
  updateSelector(target) {
    const cmpFrst = this.config.componentFirst;
    const selected = target || this.getTarget();
    if (!selected || !selected.get) return;
    const result = cmpFrst
      ? this.getTargets()
          .map(trg => this.__getName(trg))
          .join(', ')
      : this.__getName(selected);
    const elSel = this.el.querySelector('[data-selected]');
    elSel && (elSel.innerHTML = result);
  },

  __getName(target) {
    const { pfx, config, em } = this;
    const { selectedName, componentFirst } = config;
    const coll = this.collection;
    const selectors = target.getSelectors().getStyleable();
    const state = em.get('state');
    const idRes = target.getId
      ? `<span class="${pfx}sel-cmp">${target.getName()}</span><span class="${pfx}sel-id">#${target.getId()}</span>`
      : '';
    let result = coll.getFullString(selectors);
    result = result || target.get('selectorsAdd') || idRes;
    result = componentFirst ? idRes : result;
    result += state ? `<span class="${pfx}sel-state">:${state}</span>` : '';
    result = selectedName ? selectedName({ result, state, target }) : result;

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
    return this.$el.find(`#${this.pfx}tags-c`);
  },

  /**
   * Return states element
   * @return {HTMLElement}
   * @private
   */
  getStates() {
    if (!this.$states) this.$states = this.$el.find('#' + this.stateInputId);
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
    const { em, pfx, ppfx, $el } = this;
    $el.html(
      this.template({
        selectedLabel: em.t('selectorManager.selected'),
        statesLabel: em.t('selectorManager.emptyState'),
        label: em.t('selectorManager.label'),
        pfx,
        ppfx
      })
    );
    this.$input = $el.find('[data-input]');
    this.$addBtn = $el.find('[data-add]');
    this.$classes = $el.find('#' + pfx + 'tags-c');
    this.$states = $el.find('#' + this.stateInputId);
    this.$statesC = $el.find('#' + this.stateInputC);
    this.$btnSyncEl = $el.find('[data-sync-style]');
    this.$states.append(this.getStateOptions());
    this.renderClasses();
    $el.attr('class', `${this.className} ${ppfx}one-bg ${ppfx}two-color`);
    return this;
  }
});
