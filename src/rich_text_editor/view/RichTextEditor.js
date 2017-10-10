// The initial version of this RTE was borrowed from https://github.com/jaredreich/pell
// and adapted to the GrapesJS's need

const RTE_KEY = '_rte';

const actions = {
  bold: {
    icon: '<b>B</b>',
    title: 'Bold',
    result: (rte) => rte.exec('bold')
  },
  italic: {
    icon: '<i>I</i>',
    title: 'Italic',
    result: (rte) => rte.exec('italic')
  },
  underline: {
    icon: '<u>U</u>',
    title: 'Underline',
    result: (rte) => rte.exec('underline')
  },
  strikethrough: {
    icon: '<strike>S</strike>',
    title: 'Strike-through',
    result: (rte) => rte.exec('strikeThrough')
  },
  link: {
    icon: '&#128279;',
    title: 'Link',
    result: (rte) => {
      const url = window.prompt('Enter the link URL')
      if (url) rte.exec('createLink', url)//class="link"
    }
  },
}

export default class RichTextEditor {

  constructor(settings = {}) {
    const el = settings.element;

    if (el[RTE_KEY]) {
      return el[RTE_KEY];
    }

    el.oninput = e => settings.onChange && settings.onChange(e.target.innerHTML);
    el.onkeydown = e => (e.which === 9 && e.preventDefault());
    el[RTE_KEY] = this;
    this.el = el;
    this.doc = el.ownerDocument;

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
      button: 'button',
    }, ...settings.classes};

    const classes = settings.classes;
    let actionbar = settings.actionbar;
    this.actionbar = actionbar;

    if (!actionbar) {
      const actionbarCont = settings.actionbarContainer;
      actionbar = document.createElement('div');
      actionbar.className = classes.actionbar;
      actionbarCont.appendChild(actionbar);
      this.actionbar = actionbar;
      settings.actions.forEach(action => this.addAction(action))
    }

    this.settings = settings;
    this.classes = classes;
    settings.styleWithCSS && this.exec('styleWithCSS');
    this.syncActions();

    return this;
  }

  enable() {
    this.actionbar().style.display = '';
    this.el.contentEditable = true;
    this.syncActions();
  }

  disable() {
    this.actionbar().style.display = 'none';
    this.el.contentEditable = false;
  }

  /**
   * Sync actions with the current RTE
   */
  syncActions() {
    this.actions().forEach(action => {
      const event = action.event || 'click';
      action.btn[`on${event}`] = e => action.result(this);
    })
  }

  /**
   * Add new action to the actionbar
   * @param {Object} action
   */
  addAction(action) {
    const btn = document.createElement('span');
    const icon = action.icon;
    btn.className = this.classes.button;
    btn.title = action.title;
    action.btn = btn;

    if (typeof icon == 'string') {
      btn.innerHTML = icon;
    } else {
      btn.appendChild(icon);
    }

    this.actionbar().appendChild(btn);
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
    this.doc.getSelection()
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
  actionbar() {
    return this.actionbar;
  }

  /**
   * Set custom HTML to the selection, useful as the default 'insertHTML' command
   * doesn't work in the same way on all browsers
   * @param  {string} value HTML string
   */
  insertHTML(value) {
    const doc = this.doc;
    const sel = doc.getSelection();

    if (sel && sel.rangeCount) {
      const node = doc.createElement('div');
      const range = sel.getRangeAt(0);
      range.collapse(true);
      node.outerHTML = value.replace('${content}', sel);
      range.insertNode(node);

      // Move the caret immediately after the inserted node
      range.setStartAfter(node);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}
