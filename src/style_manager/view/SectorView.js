import Backbone from 'backbone';
import { template } from 'underscore';
import PropertiesView from './PropertiesView';

export default Backbone.View.extend({
  template: template(`
  <div class="<%= pfx %>title" data-sector-title>
    <i id="<%= pfx %>caret" class="fa"></i>
    <%= label %>
  </div>`),

  events: {
    'click [data-sector-title]': 'toggle'
  },

  initialize(o) {
    this.config = o.config || {};
    this.em = this.config.em;
    this.pfx = this.config.stylePrefix || '';
    this.target = o.target || {};
    this.propTarget = o.propTarget || {};
    this.caretR = 'fa-caret-right';
    this.caretD = 'fa-caret-down';
    const model = this.model;
    this.listenTo(model, 'change:open', this.updateOpen);
    this.listenTo(model, 'updateVisibility', this.updateVisibility);
    this.listenTo(model, 'destroy remove', this.remove);
  },

  /**
   * If all properties are hidden this will hide the sector
   */
  updateVisibility() {
    var show;
    this.model.get('properties').each(prop => {
      if (prop.get('visible')) {
        show = 1;
      }
    });
    this.el.style.display = show ? 'block' : 'none';
  },

  /**
   * Update visibility
   */
  updateOpen() {
    if (this.model.get('open')) this.show();
    else this.hide();
  },

  /**
   * Show the content of the sector
   * */
  show() {
    this.$el.addClass(this.pfx + 'open');
    this.getPropertiesEl().style.display = '';
    this.$caret.removeClass(this.caretR).addClass(this.caretD);
  },

  /**
   * Hide the content of the sector
   * */
  hide() {
    this.$el.removeClass(this.pfx + 'open');
    this.getPropertiesEl().style.display = 'none';
    this.$caret.removeClass(this.caretD).addClass(this.caretR);
  },

  getPropertiesEl() {
    return this.$el.find(`.${this.pfx}properties`).get(0);
  },

  /**
   * Toggle visibility
   * */
  toggle(e) {
    var v = this.model.get('open') ? 0 : 1;
    this.model.set('open', v);
  },

  render() {
    const { pfx, model, em, $el } = this;
    const { id, name } = model.attributes;
    const label = (em && em.t(`styleManager.sectors.${id}`)) || name;
    $el.html(this.template({ pfx, label }));
    this.$caret = $el.find(`#${pfx}caret`);
    this.renderProperties();
    $el.attr('class', `${pfx}sector ${pfx}sector__${id} no-select`);
    this.updateOpen();
    return this;
  },

  renderProperties() {
    var objs = this.model.get('properties');

    if (objs) {
      var view = new PropertiesView({
        collection: objs,
        target: this.target,
        propTarget: this.propTarget,
        config: this.config
      });
      this.$el.append(view.render().el);
    }
  }
});
