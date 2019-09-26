import { template, debounce } from 'underscore';
import Backbone from 'backbone';
import ClassTagView from './ClassTagView';

export default Backbone.View.extend({
  template: template(`
  <div id="<%= pfx %>up">
    <div id="<%= pfx %>label"><%= label %></div>
    <div id="<%= pfx %>status-c">
      <span id="<%= pfx %>input-c">
        <div class="<%= ppfx %>field <%= ppfx %>select">
          <span id="<%= ppfx %>input-holder">
            <select id="<%= pfx %>states">
              <option value=""><%= statesLabel %></option>
            </select>
          </span>
          <div class="<%= ppfx %>sel-arrow">
            <div class="<%= ppfx %>d-s-arrow"></div>
          </div>
        </div>
      </span>
    </div>
  </div>
  <div id="<%= pfx %>tags-field" class="<%= ppfx %>field">
    <div id="<%= pfx %>tags-c"></div>
    <input id="<%= pfx %>new" />
    <span id="<%= pfx %>add-tag" class="fa fa-plus"></span>
  </div>
  <div id="<%= pfx %>sel-help">
    <div id="<%= pfx %>label"><%= selectedLabel %></div>
    <div id="<%= pfx %>sel"></div>
    <div style="clear:both"></div>
  </div>`),

  events: {},

  initialize(o = {}) {
    this.config = o.config || {};
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    this.className = this.pfx + 'tags';
    this.addBtnId = this.pfx + 'add-tag';
    this.newInputId = this.pfx + 'new';
    this.stateInputId = this.pfx + 'states';
    this.stateInputC = this.pfx + 'input-c';
    this.states = this.config.states || [];
    this.events['click #' + this.addBtnId] = 'startNewTag';
    this.events['blur #' + this.newInputId] = 'endNewTag';
    this.events['keyup #' + this.newInputId] = 'onInputKeyUp';
    this.events['change #' + this.stateInputId] = 'stateChanged';
    const { em } = this.config;
    const emitter = this.getStyleEmitter();
    this.target = this.config.em;
    this.em = em;

    this.listenTo(emitter, 'styleManager:update', this.componentChanged);
    this.listenTo(
      em,
      'component:toggled component:update:classes',
      this.componentChanged
    );
    this.listenTo(em, 'component:update:classes', this.updateSelector);

    this.listenTo(this.collection, 'add', this.addNew);
    this.listenTo(this.collection, 'reset', this.renderClasses);
    this.listenTo(this.collection, 'remove', this.tagRemoved);

    this.delegateEvents();
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
    var strInput = '';
    for (var i = 0; i < this.states.length; i++) {
      strInput +=
        '<option value="' +
        this.states[i].name +
        '">' +
        this.states[i].label +
        '</option>';
    }
    return strInput;
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
  startNewTag(e) {
    this.$addBtn.get(0).style.display = 'none';
    this.$input.show().focus();
  },

  /**
   * End tag creation
   * @param {Object} e
   * @private
   */
  endNewTag(e) {
    this.$addBtn.get(0).style.display = '';
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
  componentChanged: debounce(function(target) {
    target = target || this.getTarget();
    this.compTarget = target;
    let validSelectors = [];

    if (target) {
      const state = target.get('state');
      state && this.getStates().val(state);
      const selectors = target.getSelectors();
      validSelectors = selectors.getValid();
    }

    this.collection.reset(validSelectors);
    this.updateStateVis(target);
  }),

  getTarget() {
    return this.target.getSelected();
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
    const { pfx, collection, el } = this;
    const selected = target || this.getTarget();
    this.compTarget = selected;
    if (!selected || !selected.get) return;

    const state = selected.get('state');
    const coll = collection;
    let result = coll.getFullString(selected.getSelectors().getStyleable());
    result =
      result ||
      selected.get('selectorsAdd') ||
      (selected.getId ? `#${selected.getId()}` : '');
    result += state ? `:${state}` : '';
    const elSel = el.querySelector(`#${pfx}sel`);
    elSel && (elSel.innerHTML = result);
  },

  /**
   * Triggered when the select with states is changed
   * @param  {Object} e
   * @private
   */
  stateChanged(e) {
    if (this.compTarget) {
      this.compTarget.set('state', this.$states.val());
      this.updateSelector();
    }
  },

  /**
   * Add new tag to collection, if possible, and to the component
   * @param  {Object} e
   * @private
   */
  addNewTag(label) {
    const target = this.target;
    const component = this.compTarget;

    if (!label.trim()) {
      return;
    }

    if (target) {
      const sm = target.get('SelectorManager');
      const model = sm.add({ label });

      if (component) {
        const compCls = component.getSelectors();
        compCls.add(model);
        this.collection.add(model);
        this.updateStateVis();
      }
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
    const ppfx = this.ppfx;
    const config = this.config;
    const $el = this.$el;
    $el.html(
      this.template({
        selectedLabel: config.selectedLabel,
        statesLabel: config.statesLabel,
        label: config.label,
        pfx: this.pfx,
        ppfx: this.ppfx
      })
    );
    this.$input = $el.find('input#' + this.newInputId);
    this.$addBtn = $el.find('#' + this.addBtnId);
    this.$classes = $el.find('#' + this.pfx + 'tags-c');
    this.$states = $el.find('#' + this.stateInputId);
    this.$statesC = $el.find('#' + this.stateInputC);
    this.$states.append(this.getStateOptions());
    this.renderClasses();
    $el.attr('class', `${this.className} ${ppfx}one-bg ${ppfx}two-color`);
    return this;
  }
});
