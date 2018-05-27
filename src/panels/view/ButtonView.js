import Backbone from 'backbone';
import { isString, isObject, isFunction } from 'underscore';
const $ = Backbone.$;

module.exports = Backbone.View.extend({
  tagName: 'span',

  events: {
    click: 'clicked'
  },

  initialize(o) {
    var cls = this.model.get('className');
    this.config = o.config || {};
    this.em = this.config.em || {};
    const pfx = this.config.stylePrefix || '';
    const ppfx = this.config.pStylePrefix || '';
    this.pfx = pfx;
    this.ppfx = this.config.pStylePrefix || '';
    this.id = pfx + this.model.get('id');
    this.activeCls = `${pfx}active ${ppfx}four-color`;
    this.disableCls = pfx + 'active';
    this.btnsVisCls = pfx + 'visible';
    this.className = pfx + 'btn' + (cls ? ' ' + cls : '');
    this.listenTo(this.model, 'change:active updateActive', this.updateActive);
    this.listenTo(this.model, 'checkActive', this.checkActive);
    this.listenTo(this.model, 'change:bntsVis', this.updateBtnsVis);
    this.listenTo(this.model, 'change:attributes', this.updateAttributes);
    this.listenTo(this.model, 'change:className', this.updateClassName);
    this.listenTo(this.model, 'change:disable', this.updateDisable);

    if (this.em && this.em.get) this.commands = this.em.get('Commands');
  },

  /**
   * Updates class name of the button
   *
   * @return   void
   * */
  updateClassName() {
    var cls = this.model.get('className');
    this.$el.attr('class', this.pfx + 'btn' + (cls ? ' ' + cls : ''));
  },

  /**
   * Updates attributes of the button
   *
   * @return   void
   * */
  updateAttributes() {
    this.$el.attr(this.model.get('attributes'));
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
  updateActive() {
    const model = this.model;
    const context = model.get('context');
    let command = {};
    var editor = this.em && this.em.get ? this.em.get('Editor') : null;
    var commandName = model.get('command');

    if (this.commands && isString(commandName)) {
      command = this.commands.get(commandName) || {};
    } else if (isFunction(commandName)) {
      command = { run: commandName };
    } else if (commandName !== null && isObject(commandName)) {
      command = commandName;
    }

    if (model.get('active')) {
      model.collection.deactivateAll(context);
      model.set('active', true, { silent: true }).trigger('checkActive');

      if (command.run) {
        command.run(editor, model, model.get('options'));
        editor.trigger('run:' + commandName);
      }

      // Disable button if there is no stop method
      !command.stop && model.set('active', false);
    } else {
      this.$el.removeClass(this.activeCls);
      model.collection.deactivateAll(context);

      if (command.stop) {
        command.stop(editor, model, model.get('options'));
        editor.trigger('stop:' + commandName);
      }
    }
  },

  updateDisable() {
    if (this.model.get('disable')) {
      this.$el.addClass(this.disableCls);
    } else {
      this.$el.removeClass(this.disableCls);
    }
  },

  /**
   * Update active style status
   *
   * @return   void
   * */
  checkActive() {
    if (this.model.get('active')) this.$el.addClass(this.activeCls);
    else this.$el.removeClass(this.activeCls);
  },

  /**
   * Triggered when button is clicked
   * @param  {Object}  e  Event
   *
   * @return   void
   * */
  clicked(e) {
    if (this.model.get('bntsVis')) return;

    if (this.model.get('disable')) return;

    this.toogleActive();
  },

  toogleActive() {
    var active = this.model.get('active');
    this.model.set('active', !active);

    // If the stop is requested
    var command = this.em.get('Commands').get('select-comp');

    if (active) {
      if (this.model.get('runDefaultCommand')) this.em.runDefault();
    } else {
      if (this.model.get('stopDefaultCommand')) this.em.stopDefault();
    }
  },

  render() {
    const label = this.model.get('label');
    const $el = this.$el;
    this.updateAttributes();
    $el.attr('class', this.className);
    label && $el.append(label);

    return this;
  }
});
