import Backbone from 'backbone';
const PropertyView = require('./PropertyView');
const $ = Backbone.$;

module.exports = PropertyView.extend({
  templateInput(model) {
    const ppfx = this.ppfx;
    const cls = model.get('className');
    const id = model.get('property');
    const value = model.get('value');

    return `
      <div class="${ppfx}field ${ppfx}field-checkbox">
        <input id="${id}" type="checkbox" value="${value}" />
        <label class="${cls}" for="${id}"></label>
      </div>
    `;
  },

  templateLabel(model) {
    const hideName = model.get('hideLabel');
    if (!hideName) return '<b data-clear-style></b>';

    return this.constructor.__super__.templateLabel(model);
  },

  init() {
    const model = this.model;
    this.listenTo(model, 'change:unit', this.modelValueChanged);
    this.listenTo(model, 'el:change', this.elementUpdated);
  },

  setValue(value) {
    const el = this.el.querySelector('input[type=checkbox]');
    el.checked = value === this.model.get('on');
  },

  getInputValue(e) {
    const isOn = this.el.querySelector('input[type=checkbox]').checked;

    if (isOn) return this.model.get('on');

    return this.model.get('off');
  }
});
