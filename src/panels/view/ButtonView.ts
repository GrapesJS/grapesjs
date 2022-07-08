import { isString, isObject, isFunction } from 'underscore';
import { View } from '../../abstract';
import Button from '../model/Button';
import Buttons from '../model/Buttons';

export default class ButtonView extends View<Button> {
  //@ts-ignore
  tagName() {
    return this.model.get('tagName');
  }

  events() {
    return {
      click: 'clicked',
    };
  }

  commands: any;
  activeCls: string;
  disableCls: string;
  btnsVisCls: string;

  //Note: I don't think this is working
  $buttons?: any;

  constructor(o: any) {
    super(o);
    const { model, em, pfx, ppfx } = this;
    const cls = model.className;
    const { command, listen } = model.attributes;

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
      const chnOpt: any = { fromListen: true };
      this.listenTo(em, `run:${command}`, () => model.set('active', true, chnOpt));
      this.listenTo(em, `stop:${command}`, () => model.set('active', false, chnOpt));
    }

    if (em && em.get) this.commands = em.get('Commands');
  }

  /**
   * Updates class name of the button
   *
   * @return   void
   * */
  private updateClassName() {
    const { model, pfx } = this;
    const cls = model.className;
    const attrCls = model.get('attributes').class;
    const classStr = `${attrCls ? attrCls : ''} ${pfx}btn ${cls ? cls : ''}`;
    this.$el.attr('class', classStr.trim());
  }

  /**
   * Updates attributes of the button
   *
   * @return   void
   * */
  private updateAttributes() {
    const { em, model, $el } = this;
    const attr = model.get('attributes') || {};
    const title = em && em.t && em.t(`panels.buttons.titles.${model.id}`);
    $el.attr(attr);
    title && $el.attr({ title });

    this.updateClassName();
  }

  /**
   * Updates visibility of children buttons
   *
   * @return  void
   * */
  private updateBtnsVis() {
    if (!this.$buttons) return;

    if (this.model.get('bntsVis')) this.$buttons.addClass(this.btnsVisCls);
    else this.$buttons.removeClass(this.btnsVisCls);
  }

  /**
   * Update active status of the button
   *
   * @return   void
   * */
  private updateActive(m: any, v: any, opts: any = {}) {
    const { model, commands, $el, activeCls } = this;
    const { fromCollection, fromListen } = opts;
    const context = model.get('context');
    const options = model.get('options');
    const commandName = model.command;
    let command = {};

    if (!commandName) return;

    if (commands && isString(commandName)) {
      command = commands.get(commandName) || {};
    } else if (isFunction(commandName)) {
      command = commands.create({ run: commandName });
    } else if (commandName !== null && isObject(commandName)) {
      command = commands.create(commandName);
    }

    if (model.active) {
      !fromCollection && (model.collection as Buttons)?.deactivateAll(context, model);
      model.set('active', true, { silent: true }).trigger('checkActive');
      !fromListen && commands.runCommand(command, { ...options, sender: model });

      // Disable button if the command has no stop method
      //@ts-ignore
      command.noStop && model.set('active', false);
    } else {
      $el.removeClass(activeCls);
      !fromListen && commands.stopCommand(command, { ...options, sender: model, force: 1 });
    }
  }

  updateDisable() {
    const { disableCls, model } = this;
    const disable = model.disable;
    this.$el[disable ? 'addClass' : 'removeClass'](disableCls);
  }

  /**
   * Update active style status
   *
   * @return   void
   * */
  checkActive() {
    const { model, $el, activeCls } = this;
    model.active ? $el.addClass(activeCls) : $el.removeClass(activeCls);
  }

  /**
   * Triggered when button is clicked
   * @param  {Object}  e  Event
   *
   * @return   void
   * */
  clicked(e: Event) {
    const { model } = this;

    if (model.get('bntsVis') || model.disable || !model.command) return;

    this.toggleActive();
  }

  private toggleActive() {
    const { model, em } = this;
    const { active, togglable } = model;

    if (active && !togglable) return;

    model.active = !active;

    // If the stop is requested
    if (active) {
      if (model.runDefaultCommand) em.runDefault();
    } else {
      if (model.stopDefaultCommand) em.stopDefault();
    }
  }

  public render() {
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
}
