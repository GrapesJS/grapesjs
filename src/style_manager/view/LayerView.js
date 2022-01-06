import { keys } from 'underscore';
import { View } from 'backbone';

export default View.extend({
  events: {
    click: 'select',
    'click [data-close-layer]': 'removeItem',
    'mousedown [data-move-layer]': 'initSorter',
    'touchstart [data-move-layer]': 'initSorter',
  },

  template() {
    const { pfx, ppfx } = this;
    const icons = this.em?.getConfig('icons');
    const iconClose = icons?.close || '';
    const iconMove = icons?.move || '';

    return `
      <div class="${pfx}label-wrp">
        <div id="${pfx}move" class="${ppfx}no-touch-actions" data-move-layer>
          ${iconMove}
        </div>
        <div id="${pfx}label" data-label></div>
        <div id="${pfx}preview-box" class="${pfx}layer-preview" style="display: none" data-preview-box>
          <div id="${pfx}preview" class="${pfx}layer-preview-cnt" data-preview></div>
        </div>
        <div id="${pfx}close-layer" class="${pfx}btn-close" data-close-layer>
          ${iconClose}
        </div>
      </div>
      <div id="${pfx}inputs" data-properties></div>
    `;
  },

  initialize(o = {}) {
    const { model } = this;
    this.stackModel = o.stackModel;
    this.propertyView = o.propertyView;
    this.config = o.config || {};
    this.em = this.config.em;
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    this.sorter = o.sorter || null;
    this.propsConfig = o.propsConfig || {};
    const pModel = this.propertyView.model;
    this.listenTo(model, 'destroy remove', this.remove);
    this.listenTo(pModel, 'change:selectedLayer', this.updateVisibility);
    this.listenTo(model, 'change:values', this.updateLabel);

    // For the sorter
    model.view = this;
    model.set({ droppable: 0, draggable: 1 });
    this.$el.data('model', model);
  },

  initSorter() {
    if (this.sorter) this.sorter.startSort(this.el);
  },

  removeItem(ev) {
    ev && ev.stopPropagation();
    this.model.remove();
  },

  getPropertiesWrapper() {
    if (!this.propsWrapEl) {
      this.propsWrapEl = this.el.querySelector('[data-properties]');
    }
    return this.propsWrapEl;
  },

  getPreviewEl() {
    if (!this.previewEl) {
      this.previewEl = this.el.querySelector('[data-preview]');
    }
    return this.previewEl;
  },

  getLabelEl() {
    if (!this.labelEl) {
      this.labelEl = this.el.querySelector('[data-label]');
    }
    return this.labelEl;
  },

  select() {
    this.model.select();
  },

  updateVisibility() {
    const { pfx, model, propertyView } = this;
    const wrapEl = this.getPropertiesWrapper();
    const isSelected = model.isSelected();
    wrapEl.style.display = isSelected ? '' : 'none';
    this.$el[isSelected ? 'addClass' : 'removeClass'](`${pfx}active`);
    isSelected && wrapEl.appendChild(propertyView.props.el);
  },

  updateLabel() {
    const { model } = this;
    const label = model.getLabel();
    this.getLabelEl().innerHTML = label;

    if (model.hasPreview()) {
      const prvEl = this.getPreviewEl();
      const style = model.getStylePreview({ number: { min: -3, max: 3 } });
      const styleStr = keys(style)
        .map(k => `${k}:${style[k]}`)
        .join(';');
      prvEl.setAttribute('style', styleStr);
    }
  },

  render() {
    const { el, pfx, model } = this;
    el.innerHTML = this.template();
    el.className = `${pfx}layer`;
    if (model.hasPreview()) {
      el.querySelector(`[data-preview-box]`).style.display = '';
    }
    this.updateLabel();
    this.updateVisibility();
    return this;
  },
});
