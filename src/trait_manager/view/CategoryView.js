import _ from 'underscore';
import Backbone from 'backbone';

module.exports = Backbone.View.extend({
  template: _.template(`
  <div class="<%= ppfx %>title">
    <i class="<%= ppfx %>caret-icon"></i>
    <%= label %>
  </div>
  <div class="<%= pfx %>traits"></div>
  `),

  events: {},

  initialize(o = {}, config = {}) {
    this.config = config;
    this.pfx = config.stylePrefix || '';
    this.ppfx = config.pStylePrefix || '';
    this.caretR = 'fa fa-caret-right';
    this.caretD = 'fa fa-caret-down';
    this.iconClass = `${this.ppfx}caret-icon`;
    this.activeClass = `${this.ppfx}open`;
    this.className = `${this.ppfx}trait-category`;
    this.events[`click .${this.ppfx}title`] = 'toggle';
    this.listenTo(this.model, 'change:open', this.updateVisibility);
    this.delegateEvents();
  },

  updateVisibility() {
    if (this.model.get('open')) this.open();
    else this.close();
  },

  open() {
    this.el.className = `${this.className} ${this.activeClass}`;
    this.getIconEl().className = `${this.iconClass} ${this.caretD}`;
    this.getTraitsEl().style.display = '';
  },

  close() {
    this.el.className = this.className;
    this.getIconEl().className = `${this.iconClass} ${this.caretR}`;
    this.getTraitsEl().style.display = 'none';
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

  getTraitsEl() {
    if (!this.blocksEl) {
      this.blocksEl = this.el.querySelector('.' + this.pfx + 'traits');
    }

    return this.blocksEl;
  },

  append(el) {
    this.getTraitsEl().appendChild(el);
  },

  render() {
    this.el.innerHTML = this.template({
      pfx: this.pfx,
      ppfx: this.ppfx,
      label: this.model.get('label')
    });
    this.el.className = this.className;
    this.$el.css({ order: this.model.get('order') });
    this.updateVisibility();
    return this;
  }
});
