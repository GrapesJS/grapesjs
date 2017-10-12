// The initial version of this RTE was borrowed from https://github.com/jaredreich/pell
// and adapted to the GrapesJS's need

import {on, off} from 'utils/mixins'

const RTE_KEY = '_rte';

const actions = {
  bold: {
    name: 'bold',
    icon: '<b>B</b>',
    attributes: {title: 'Bold'},
    result: (rte) => rte.exec('bold')
  },
  italic: {
    name: 'italic',
    icon: '<i>I</i>',
    attributes: {title: 'Italic'},
    result: (rte) => rte.exec('italic')
  },
  underline: {
    name: 'underline',
    icon: '<u>U</u>',
    attributes: {title: 'Underline'},
    result: (rte) => rte.exec('underline')
  },
  strikethrough: {
    name: 'strikethrough',
    icon: '<strike>S</strike>',
    attributes: {title: 'Strike-through'},
    result: (rte) => rte.exec('strikeThrough')
  },
  link: {
    icon: `<span style="transform:rotate(45deg)">&supdsub;</span>`,
    attributes: {
      style: 'font-size:1.4rem;padding:0 4px 2px;',
      title: 'Link',
    },
    result: (rte) => rte.insertHTML(`<a class="link" href="">${rte.selection()}</a>`)
  },
}

export default class RichTextEditor {

  constructor(settings = {}) {
    const el = settings.el;

    if (el[RTE_KEY]) {
      return el[RTE_KEY];
    }

    //el.oninput = e => settings.onChange && settings.onChange(e.target.innerHTML);
    //el.onkeydown = e => (e.which === 9 && e.preventDefault());
    el[RTE_KEY] = this;
    this.el = el;
    this.doc = el.ownerDocument;
    this.updateActiveActions = this.updateActiveActions.bind(this);

    settings.actions = settings.actions
      ? settings.actions.map(action => {
        if (typeof action === 'string') {
          return actions[action];
        } else if (actions[action.name]) {
          return {...actions[action.name], ...action};
        }
        return action;
      }) : Object.keys(actions).map(action => actions[action])

    settings.classes = { ...{
      actionbar: 'actionbar',
      button: 'action',
      active: 'active',
    }, ...settings.classes};

    const classes = settings.classes;
    let actionbar = settings.actionbar;
    this.actionbar = actionbar;
    this.settings = settings;
    this.classes = classes;

    if (!actionbar) {
      const actionbarCont = settings.actionbarContainer;
      actionbar = document.createElement('div');
      actionbar.className = classes.actionbar;
      actionbarCont.appendChild(actionbar);
      this.actionbar = actionbar;
      settings.actions.forEach(action => this.addAction(action))
    }

    settings.styleWithCSS && this.exec('styleWithCSS');
    this.syncActions();

    return this;
  }

  updateActiveActions() {
    this.actions().forEach(action => {
      const btn = action.btn;
      const active = this.classes.active;
      btn.className = btn.className.replace(active, '').trim();

      if (this.doc.queryCommandState(action.name)) {
        btn.className += ` ${active}`;
      }
    })
  }

  enable() {
    this.actionbarEl().style.display = '';
    this.el.contentEditable = true;
    on(this.el, 'mouseup keyup', this.updateActiveActions)
    this.syncActions();
    this.el.focus();
    return this;
  }

  disable() {
    this.actionbarEl().style.display = 'none';
    this.el.contentEditable = false;
    off(this.el, 'mouseup keyup', this.updateActiveActions)
    return this;
  }

  /**
   * Sync actions with the current RTE
   */
  syncActions() {
    this.actions().forEach(action => {
      const event = action.event || 'click';
      action.btn[`on${event}`] = e => {
        action.result(this);
        this.updateActiveActions();
      };
    })
  }

  /**
   * Add new action to the actionbar
   * @param {Object} action
   */
  addAction(action) {
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
  }

  /**
   * Get the array of current actions
   * @return {Array}
   */
  actions() {
    return this.settings.actions;
  }

  /**
   * Returns the Selection instance
   * @return {Selection}
   */
  selection() {
    return this.doc.getSelection()
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
      })

      sel.removeAllRanges();
      sel.addRange(range);
      this.el.focus();
    }
  }
}
