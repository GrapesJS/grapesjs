import { keys } from 'underscore';
import { View } from 'backbone';

export default View.extend({
  events: {
    click: 'active',
    'click [data-close-layer]': 'removeItem',
    'mousedown [data-move-layer]': 'initSorter',
    'touchstart [data-move-layer]': 'initSorter',
  },

  template() {
    const { pfx, ppfx } = this;
    const icons = this.em?.getConfig('icons');
    const iconClose = icons?.close || '&Cross;';
    const iconMove = icons?.move || '';

    return `
      <div class="${pfx}label-wrp">
        <div id="${pfx}move" class="${ppfx}no-touch-actions" data-move-layer>
          ${iconMove}
        </div>
        <div id="${pfx}label" data-label></div>
        <div id="${pfx}preview-box" style="display: none" data-preview-box>
          <div id="${pfx}preview" data-preview></div>
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
    this.pModel = this.propertyView.model;
    this.listenTo(model, 'destroy remove', this.remove);
    this.listenTo(model, 'change:active', this.updateVisibility);
    this.listenTo(model, 'change:values', this.updateLabel);

    // For the sorter
    model.view = this;
    model.set({ droppable: 0, draggable: 1 });
    this.$el.data('model', model);
  },

  /**
   * Delegate sorting
   * @param  {Event} e
   * */
  initSorter(e) {
    if (this.sorter) this.sorter.startSort(this.el);
  },

  removeItem(ev) {
    ev && ev.stopPropagation();
    this.remove();
  },

  remove() {
    this.pModel.removeLayer(this.model);
    View.prototype.remove.apply(this, arguments);
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

  active() {
    const { model, propertyView } = this;
    const pm = propertyView.model;
    if (pm.getSelectedLayer() === model) return;
    pm.selectLayer(model);
    model.collection.active(model.getIndex());
  },

  updateVisibility() {
    const { pfx, model, propertyView } = this;
    const wrapEl = this.getPropertiesWrapper();
    const active = model.get('active');
    wrapEl.style.display = active ? '' : 'none';
    this.$el[active ? 'addClass' : 'removeClass'](`${pfx}active`);
    active && wrapEl.appendChild(propertyView.props.el);
  },

  updateLabel() {
    const { model, pModel } = this;
    const label = pModel.getLayerLabel(model);
    this.getLabelEl().innerHTML = label;

    if (pModel.get('preview')) {
      const prvEl = this.getPreviewEl();
      const style = pModel.getStylePreview(model, { number: { min: -3, max: 3 } });
      const styleStr = keys(style)
        .map(k => `${k}:${style[k]}`)
        .join(';');
      prvEl.setAttribute('style', styleStr);
    }
  },

  render() {
    const { el, pfx, pModel } = this;
    el.innerHTML = this.template();
    el.className = `${pfx}layer`;
    if (pModel.get('preview')) {
      el.querySelector(`[data-preview-box]`).style.display = '';
    }
    this.updateLabel();
    this.updateVisibility();
    return this;
  },
});
