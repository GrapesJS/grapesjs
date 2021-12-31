import PropertyCompositeView from './PropertyCompositeView';
import PropertiesView from './PropertiesView';
import LayersView from './LayersView';

export default PropertyCompositeView.extend({
  events() {
    return {
      ...PropertyCompositeView.prototype.events,
      'click [data-add-layer]': 'addLayer',
      change: '',
    };
  },

  templateInput() {
    const { pfx } = this;
    return `
      <div class="${pfx}field ${pfx}stack">
        <button type="button" id="${pfx}add" data-add-layer>+</button>
        <div data-layers-wrapper></div>
      </div>
    `;
  },

  init() {
    const { model } = this;
    this.listenTo(model.getLayers(), 'change', this.updateStatus);
  },

  addLayer() {
    this.model.addLayer({}, { at: 0 });
  },

  /**
   * There is no need to handle input update by the property itself,
   * this will be done by layers
   * @private
   */
  setValue() {},

  remove() {
    this.layersView?.remove();
    PropertyCompositeView.prototype.remove.apply(this, arguments);
  },

  clearCached() {
    PropertyCompositeView.prototype.clearCached.apply(this, arguments);
    this.layersView = null;
  },

  onRender() {
    const { model, el } = this;
    const props = model.getProperties();

    if (props.length && !this.props) {
      const propsView = new PropertiesView({
        config: {
          ...this.config,
          highlightComputed: false,
          highlightChanged: false,
        },
        collection: props,
        parent: this,
      });
      propsView.render();

      const layersView = new LayersView({
        collection: model.getLayers(),
        config: this.config,
        propertyView: this,
      });
      layersView.render();

      const fieldEl = el.querySelector('[data-layers-wrapper]');
      fieldEl.appendChild(layersView.el);
      this.props = propsView;
      this.layersView = layersView;
    }
  },
});
