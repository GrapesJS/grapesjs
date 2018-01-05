var Backbone = require('backbone');
var pluralize = require('pluralize');

module.exports = Backbone.View.extend({

  template: _.template(`
  <div class="<%= pfx %>title">
    <i class="<%= pfx %>caret-icon"></i>
    <%= label %>
  </div>
  <div class="<%= pfx %><%= typePlural %>-c"></div>
  `),

  events: {},

  initialize(o = {}, config = {}) {
    this.config = config;
    const pfx = this.config.pStylePrefix || '';
    this.pfx = pfx;
    this.type = this.model.get('type') || '';
    this.caretR = 'fa fa-caret-right';
    this.caretD = 'fa fa-caret-down';
    this.iconClass = `${pfx}caret-icon`;
    this.activeClass = `${pfx}open`;
    this.className = `${pfx}${this.type}-category`;
    this.events[`click .${pfx}title`]  = 'toggle';
    this.listenTo(this.model, 'change:open', this.updateVisibility);
    this.delegateEvents();
  },

  updateVisibility() {
    if(this.model.get('open'))
      this.open();
    else
      this.close();
  },

  open() {
    this.el.className = `${this.className} ${this.activeClass}`;
    this.getIconEl().className = `${this.iconClass} ${this.caretD}`;
    this.getContentEl().style.display = '';
  },

  close() {
    this.el.className = this.className;
    this.getIconEl().className = `${this.iconClass} ${this.caretR}`;
    this.getContentEl().style.display = 'none';
  },

  toggle() {
    var model = this.model;
    model.set('open', !model.get('open'));
  },

  getIconEl() {
    if (!this.iconEl) {
      this.iconEl = this.el.querySelector('.' + this.iconClass);
    }

    return this.iconEl;
  },

  getContentEl() {
    if (!this.contentEl) {
      this.contentEl = this.el.querySelector('.' + this.pfx + pluralize(this.type) + '-c');
    }

    return this.contentEl;
  },

  append(el) {
    this.getContentEl().appendChild(el);
  },

  render() {
    this.el.innerHTML = this.template({
      pfx: this.pfx,
      type: this.type,
      typePlural: pluralize(this.type),
      label: this.model.get('label'),
    });
    this.el.className = this.className;
    this.updateVisibility();
    return this;
  },
});
