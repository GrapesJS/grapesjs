import { bindAll, isString } from 'underscore';
import { View, ViewOptions } from '../../common';
import Component from '../../dom_components/model/Component';
import ComponentView from '../../dom_components/view/ComponentView';
import EditorModel from '../../editor/model/Editor';
import { isEnterKey, isEscKey } from '../../utils/dom';
import LayerManager from '../index';
import ItemsView from './ItemsView';
import { getOnComponentDrag, getOnComponentDragEnd, getOnComponentDragStart } from '../../commands';

export type ItemViewProps = ViewOptions & {
  ItemView: ItemView;
  level: number;
  config: any;
  opened: {};
  model: Component;
  module: LayerManager;
  sorter: any;
  parentView: ItemView;
};

const inputProp = 'contentEditable';

export default class ItemView extends View {
  events() {
    return {
      'mousedown [data-toggle-move]': 'startSort',
      'touchstart [data-toggle-move]': 'startSort',
      'click [data-toggle-visible]': 'toggleVisibility',
      'click [data-toggle-open]': 'toggleOpening',
      'click [data-toggle-select]': 'handleSelect',
      'mouseover [data-toggle-select]': 'handleHover',
      'mouseout [data-toggle-select]': 'handleHoverOut',
      'dblclick [data-name]': 'handleEdit',
      'keydown [data-name]': 'handleEditKey',
      'focusout [data-name]': 'handleEditEnd',
    };
  }

  template(model: Component) {
    const { pfx, ppfx, config, clsNoEdit, module, opt, em } = this;
    const { hidable } = config;
    const count = module.getComponents(model).length;
    const addClass = !count ? this.clsNoChild : '';
    const clsTitle = `${this.clsTitle} ${addClass}`;
    const clsTitleC = `${this.clsTitleC}`;
    const clsInput = `${this.inputNameCls} ${clsNoEdit} ${ppfx}no-app`;
    const level = opt.level || 0;
    const gut = `${level * 10}px`;
    const name = model.getName();
    const icon = model.getIcon();
    const clsBase = `${pfx}layer`;
    const { icons } = em?.getConfig();
    const { move, eye, eyeOff, chevron } = icons!;

    return `
      <div class="${pfx}layer-item ${ppfx}one-bg" data-toggle-select>
        <div class="${pfx}layer-item-left">
          ${
            hidable
              ? `<i class="${pfx}layer-vis" data-toggle-visible>
                <i class="${pfx}layer-vis-on">${eye}</i>
                <i class="${pfx}layer-vis-off">${eyeOff}</i>
              </i>`
              : ''
          }
          <div class="${clsTitleC}">
            <div class="${clsTitle}" style="padding-left: ${gut}">
              <div class="${pfx}layer-title-inn" title="${name}">
                <i class="${this.clsCaret}" data-toggle-open>${chevron}</i>
                  ${icon ? `<span class="${clsBase}__icon">${icon}</span>` : ''}
                <span class="${clsInput}" data-name>${name}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="${pfx}layer-item-right">
          <div class="${this.clsCount}" data-count>${count || ''}</div>
          <div class="${this.clsMove}" data-toggle-move>${move || ''}</div>
        </div>
      </div>
      <div class="${this.clsChildren}"></div>
    `;
  }

  public get em(): EditorModel {
    return this.module.em;
  }

  public get ppfx(): string {
    return this.em.getConfig().stylePrefix!;
  }

  public get pfx(): string {
    return this.config.stylePrefix;
  }

  opt: ItemViewProps;
  module: LayerManager;
  config: any;
  sorter: any;
  /** @ts-ignore */
  model!: Component;
  parentView: ItemView;
  items?: ItemsView;
  inputNameCls: string;
  clsTitleC: string;
  clsTitle: string;
  clsCaret: string;
  clsCount: string;
  clsMove: string;
  clsChildren: string;
  clsNoChild: string;
  clsEdit: string;
  clsNoEdit: string;
  _rendered?: boolean;
  caret?: JQuery<HTMLElement>;
  inputName?: HTMLElement;

  constructor(opt: ItemViewProps) {
    super(opt);
    bindAll(this, '__render');
    this.opt = opt;
    this.module = opt.module;
    this.config = opt.config || {};
    this.sorter = opt.sorter || '';
    this.parentView = opt.parentView;
    const { model, pfx, ppfx } = this;
    const type = model.get('type') || 'default';
    this.className = `${pfx}layer ${pfx}layer__t-${type} no-select ${ppfx}two-color`;
    this.inputNameCls = `${ppfx}layer-name`;
    this.clsTitleC = `${pfx}layer-title-c`;
    this.clsTitle = `${pfx}layer-title`;
    this.clsCaret = `${pfx}layer-caret`;
    this.clsCount = `${pfx}layer-count`;
    this.clsMove = `${pfx}layer-move`;
    this.clsChildren = `${pfx}layer-children`;
    this.clsNoChild = `${pfx}layer-no-chld`;
    this.clsEdit = `${this.inputNameCls}--edit`;
    this.clsNoEdit = `${this.inputNameCls}--no-edit`;
    this.initComponent();
  }

  initComponent() {
    const { model, config } = this;
    const { onInit } = config;
    const components = model.components();
    this.listenTo(components, 'remove add reset', this.checkChildren);
    [
      ['change:status', this.updateStatus],
      ['change:open', this.updateOpening],
      ['change:layerable', this.updateLayerable],
      ['change:style:display', this.updateVisibility],
      ['rerender:layer', this.render],
      ['change:name change:custom-name', this.updateName],
      // @ts-ignore
    ].forEach(item => this.listenTo(model, item[0], item[1]));
    this.$el.data('model', model);
    this.$el.data('collection', components);
    // @ts-ignore
    model.viewLayer = this;
    onInit.bind(this)({
      component: model,
      render: this.__render,
      listenTo: this.listenTo,
    });
  }

  updateName() {
    this.getInputName().innerText = this.model.getName();
  }

  getVisibilityEl() {
    return this.getItemContainer().find('[data-toggle-visible]');
  }

  updateVisibility() {
    const { pfx, model, module } = this;
    const hClass = `${pfx}layer-hidden`;
    const hidden = !module.isVisible(model);
    const method = hidden ? 'addClass' : 'removeClass';
    this.$el[method](hClass);
    this.getVisibilityEl()[method](`${pfx}layer-off`);
  }

  /**
   * Toggle visibility
   * @param	Event
   *
   * @return 	void
   * */
  toggleVisibility(ev?: MouseEvent) {
    ev?.stopImmediatePropagation();
    const { module, model } = this;
    module.setVisible(model, !module.isVisible(model));
  }

  /**
   * Handle the edit of the component name
   */
  handleEdit(ev?: MouseEvent) {
    ev?.stopPropagation();
    const { em, $el, clsNoEdit, clsEdit } = this;
    const inputEl = this.getInputName();
    inputEl[inputProp] = 'true';
    inputEl.focus();
    document.execCommand('selectAll', false);
    em.setEditing(true);
    $el.find(`.${this.inputNameCls}`).removeClass(clsNoEdit).addClass(clsEdit);
  }

  handleEditKey(ev: KeyboardEvent) {
    ev.stopPropagation();
    (isEscKey(ev) || isEnterKey(ev)) && this.handleEditEnd(ev);
  }

  /**
   * Handle with the end of editing of the component name
   */
  handleEditEnd(ev?: KeyboardEvent) {
    ev?.stopPropagation();
    const { em, $el, clsNoEdit, clsEdit } = this;
    const inputEl = this.getInputName();
    const name = inputEl.textContent!;
    inputEl.scrollLeft = 0;
    inputEl[inputProp] = 'false';
    this.setName(name, { component: this.model, propName: 'custom-name' });
    em.setEditing(false);
    $el.find(`.${this.inputNameCls}`).addClass(clsNoEdit).removeClass(clsEdit);
    // Ensure to always update the layer name #4544
    this.updateName();
  }

  setName(name: string, { propName }: { propName: string; component?: Component }) {
    this.model.set(propName, name);
  }

  /**
   * Get the input containing the name of the component
   * @return {HTMLElement}
   */
  getInputName() {
    if (!this.inputName) {
      this.inputName = this.el.querySelector(`.${this.inputNameCls}`)!;
    }
    return this.inputName;
  }

  /**
   * Update item opening
   *
   * @return void
   * */
  updateOpening() {
    const { $el, model, pfx } = this;
    const clsOpen = 'open';
    const clsChvOpen = `${pfx}layer-open`;
    const caret = this.getCaret();

    if (this.module.isOpen(model)) {
      $el.addClass(clsOpen);
      caret.addClass(clsChvOpen);
    } else {
      $el.removeClass(clsOpen);
      caret.removeClass(clsChvOpen);
    }
  }

  /**
   * Toggle item opening
   * @param {Object}	e
   *
   * @return void
   * */
  toggleOpening(ev?: MouseEvent) {
    const { model, module } = this;
    ev?.stopImmediatePropagation();

    if (!model.get('components')!.length) return;

    module.setOpen(model, !module.isOpen(model));
  }

  /**
   * Handle component selection
   */
  handleSelect(event?: MouseEvent) {
    event?.stopPropagation();
    const { module, model } = this;
    module.setLayerData(model, { selected: true }, { event });
  }

  /**
   * Handle component selection
   */
  handleHover(ev?: MouseEvent) {
    ev?.stopPropagation();
    const { module, model } = this;
    module.setLayerData(model, { hovered: true });
  }

  handleHoverOut(ev?: MouseEvent) {
    ev?.stopPropagation();
    const { module, model } = this;
    module.setLayerData(model, { hovered: false });
  }

  /**
   * Delegate to sorter
   * @param	Event
   * */
  startSort(ev: MouseEvent) {
    ev.stopPropagation();
    const { em, sorter, model } = this;
    // Right or middel click
    if (ev.button && ev.button !== 0) return;

    if (sorter) {
      const toMove = model.delegate?.move?.(model) || model;
      sorter.onStart = getOnComponentDragStart(em);
      sorter.onMoveClb = getOnComponentDrag(em);
      sorter.onEndMove = getOnComponentDragEnd(em, [toMove]);
      const itemEl = (toMove as any).viewLayer?.el || ev.target;
      sorter.startSort(itemEl);
    }
  }

  /**
   * Update item on status change
   * @param	Event
   * */
  updateStatus() {
    // @ts-ignore
    ComponentView.prototype.updateStatus.apply(this, [
      {
        avoidHover: !this.config.highlightHover,
        noExtHl: true,
      },
    ]);
  }

  getItemContainer() {
    return this.$el.children('[data-toggle-select]');
  }

  /**
   * Update item aspect after children changes
   *
   * @return void
   * */
  checkChildren() {
    const { model, clsNoChild, module } = this;
    const count = module.getComponents(model).length;
    const itemEl = this.getItemContainer();
    const title = itemEl.find(`.${this.clsTitle}`);
    const countEl = itemEl.find('[data-count]');

    title[count ? 'removeClass' : 'addClass'](clsNoChild);
    countEl.html(`${count || ''}`);
    !count && module.setOpen(model, false);
  }

  getCaret() {
    if (!this.caret || !this.caret.length) {
      this.caret = this.getItemContainer().find(`.${this.clsCaret}`);
    }

    return this.caret;
  }

  setRoot(cmp: Component | string) {
    const model = isString(cmp) ? this.em.getWrapper()?.find(cmp)[0]! : cmp;
    if (!model) return;
    this.stopListening();
    this.model = model;
    this.initComponent();
    this._rendered && this.render();
  }

  updateLayerable() {
    const { parentView } = this;
    const toRerender = parentView || this;
    toRerender.render();
  }

  __clearItems() {
    this.items?.remove();
  }

  remove(...args: []) {
    View.prototype.remove.apply(this, args);
    this.__clearItems();
    return this;
  }

  render() {
    const { model, config, pfx, ppfx, opt, sorter } = this;
    this.__clearItems();
    const { opened, module, ItemView } = opt;
    const hidden = !module.__isLayerable(model);
    const el = this.$el.empty();
    const level = opt.level + 1;
    delete this.inputName;
    this.items = new ItemsView({
      ItemView,
      collection: model.get('components'),
      config,
      sorter,
      opened,
      parentView: this,
      parent: model,
      level,
      module,
    });
    const children = this.items.render().$el;

    if (!config.showWrapper && level === 1) {
      el.append(children);
    } else {
      el.html(this.template(model));
      el.find(`.${this.clsChildren}`).append(children);
    }

    if (!model.get('draggable') || !config.sortable) {
      el.children(`.${this.clsMove}`).remove();
    }

    !module.isVisible(model) && (this.className += ` ${pfx}hide`);
    hidden && (this.className += ` ${ppfx}hidden`);
    el.attr('class', this.className!);
    this.updateStatus();
    this.updateOpening();
    this.updateVisibility();
    this.__render();
    this._rendered = true;
    return this;
  }

  __render() {
    const { model, config, el } = this;
    const { onRender } = config;
    const opt = { component: model, el };
    onRender.bind(this)(opt);
    this.em.trigger('layer:render', opt);
  }
}
