// The initial version of this RTE was borrowed from https://github.com/jaredreich/pell
// and adapted to the GrapesJS's need

import { on, off } from 'utils/mixins';

const RTE_KEY = '_rte';

const btnState = {
  ACTIVE: 1,
  INACTIVE: 0,
  DISABLED: -1
};
const isValidAnchor = rte => {
  const anchor = rte.selection().anchorNode;
  const parentNode = anchor && anchor.parentNode;
  const nextSibling = anchor && anchor.nextSibling;
  return (
    (parentNode && parentNode.nodeName == 'A') ||
    (nextSibling && nextSibling.nodeName == 'A')
  );
};
const defActions = {
  bold: {
    name: 'bold',
    icon: '<b>B</b>',
    attributes: { title: 'Bold' },
    result: rte => rte.exec('bold')
  },
  italic: {
    name: 'italic',
    icon: '<i>I</i>',
    attributes: { title: 'Italic' },
    result: rte => rte.exec('italic')
  },
  underline: {
    name: 'underline',
    icon: '<u>U</u>',
    attributes: { title: 'Underline' },
    result: rte => rte.exec('underline')
  },
  strikethrough: {
    name: 'strikethrough',
    icon: '<s>S</s>',
    attributes: { title: 'Strike-through' },
    result: rte => rte.exec('strikeThrough')
  },
  link: {
    icon: `<span style="transform:rotate(45deg)">&supdsub;</span>`,
    name: 'link',
    attributes: {
      style: 'font-size:1.4rem;padding:0 4px 2px;',
      title: 'Link'
    },
    state: (rte, doc) => {
      if (rte && rte.selection()) {
        return isValidAnchor(rte) ? btnState.ACTIVE : btnState.INACTIVE;
      } else {
        return btnState.INACTIVE;
      }
    },
    result: rte => {
      if (isValidAnchor(rte)) {
        rte.exec('unlink');
      } else {
        rte.insertHTML(`<a class="link" href="">${rte.selection()}</a>`);
      }
    }
  }
};

export default class RichTextEditor {
  constructor(settings = {}) {
    const el = settings.el;

    if (el[RTE_KEY]) {
      return el[RTE_KEY];
    }

    el[RTE_KEY] = this;
    this.setEl(el);
    this.updateActiveActions = this.updateActiveActions.bind(this);

    const acts = (settings.actions || []).map(action => {
      let result = action;
      if (typeof action === 'string') {
        result = { ...defActions[action] };
      } else if (defActions[action.name]) {
        result = { ...defActions[action.name], ...action };
      }
      return result;
    });
    const actions = acts.length
      ? acts
      : Object.keys(defActions).map(a => defActions[a]);

    settings.classes = {
      ...{
        actionbar: 'actionbar',
        button: 'action',
        active: 'active',
        disabled: 'disabled',
        inactive: 'inactive'
      },
      ...settings.classes
    };

    const classes = settings.classes;
    let actionbar = settings.actionbar;
    this.actionbar = actionbar;
    this.settings = settings;
    this.classes = classes;
    this.actions = actions;

    if (!actionbar) {
      const actionbarCont = settings.actionbarContainer;
      actionbar = document.createElement('div');
      actionbar.className = classes.actionbar;
      actionbarCont.appendChild(actionbar);
      this.actionbar = actionbar;
      actions.forEach(action => this.addAction(action));
    }

    settings.styleWithCSS && this.exec('styleWithCSS');
    this.syncActions();

    return this;
  }

  destroy() {
    this.el = 0;
    this.doc = 0;
    this.actionbar = 0;
    this.settings = {};
    this.classes = {};
    this.actions = [];
  }

  setEl(el) {
    this.el = el;
    this.doc = el.ownerDocument;
  }

  updateActiveActions() {
    this.getActions().forEach(action => {
      const btn = action.btn;
      const update = action.update;
      const { active, inactive, disabled } = { ...this.classes };
      const state = action.state;
      const name = action.name;
      const doc = this.doc;
      btn.className = btn.className.replace(active, '').trim();
      btn.className = btn.className.replace(inactive, '').trim();
      btn.className = btn.className.replace(disabled, '').trim();

      // if there is a state function, which depicts the state,
      // i.e. `active`, `disabled`, then call it
      if (state) {
        switch (state(this, doc)) {
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
      } else {
        // otherwise default to checking if the name command is supported & enabled
        if (doc.queryCommandSupported(name) && doc.queryCommandState(name)) {
          btn.className += ` ${active}`;
        }
      }
      update && update(this, action);
    });
  }

  enable() {
    if (this.enabled) {
      return this;
    }

    this.actionbarEl().style.display = '';
    this.el.contentEditable = true;
    on(this.el, 'mouseup keyup', this.updateActiveActions);
    this.syncActions();
    this.updateActiveActions();
    this.el.focus();
    this.enabled = 1;
    return this;
  }

  disable() {
    this.actionbarEl().style.display = 'none';
    this.el.contentEditable = false;
    off(this.el, 'mouseup keyup', this.updateActiveActions);
    this.enabled = 0;
    return this;
  }

  /**
   * Sync actions with the current RTE
   */
  syncActions() {
    this.getActions().forEach(action => {
      if (this.settings.actionbar) {
        if (
          !action.state ||
          (action.state && action.state(this, this.doc) >= 0)
        ) {
          const event = action.event || 'click';
          action.btn[`on${event}`] = e => {
            action.result(this, action);
            this.updateActiveActions();
          };
        }
      }
    });
  }

  /**
   * Add new action to the actionbar
   * @param {Object} action
   * @param {Object} [opts={}]
   */
  addAction(action, opts = {}) {
    const sync = opts.sync;
    const btn = document.createElement('span');
    const icon = action.icon;
    const attr = action.attributes || {};
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

    this.actionbarEl().appendChild(btn);

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
   * Execute the command
   * @param  {string} command Command name
   * @param  {any} [value=null Command's arguments
   */
  exec(command, value = null) {
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
  insertHTML(value) {
    let lastNode;
    const doc = this.doc;
    const sel = doc.getSelection();

    if (sel && sel.rangeCount) {
      const node = doc.createElement('div');
      const range = sel.getRangeAt(0);
      range.deleteContents();
      node.innerHTML = value;
      Array.prototype.slice.call(node.childNodes).forEach(nd => {
        range.insertNode(nd);
        lastNode = nd;
      });

      sel.removeAllRanges();
      sel.addRange(range);
      this.el.focus();
    }
  }
}
