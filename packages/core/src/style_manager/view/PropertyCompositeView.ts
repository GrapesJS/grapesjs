import PropertyView from './PropertyView';
import PropertiesView from './PropertiesView';
import PropertyComposite from '../model/PropertyComposite';

export default class PropertyCompositeView extends PropertyView {
  props?: PropertiesView;

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
    PropertyView.prototype.remove.apply(this, arguments as any);
    return this;
  }

  onValueChange() {}

  onRender() {
    const { pfx } = this;
    const model = this.model as PropertyComposite;
    const props = model.get('properties')!;

    if (props.length && !this.props) {
      const detached = model.isDetached();
      const propsView = new PropertiesView({
        config: {
          ...this.config,
          highlightComputed: detached,
          highlightChanged: detached,
        },
        // @ts-ignore
        collection: props,
        parent: this,
      });
      propsView.render();
      this.$el.find(`#${pfx}input-holder`).append(propsView.el);
      this.props = propsView;
    }
  }

  clearCached() {
    PropertyView.prototype.clearCached.apply(this, arguments as any);
    delete this.props;
  }
}
