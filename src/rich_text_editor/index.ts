/**
 * This module allows to customize the built-in toolbar of the Rich Text Editor and use commands from the [HTML Editing APIs](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand).
 * It's highly recommended to keep this toolbar as small as possible, especially from styling commands (eg. 'fontSize') and leave this task to the Style Manager
 *
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/GrapesJS/grapesjs/blob/master/src/rich_text_editor/config/config.ts)
 * ```js
 * const editor = grapesjs.init({
 *  richTextEditor: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API and listen to its events. Before using these methods, you should get the module from the instance.
 *
 * ```js
 * // Listen to events
 * editor.on('rte:enable', () => { ... });
 *
 * // Use the API
 * const rte = editor.RichTextEditor;
 * rte.add(...);
 * ```
 *
 * ## Available Events
 * * `rte:enable` - RTE enabled. The view, on which RTE is enabled, is passed as an argument
 * * `rte:disable` - RTE disabled. The view, on which RTE is disabled, is passed as an argument
 *
 * ## Methods
 * * [add](#add)
 * * [get](#get)
 * * [run](#run)
 * * [getAll](#getall)
 * * [remove](#remove)
 * * [getToolbarEl](#gettoolbarel)
 *
 * @module RichTextEditor
 */

import { debounce, isFunction, isString } from 'underscore';
import { Module } from '../abstract';
import { Debounced, DisableOptions, Model } from '../common';
import ComponentView from '../dom_components/view/ComponentView';
import EditorModel from '../editor/model/Editor';
import { createEl, cx, on, removeEl } from '../utils/dom';
import { hasWin, isDef } from '../utils/mixins';
import defaults, { CustomRTE, RichTextEditorConfig } from './config/config';
import RichTextEditor, { RichTextEditorAction } from './model/RichTextEditor';
import CanvasEvents from '../canvas/types';

export type RichTextEditorEvent = 'rte:enable' | 'rte:disable' | 'rte:custom';

const eventsUp = `${CanvasEvents.refresh} frame:scroll component:update`;

export const evEnable = 'rte:enable';
export const evDisable = 'rte:disable';
export const evCustom = 'rte:custom';

const events = {
  enable: evEnable,
  disable: evDisable,
  custom: evCustom,
};

interface ModelRTE {
  currentView?: ComponentView;
}

export default class RichTextEditorModule extends Module<RichTextEditorConfig & { pStylePrefix?: string }> {
  pfx: string;
  toolbar!: HTMLElement;
  globalRte?: RichTextEditor;
  actionbar?: HTMLElement;
  lastEl?: HTMLElement;
  actions?: (RichTextEditorAction | string)[];
  customRte?: CustomRTE;
  model: Model<ModelRTE>;
  __dbdTrgCustom: Debounced;
  events = events;

  /**
   * Get configuration object
   * @name getConfig
   * @function
   * @return {Object}
   */

  constructor(em: EditorModel) {
    super(em, 'RichTextEditor', defaults);
    const { config } = this;
    const ppfx = config.pStylePrefix;

    if (ppfx) {
      config.stylePrefix = ppfx + config.stylePrefix;
    }

    this.pfx = config.stylePrefix!;
    this.actions = config.actions || [];
    const model = new Model();
    this.model = model;
    model.on('change:currentView', this.__trgCustom, this);
    this.__dbdTrgCustom = debounce(() => this.__trgCustom(), 0);
  }

  onLoad() {
    if (!hasWin()) return;
    const { config } = this;
    const ppfx = config.pStylePrefix;
    const isCustom = config.custom;
    const toolbar = createEl('div', {
      class: cx(`${ppfx}rte-toolbar`, !isCustom && `${ppfx}one-bg ${ppfx}rte-toolbar-ui`),
    });
    this.toolbar = toolbar;
    this.initRte(createEl('div'));

    //Avoid closing on toolbar clicking
    on(toolbar, 'mousedown', e => e.stopPropagation());
  }

  __trgCustom() {
    const { model, em, events } = this;
    em.trigger(events.custom, {
      enabled: !!model.get('currentView'),
      container: this.getToolbarEl(),
      actions: this.getAll(),
    });
  }

  destroy() {
    this.globalRte?.destroy();
    this.customRte?.destroy?.();
    this.model.stopListening().clear({ silent: true });
    this.__dbdTrgCustom.cancel();
    removeEl(this.toolbar);
  }

  /**
   * Post render callback
   * @param  {View} ev
   * @private
   */
  postRender(ev: any) {
    const canvas = ev.model.get('Canvas');
    this.toolbar.style.pointerEvents = 'all';
    this.hideToolbar();
    canvas.getToolsEl().appendChild(this.toolbar);
  }

  /**
   * Init the built-in RTE
   * @param  {HTMLElement} el
   * @return {RichTextEditor}
   * @private
   */
  initRte(el: HTMLElement) {
    let { globalRte } = this;
    const { em, pfx, actionbar, config } = this;
    const actions = this.actions || [...config.actions!];
    const classes = {
      actionbar: `${pfx}actionbar`,
      button: `${pfx}action`,
      active: `${pfx}active`,
      inactive: `${pfx}inactive`,
      disabled: `${pfx}disabled`,
    };

    if (!globalRte) {
      globalRte = new RichTextEditor(em, el, {
        classes,
        actions,
        actionbar,
        actionbarContainer: this.toolbar,
        module: this,
      });
      this.globalRte = globalRte;
    } else {
      globalRte.em = em;
      globalRte.setEl(el);
    }

    if (globalRte.actionbar) {
      this.actionbar = globalRte.actionbar;
    }

    if (globalRte.actions) {
      this.actions = globalRte.actions;
    }

    return globalRte;
  }

  /**
   * Add a new action to the built-in RTE toolbar
   * @param {string} name Action name
   * @param {Object} action Action options
   * @example
   * rte.add('bold', {
   *   icon: '<b>B</b>',
   *   attributes: {title: 'Bold'},
   *   result: rte => rte.exec('bold')
   * });
   * rte.add('link', {
   *   icon: document.getElementById('t'),
   *   attributes: { title: 'Link' },
   *   // Example on how to wrap selected content
   *   result: rte => rte.insertHTML(`<a href="#">${rte.selection()}</a>`)
   * });
   * // An example with fontSize
   * rte.add('fontSize', {
   *   icon: `<select class="gjs-field">
   *         <option>1</option>
   *         <option>4</option>
   *         <option>7</option>
   *       </select>`,
   *     // Bind the 'result' on 'change' listener
   *   event: 'change',
   *   result: (rte, action) => rte.exec('fontSize', action.btn.firstChild.value),
   *   // Callback on any input change (mousedown, keydown, etc..)
   *   update: (rte, action) => {
   *     const value = rte.doc.queryCommandValue(action.name);
   *     if (value != 'false') { // value is a string
   *       action.btn.firstChild.value = value;
   *     }
   *    }
   *   })
   * // An example with state
   * const isValidAnchor = (rte) => {
   *   // a utility function to help determine if the selected is a valid anchor node
   *   const anchor = rte.selection().anchorNode;
   *   const parentNode  = anchor && anchor.parentNode;
   *   const nextSibling = anchor && anchor.nextSibling;
   *   return (parentNode && parentNode.nodeName == 'A') || (nextSibling && nextSibling.nodeName == 'A')
   * }
   * rte.add('toggleAnchor', {
   *   icon: `<span style="transform:rotate(45deg)">&supdsub;</span>`,
   *   state: (rte, doc) => {
   *    if (rte && rte.selection()) {
   *      // `btnState` is a integer, -1 for disabled, 0 for inactive, 1 for active
   *      return isValidAnchor(rte) ? btnState.ACTIVE : btnState.INACTIVE;
   *    } else {
   *      return btnState.INACTIVE;
   *    }
   *   },
   *   result: (rte, action) => {
   *     if (isValidAnchor(rte)) {
   *       rte.exec('unlink');
   *     } else {
   *       rte.insertHTML(`<a class="link" href="">${rte.selection()}</a>`);
   *     }
   *   }
   * })
   */
  add(name: string, action: Partial<RichTextEditorAction> = {}) {
    action.name = name;
    this.globalRte?.addAction(action as RichTextEditorAction, { sync: true });
  }

  /**
   * Get the action by its name
   * @param {string} name Action name
   * @return {Object}
   * @example
   * const action = rte.get('bold');
   * // {name: 'bold', ...}
   */
  get(name: string): RichTextEditorAction | undefined {
    let result;
    this.globalRte?.getActions().forEach(action => {
      if (action.name == name) {
        result = action;
      }
    });
    return result;
  }

  /**
   * Get all actions
   * @return {Array}
   */
  getAll() {
    return this.globalRte?.getActions() || [];
  }

  /**
   * Remove the action from the toolbar
   * @param  {string} name
   * @return {Object} Removed action
   * @example
   * const action = rte.remove('bold');
   * // {name: 'bold', ...}
   */
  remove(name: string) {
    const actions = this.getAll();
    const action = this.get(name);

    if (action) {
      const btn = action.btn;
      const index = actions.indexOf(action);
      btn?.parentNode?.removeChild(btn);
      actions.splice(index, 1);
    }

    return action;
  }

  /**
   * Run action command.
   * @param action Action to run
   * @example
   * const action = rte.get('bold');
   * rte.run(action) // or rte.run('bold')
   */
  run(action: string | RichTextEditorAction) {
    const rte = this.globalRte;
    const actionRes = isString(action) ? this.get(action) : action;

    if (rte && actionRes) {
      actionRes.result(rte, actionRes);
      rte.updateActiveActions();
    }
  }

  /**
   * Get the toolbar element
   * @return {HTMLElement}
   */
  getToolbarEl() {
    return this.toolbar;
  }

  /**
   * Triggered when the offset of the editor is changed
   * @private
   */
  updatePosition() {
    const { em, toolbar } = this;
    const un = 'px';
    const canvas = em.Canvas;
    const { style } = toolbar;
    const pos = canvas.getTargetToElementFixed(this.lastEl!, toolbar, {
      event: 'rteToolbarPosUpdate',
      left: 0,
    });
    ['top', 'left', 'bottom', 'right'].forEach(key => {
      const value = pos[key as keyof typeof pos];
      if (isDef(value)) {
        style[key as any] = isString(value) ? value : (value || 0) + un;
      }
    });
  }

  /**
   * Enable rich text editor on the element
   * @param {View} view Component view
   * @param {Object} rte The instance of already defined RTE
   * @private
   * */
  async enable(view: ComponentView, rte: RichTextEditor, opts: any = {}) {
    this.lastEl = view.el;
    const { customRte, em } = this;
    const el = view.getChildrenContainer();

    this.toolbar.style.display = '';
    const rteInst = await (customRte ? customRte.enable(el, rte) : this.initRte(el).enable(opts));

    if (em) {
      setTimeout(this.updatePosition.bind(this), 0);
      em.off(eventsUp, this.updatePosition, this);
      em.on(eventsUp, this.updatePosition, this);
      em.trigger('rte:enable', view, rteInst);
    }

    this.model.set({ currentView: view });

    return rteInst;
  }

  async getContent(view: ComponentView, rte: RichTextEditor) {
    const { customRte } = this;

    if (customRte && rte && isFunction(customRte.getContent)) {
      return await customRte.getContent(view.el, rte);
    } else {
      return view.getChildrenContainer().innerHTML;
    }
  }

  hideToolbar() {
    const style = this.toolbar.style;
    const size = '-1000px';
    style.top = size;
    style.left = size;
    style.display = 'none';
  }

  /**
   * Unbind rich text editor from the element
   * @param {View} view
   * @param {Object} rte The instance of already defined RTE
   * @private
   * */
  disable(view: ComponentView, rte?: RichTextEditor, opts: DisableOptions = {}) {
    const { em } = this;
    const customRte = this.customRte;
    // @ts-ignore
    const el = view.getChildrenContainer();

    if (customRte) {
      customRte.disable(el, rte);
    } else {
      rte && rte.disable();
    }

    this.hideToolbar();

    if (em) {
      em.off(eventsUp, this.updatePosition, this);
      !opts.fromMove && em.trigger('rte:disable', view, rte);
    }

    this.model.unset('currentView');
  }
}
