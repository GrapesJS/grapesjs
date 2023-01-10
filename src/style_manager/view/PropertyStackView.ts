import PropertyCompositeView from './PropertyCompositeView';
import PropertiesView from './PropertiesView';
import LayersView from './LayersView';
import PropertyStack from '../model/PropertyStack';

export default class PropertyStackView extends PropertyCompositeView {
  // @ts-ignore
  model: PropertyStack;
  layersView?: LayersView;

  events() {
    return {
      ...PropertyCompositeView.prototype.events(),
      'click [data-add-layer]': 'addLayer',
      change: '',
    };
  }

  templateInput() {
    const { pfx, em } = this;
    const icons = em?.getConfig().icons;
    const iconPlus = icons?.plus || '+';
    return `
      <div class="${pfx}field ${pfx}stack">
        <button type="button" id="${pfx}add" data-add-layer>
          ${iconPlus}
        </button>
        <div data-layers-wrapper></div>
      </div>
    `;
  }

  init() {
    const { model } = this;
    this.listenTo(model.__getLayers(), 'change reset', this.updateStatus);
  }

  addLayer() {
    this.model.addLayer({}, { at: 0 });
  }

  /**
   * There is no need to handle input update by the property itself,
   * this will be done by layers
   * @private
   */
  setValue() {}

  remove() {
    this.layersView?.remove();
    PropertyCompositeView.prototype.remove.apply(this, arguments as any);
    return this;
  }

  clearCached() {
    PropertyCompositeView.prototype.clearCached.apply(this, arguments as any);
    delete this.layersView;
  }

  onRender() {
    const { model, el, config } = this;
    const props = model.get('properties')!;

    if (props.length && !this.props) {
      const propsView = new PropertiesView({
        config: {
          ...config,
          highlightComputed: false,
          highlightChanged: false,
        },
        // @ts-ignore
        collection: props,
        parent: this,
      });
      propsView.render();

      const layersView = new LayersView({
        collection: model.__getLayers(),
        // @ts-ignore
        config,
        propertyView: this,
      });
      layersView.render();

      const fieldEl = el.querySelector('[data-layers-wrapper]')!;
      fieldEl.appendChild(layersView.el);
      this.props = propsView;
      this.layersView = layersView;
    }
  }
}
