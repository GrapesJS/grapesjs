import Backbone from 'backbone';
import { isString, isObject, isFunction } from 'underscore';

const $ = Backbone.$;

export default Backbone.View.extend({
  tagName() {
    return this.model.get('tagName');
  },

  events: {
    click: 'clicked'
  },

  initialize(o) {
    const { model } = this;
    const cls = model.get('className');
    const { command, listen } = model.attributes;
    const config = o.config || {};
    const { em } = config;
    this.config = config;
    this.em = em;
    const pfx = this.config.stylePrefix || '';
    const ppfx = this.config.pStylePrefix || '';
    this.pfx = pfx;
    this.ppfx = this.config.pStylePrefix || '';
    this.id = pfx + model.get('id');
    this.activeCls = `${pfx}active ${ppfx}four-color`;
    this.disableCls = `${ppfx}disabled`;
    this.btnsVisCls = `${pfx}visible`;
    this.className = pfx + 'btn' + (cls ? ' ' + cls : '');
    this.listenTo(model, 'change', this.render);
    this.listenTo(model, 'change:active updateActive', this.updateActive);
    this.listenTo(model, 'checkActive', this.checkActive);
    this.listenTo(model, 'change:bntsVis', this.updateBtnsVis);
    this.listenTo(model, 'change:attributes', this.updateAttributes);
    this.listenTo(model, 'change:className', this.updateClassName);
    this.listenTo(model, 'change:disable', this.updateDisable);

    if (em && isString(command) && listen) {
      const chnOpt = { fromListen: 1 };
      this.listenTo(em, `run:${command}`, () =>
        model.set('active', true, chnOpt)
      );
      this.listenTo(em, `stop:${command}`, () =>
        model.set('active', false, chnOpt)
      );
    }

    if (em && em.get) this.commands = em.get('Commands');
  },

  /**
   * Updates class name of the button
   *
   * @return   void
   * */
  updateClassName() {
    const { model, pfx } = this;
    const cls = model.get('className');
    const attrCls = model.get('attributes').class;
    const classStr = `${attrCls ? attrCls : ''} ${pfx}btn ${cls ? cls : ''}`;
    this.$el.attr('class', classStr.trim());
  },

  /**
   * Updates attributes of the button
   *
   * @return   void
   * */
  updateAttributes() {
    const { em, model, $el } = this;
    const attr = model.get('attributes') || {};
    const title = em && em.t && em.t(`panels.buttons.titles.${model.id}`);
    $el.attr(attr);
    title && $el.attr({ title });

    this.updateClassName();
  },

  /**
   * Updates visibility of children buttons
   *
   * @return  void
   * */
  updateBtnsVis() {
    if (!this.$buttons) return;

    if (this.model.get('bntsVis')) this.$buttons.addClass(this.btnsVisCls);
    else this.$buttons.removeClass(this.btnsVisCls);
  },

  /**
   * Update active status of the button
   *
   * @return   void
   * */
  updateActive(m, v, opts = {}) {
    const { model, commands, $el, activeCls } = this;
    const { fromCollection, fromListen } = opts;
    const context = model.get('context');
    const options = model.get('options');
    const commandName = model.get('command');
    let command = {};

    if (!commandName) return;

    if (commands && isString(commandName)) {
      command = commands.get(commandName) || {};
    } else if (isFunction(commandName)) {
      command = commands.create({ run: commandName });
    } else if (commandName !== null && isObject(commandName)) {
      command = commands.create(commandName);
    }

    if (model.get('active')) {
      !fromCollection && model.collection.deactivateAll(context, model);
      model.set('active', true, { silent: true }).trigger('checkActive');
      !fromListen &&
        commands.runCommand(command, { ...options, sender: model });

      // Disable button if the command has no stop method
      command.noStop && model.set('active', false);
    } else {
      $el.removeClass(activeCls);
      !fromListen &&
        commands.stopCommand(command, { ...options, sender: model, force: 1 });
    }
  },

  updateDisable() {
    const { disableCls, model } = this;
    const disable = model.get('disable');
    this.$el[disable ? 'addClass' : 'removeClass'](disableCls);
  },

  /**
   * Update active style status
   *
   * @return   void
   * */
  checkActive() {
    const { model, $el, activeCls } = this;
    model.get('active') ? $el.addClass(activeCls) : $el.removeClass(activeCls);
  },

  /**
   * Triggered when button is clicked
   * @param  {Object}  e  Event
   *
   * @return   void
   * */
  clicked(e) {
    const { model } = this;

    if (model.get('bntsVis') || model.get('disable') || !model.get('command'))
      return;

    this.toggleActive();
  },

  toggleActive() {
    const { model, em } = this;
    const { active, togglable } = model.attributes;

    if (active && !togglable) return;

    model.set('active', !active);

    // If the stop is requested
    if (active) {
      if (model.get('runDefaultCommand')) em.runDefault();
    } else {
      if (model.get('stopDefaultCommand')) em.stopDefault();
    }
  },

  render() {
    const { model } = this;
    const label = model.get('label');
    const { $el } = this;
    !model.get('el') && $el.empty();
    this.updateAttributes();
    label && $el.append(label);
    this.checkActive();
    this.updateDisable();

    return this;
  }
});
