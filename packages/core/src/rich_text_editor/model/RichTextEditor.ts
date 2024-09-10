// The initial version of this RTE was borrowed from https://github.com/jaredreich/pell
// and adapted to the GrapesJS's need

import { isString } from 'underscore';
import RichTextEditorModule from '..';
import EditorModel from '../../editor/model/Editor';
import { getPointerEvent, off, on } from '../../utils/dom';
import { getComponentModel } from '../../utils/mixins';

export interface RichTextEditorAction {
  name: string;
  icon: string | HTMLElement;
  event?: string;
  attributes?: Record<string, any>;
  result: (rte: RichTextEditor, action: RichTextEditorAction) => void;
  update?: (rte: RichTextEditor, action: RichTextEditorAction) => number;
  state?: (rte: RichTextEditor, doc: Document) => number;
  btn?: HTMLElement;
  currentState?: RichTextEditorActionState;
}

export enum RichTextEditorActionState {
  ACTIVE = 1,
  INACTIVE = 0,
  DISABLED = -1,
}

export interface RichTextEditorOptions {
  actions?: (RichTextEditorAction | string)[];
  classes?: Record<string, string>;
  actionbar?: HTMLElement;
  actionbarContainer?: HTMLElement;
  styleWithCSS?: boolean;
  module?: RichTextEditorModule;
}

type EffectOptions = {
  event?: Event;
};

const RTE_KEY = '_rte';

const btnState = {
  ACTIVE: 1,
  INACTIVE: 0,
  DISABLED: -1,
};
const isValidTag = (rte: RichTextEditor, tagName = 'A') => {
  const { anchorNode, focusNode } = rte.selection() || {};
  const parentAnchor = anchorNode?.parentNode;
  const parentFocus = focusNode?.parentNode;
  return parentAnchor?.nodeName == tagName || parentFocus?.nodeName == tagName;
};

const customElAttr = 'data-selectme';

const defActions: Record<string, RichTextEditorAction> = {
  bold: {
    name: 'bold',
    icon: '<b>B</b>',
    attributes: { title: 'Bold' },
    result: (rte) => rte.exec('bold'),
  },
  italic: {
    name: 'italic',
    icon: '<i>I</i>',
    attributes: { title: 'Italic' },
    result: (rte) => rte.exec('italic'),
  },
  underline: {
    name: 'underline',
    icon: '<u>U</u>',
    attributes: { title: 'Underline' },
    result: (rte) => rte.exec('underline'),
  },
  strikethrough: {
    name: 'strikethrough',
    icon: '<s>S</s>',
    attributes: { title: 'Strike-through' },
    result: (rte) => rte.exec('strikeThrough'),
  },
  link: {
    // eslint-disable-next-line max-len
    icon: `<svg viewBox="0 0 24 24">
          <path fill="currentColor" d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z" />
        </svg>`,
    name: 'link',
    attributes: {
      style: 'font-size:1.4rem;padding:0 4px 2px;',
      title: 'Link',
    },
    state: (rte) => {
      return rte && rte.selection() && isValidTag(rte) ? btnState.ACTIVE : btnState.INACTIVE;
    },
    result: (rte) => {
      if (isValidTag(rte)) {
        rte.exec('unlink');
      } else {
        rte.insertHTML(`<a href="" ${customElAttr}>${rte.selection()}</a>`, {
          select: true,
        });
      }
    },
  },
  wrap: {
    name: 'wrap',
    icon: `<svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M20.71,4.63L19.37,3.29C19,2.9 18.35,2.9 17.96,3.29L9,12.25L11.75,15L20.71,6.04C21.1,5.65 21.1,5 20.71,4.63M7,14A3,3 0 0,0 4,17C4,18.31 2.84,19 2,19C2.92,20.22 4.5,21 6,21A4,4 0 0,0 10,17A3,3 0 0,0 7,14Z" />
        </svg>`,
    attributes: { title: 'Wrap for style' },
    state: (rte) => {
      return rte?.selection() && isValidTag(rte, 'SPAN') ? btnState.DISABLED : btnState.INACTIVE;
    },
    result: (rte) => {
      !isValidTag(rte, 'SPAN') &&
        rte.insertHTML(`<span ${customElAttr}>${rte.selection()}</span>`, {
          select: true,
        });
    },
  },
};

export default class RichTextEditor {
  em: EditorModel;
  settings: RichTextEditorOptions;
  classes!: Record<string, string>;
  actionbar?: HTMLElement;
  actions!: RichTextEditorAction[];
  el!: HTMLElement;
  doc!: Document;
  enabled?: boolean;
  getContent?: () => string;

  constructor(em: EditorModel, el: HTMLElement & { _rte?: RichTextEditor }, settings: RichTextEditorOptions = {}) {
    this.em = em;
    this.settings = settings;

    if (el[RTE_KEY]) {
      return el[RTE_KEY]!;
    }

    el[RTE_KEY] = this;
    this.setEl(el);
    this.updateActiveActions = this.updateActiveActions.bind(this);
    this.__onKeydown = this.__onKeydown.bind(this);
    this.__onPaste = this.__onPaste.bind(this);

    const acts = (settings.actions || []).map((action) => {
      let result = action;
      if (isString(action)) {
        result = { ...defActions[action] };
      } else if (defActions[action.name]) {
        result = { ...defActions[action.name], ...action };
      }
      return result as RichTextEditorAction;
    });
    const actions = acts.length ? acts : Object.keys(defActions).map((a) => defActions[a]);

    settings.classes = {
      actionbar: 'actionbar',
      button: 'action',
      active: 'active',
      disabled: 'disabled',
      inactive: 'inactive',
      ...settings.classes,
    };

    const classes = settings.classes;
    let actionbar = settings.actionbar;
    this.actionbar = actionbar!;
    this.classes = classes;
    this.actions = actions;

    if (!actionbar) {
      if (!this.isCustom(settings.module)) {
        const actionbarCont = settings.actionbarContainer;
        actionbar = document.createElement('div');
        actionbar.className = classes.actionbar;
        actionbarCont?.appendChild(actionbar);
        this.actionbar = actionbar;
      }
      actions.forEach((action) => this.addAction(action));
    }

    settings.styleWithCSS && this.exec('styleWithCSS');
    return this;
  }

  isCustom(module?: RichTextEditorModule) {
    const rte = module || this.em.RichTextEditor;
    return !!(rte?.config.custom || rte?.customRte);
  }

  destroy() {}

  setEl(el: HTMLElement) {
    this.el = el;
    this.doc = el.ownerDocument;
  }

  updateActiveActions() {
    const actions = this.getActions();
    actions.forEach((action) => {
      const { update, btn } = action;
      const { active, inactive, disabled } = this.classes;
      const state = action.state;
      const name = action.name;
      const doc = this.doc;
      let currentState = RichTextEditorActionState.INACTIVE;

      if (btn) {
        btn.className = btn.className.replace(active, '').trim();
        btn.className = btn.className.replace(inactive, '').trim();
        btn.className = btn.className.replace(disabled, '').trim();
      }

      // if there is a state function, which depicts the state,
      // i.e. `active`, `disabled`, then call it
      if (state) {
        const newState = state(this, doc);
        currentState = newState;
        if (btn) {
          switch (newState) {
            case btnState.ACTIVE:
              btn.className += ` ${active}`;
              break;
            case btnState.INACTIVE:
              btn.className += ` ${inactive}`;
              break;
            case btnState.DISABLED:
              btn.className += ` ${disabled}`;
              break;
          }
        }
      } else {
        // otherwise default to checking if the name command is supported & enabled
        if (doc.queryCommandSupported(name) && doc.queryCommandState(name)) {
          btn && (btn.className += ` ${active}`);
          currentState = RichTextEditorActionState.ACTIVE;
        }
      }
      action.currentState = currentState;
      update?.(this, action);
    });

    actions.length && this.em.RichTextEditor.__dbdTrgCustom();
  }

  enable(opts: EffectOptions) {
    if (this.enabled) return this;
    return this.__toggleEffects(true, opts);
  }

  disable() {
    return this.__toggleEffects(false);
  }

  __toggleEffects(enable = false, opts: EffectOptions = {}) {
    const method = enable ? on : off;
    const { el, doc } = this;
    const actionbar = this.actionbarEl();
    actionbar && (actionbar.style.display = enable ? '' : 'none');
    el.contentEditable = `${!!enable}`;
    method(el, 'mouseup keyup', this.updateActiveActions);
    method(doc, 'keydown', this.__onKeydown);
    method(doc, 'paste', this.__onPaste);
    this.enabled = enable;

    if (enable) {
      const { event } = opts;
      this.syncActions();
      this.updateActiveActions();

      if (event) {
        let range = null;

        // Still used as caretPositionFromPoint is not yet well adopted
        if (doc.caretRangeFromPoint) {
          const poiner = getPointerEvent(event);
          range = doc.caretRangeFromPoint(poiner.clientX, poiner.clientY);
          // @ts-ignore for Firefox
        } else if (event.rangeParent) {
          range = doc.createRange();
          // @ts-ignore
          range.setStart(event.rangeParent, event.rangeOffset);
        }

        const sel = doc.getSelection();
        sel?.removeAllRanges();
        range && sel?.addRange(range);
      }

      el.focus();
    }

    return this;
  }

  __onKeydown(ev: KeyboardEvent) {
    const { em } = this;
    const { onKeydown } = em.RichTextEditor.getConfig();

    if (onKeydown) {
      return onKeydown({ ev, rte: this, editor: em.getEditor() });
    }

    const { doc } = this;
    const cmdList = ['insertOrderedList', 'insertUnorderedList'];

    if (ev.key === 'Enter' && !cmdList.some((cmd) => doc.queryCommandState(cmd))) {
      doc.execCommand('insertLineBreak');
      ev.preventDefault();
    }
  }

  __onPaste(ev: ClipboardEvent) {
    const { em } = this;
    const { onPaste } = em.RichTextEditor.getConfig();

    if (onPaste) {
      return onPaste({ ev, rte: this, editor: em.getEditor() });
    }

    const clipboardData = ev.clipboardData!;
    const text = clipboardData.getData('text');
    const textHtml = clipboardData.getData('text/html');

    // Replace \n with <br> in case of a plain text
    if (text && !textHtml) {
      ev.preventDefault();
      const html = text.replace(/(?:\r\n|\r|\n)/g, '<br/>');
      this.doc.execCommand('insertHTML', false, html);
    }
  }

  /**
   * Sync actions with the current RTE
   */
  syncActions() {
    this.getActions().forEach((action) => {
      if (this.actionbar) {
        if (!action.state || (action.state && action.state(this, this.doc) >= 0)) {
          const event = action.event || 'click';
          const { btn } = action;
          if (btn) {
            (btn as any)[`on${event}`] = () => {
              action.result(this, action);
              this.updateActiveActions();
            };
          }
        }
      }
    });
  }

  /**
   * Add new action to the actionbar
   * @param {Object} action
   * @param {Object} [opts={}]
   */
  addAction(action: RichTextEditorAction, opts: { sync?: boolean } = {}) {
    const { sync } = opts;
    const actionbar = this.actionbarEl();

    if (actionbar) {
      const { icon, attributes: attr = {} } = action;
      const btn = document.createElement('span');
      btn.className = this.classes.button;
      action.btn = btn;

      for (let key in attr) {
        btn.setAttribute(key, attr[key]);
      }

      if (typeof icon == 'string') {
        btn.innerHTML = icon;
      } else {
        btn.appendChild(icon);
      }

      actionbar.appendChild(btn);
    }

    if (sync) {
      this.actions.push(action);
      this.syncActions();
    }
  }

  /**
   * Get the array of current actions
   * @return {Array}
   */
  getActions() {
    return this.actions;
  }

  /**
   * Returns the Selection instance
   * @return {Selection}
   */
  selection() {
    return this.doc.getSelection();
  }

  /**
   * Wrapper around [execCommand](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand) to allow
   * you to perform operations like `insertText`
   * @param  {string} command Command name
   * @param  {any} [value=null Command's arguments
   */
  exec(command: string, value?: string) {
    this.doc.execCommand(command, false, value);
  }

  /**
   * Get the actionbar element
   * @return {HTMLElement}
   */
  actionbarEl() {
    return this.actionbar;
  }

  /**
   * Set custom HTML to the selection, useful as the default 'insertHTML' command
   * doesn't work in the same way on all browsers
   * @param  {string} value HTML string
   */
  insertHTML(value: string | HTMLElement, { select }: { select?: boolean } = {}) {
    const { em, doc, el } = this;
    const sel = doc.getSelection();

    if (sel && sel.rangeCount) {
      const model = getComponentModel(el) || em.getSelected();
      const node = doc.createElement('div');
      const range = sel.getRangeAt(0);
      range.deleteContents();

      if (isString(value)) {
        node.innerHTML = value;
      } else if (value) {
        node.appendChild(value);
      }

      Array.prototype.slice.call(node.childNodes).forEach((nd) => {
        range.insertNode(nd);
      });

      sel.removeAllRanges();
      sel.addRange(range);
      el.focus();

      if (select && model) {
        model.once('rte:disable', () => {
          const toSel = model.find(`[${customElAttr}]`)[0];
          if (!toSel) return;
          em.setSelected(toSel);
          toSel.removeAttributes(customElAttr);
        });
        model.trigger('disable');
      }
    }
  }
}
