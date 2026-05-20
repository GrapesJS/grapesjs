import { bindAll } from 'underscore';
import { $ } from '../../common';
import type Component from '../../dom_components/model/Component';
import { off, on } from '../../utils/dom';
import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';
import SelectComponent from './SelectComponent';
import SelectPosition from './SelectPosition';

export interface MoveComponentCommandRegistryRun {
  'core:component-move': CommandPublicFnFromHandler<CommandMoveComponent['run']>;
  'move-comp': CommandPublicFnFromHandler<CommandMoveComponent['run']>;
}

export interface MoveComponentCommandRegistryStop {
  'core:component-move': CommandPublicFnFromHandler<CommandMoveComponent['stop']>;
  'move-comp': CommandPublicFnFromHandler<CommandMoveComponent['stop']>;
}

export default class CommandMoveComponent extends CommandAbstract {
  [key: string]: any;

  init(o: any) {
    (SelectComponent.init as any).apply(this, arguments as any);
    bindAll(this, 'initSorter', 'rollback', 'onEndMove');
    this.opt = o;
    this.hoverClass = `${this.ppfx}highlighter-warning`;
    this.badgeClass = `${this.ppfx}badge-warning`;
    this.noSelClass = `${this.ppfx}no-select`;
  }

  run(...args: any[]) {
    return (SelectPosition.run as any).apply(this, args);
  }

  enable(...args: any[]) {
    SelectComponent.enable.apply(this, args);
    this.getBadgeEl().addClass(this.badgeClass);
    this.getHighlighterEl().addClass(this.hoverClass);
    const wp = this.$wrapper;
    wp.css('cursor', 'move');
    wp.on('mousedown', this.initSorter);

    // Avoid strange moving behavior
    wp.addClass(this.noSelClass);
  }

  /**
   * Overwrite for doing nothing
   * @private
   */
  toggleClipboard() {}

  /**
   * Delegate sorting
   * @param  {Event} e
   * @private
   * */
  initSorter(e: any) {
    const el = $(e.target).data('model');
    const drag = el.get('draggable');
    if (!drag) return;

    // Avoid badge showing on move
    this.cacheEl = null;
    this.startSelectPosition(e.target, this.frameEl.contentDocument);
    this.sorter.draggable = drag;
    this.sorter.eventHandlers.legacyOnEndMove = this.onEndMove.bind(this);
    this.stopSelectComponent();
    this.$wrapper.off('mousedown', this.initSorter);
    on(this.getContentWindow(), 'keydown', this.rollback);
  }

  /**
   * Init sorter from model
   * @param  {Object} model
   * @private
   */
  initSorterFromModel(model: Component) {
    const drag = model.get('draggable');
    if (!drag) return;
    // Avoid badge showing on move
    this.cacheEl = null;
    const el = model.view?.el;
    if (!el) return;
    this.startSelectPosition(el, this.frameEl.contentDocument);
    this.sorter.draggable = drag;
    this.sorter.eventHandlers.legacyOnEndMove = this.onEndMoveFromModel.bind(this);
    this.stopSelectComponent();
    on(this.getContentWindow(), 'keydown', this.rollback);
  }

  /**
   * Init sorter from models
   * @param  {Object} model
   * @private
   */
  initSorterFromModels(models: Component[]) {
    // TODO: if one only check for `draggable`
    // Avoid badge showing on move
    this.cacheEl = null;
    const lastModel = models[models.length - 1];
    const frameView = this.em.getCurrentFrame();
    const el = lastModel.getEl(frameView?.model)!;
    const doc = el.ownerDocument;
    const elements = models.map((model) => model?.view?.el);
    this.startSelectPosition(elements, doc, { onStart: this.onStart });
    this.sorter.eventHandlers.legacyOnMoveClb = this.onDrag;
    this.sorter.eventHandlers.legacyOnEndMove = this.onEndMoveFromModel.bind(this);
    this.stopSelectComponent();
    on(this.getContentWindow(), 'keydown', this.rollback);
  }

  onEndMoveFromModel() {
    off(this.getContentWindow(), 'keydown', this.rollback);
  }

  /**
   * Callback after sorting
   * @private
   */
  onEndMove() {
    this.enable();
    off(this.getContentWindow(), 'keydown', this.rollback);
  }

  /**
   * Say what to do after the component was selected (selectComponent)
   * @param {Event} e
   * @param {Object} Selected element
   * @private
   * */
  onSelect(e: any, el: any) {}

  /**
   * Used to bring the previous situation before start moving the component
   * @param {Event} e
   * @param {Boolean} Indicates if rollback in anycase
   * @private
   * */
  rollback(e: any, force?: boolean) {
    const key = e.which || e.keyCode;
    if (key == 27 || force) {
      this.sorter.cancelDrag();
    }
    return;
  }

  /**
   * Returns badge element
   * @return {HTMLElement}
   * @private
   */
  getBadgeEl() {
    if (!this.$badge) this.$badge = $(this.getBadge());
    return this.$badge;
  }

  /**
   * Returns highlighter element
   * @return {HTMLElement}
   * @private
   */
  getHighlighterEl() {
    if (!this.$hl) this.$hl = $(this.canvas.getHighlighter());
    return this.$hl;
  }

  stop(...args: any[]) {
    (SelectComponent.stop as any).apply(this, args);
    this.getBadgeEl().removeClass(this.badgeClass);
    this.getHighlighterEl().removeClass(this.hoverClass);
    const wp = this.$wrapper;
    wp.css('cursor', '').unbind().removeClass(this.noSelClass);
  }
}

[
  SelectPosition as Record<string, unknown>,
  SelectComponent as Record<string, unknown>,
].forEach((source) => {
  Object.keys(source).forEach((key) => {
    if (!(key in CommandMoveComponent.prototype)) {
      (CommandMoveComponent.prototype as Record<string, unknown>)[key] = source[key];
    }
  });
});
