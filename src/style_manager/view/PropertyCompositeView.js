import PropertyView from './PropertyView';
import PropertiesView from './PropertiesView';

export default class PropertyCompositeView extends PropertyView {
  templateInput() {
    const { pfx } = this;
    return `
      <div class="${pfx}field ${pfx}composite">
        <span id="${pfx}input-holder"></span>
      </div>
    `;
  }

  remove() {
    this.props?.remove();
    PropertyView.prototype.remove.apply(this, arguments);
  }

  onValueChange() {}

  onRender() {
    const { model, pfx } = this;
    const props = model.get('properties');

    if (props.length && !this.props) {
      const detached = model.isDetached();
      const propsView = new PropertiesView({
        config: {
          ...this.config,
          highlightComputed: detached,
          highlightChanged: detached,
        },
        collection: props,
        parent: this,
      });
      propsView.render();
      this.$el.find(`#${pfx}input-holder`).append(propsView.el);
      this.props = propsView;
    }
  }

  clearCached() {
    PropertyView.prototype.clearCached.apply(this, arguments);
    this.props = null;
  }
}
