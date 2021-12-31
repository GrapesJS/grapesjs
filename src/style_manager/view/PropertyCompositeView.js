import PropertyView from './PropertyView';
import PropertiesView from './PropertiesView';

export default PropertyView.extend({
  templateInput() {
    const { pfx } = this;
    return `
      <div class="${pfx}field ${pfx}composite">
        <span id="${pfx}input-holder"></span>
      </div>
    `;
  },

  inputValueChanged(...args) {
    // If it's not detached (eg. 'padding: 1px 2px 3px 4px;') it will follow the same flow of the PropertyView
    if (!this.model.isDetached()) {
      PropertyView.prototype.inputValueChanged.apply(this, args);
    }
  },

  remove() {
    this.props?.remove();
    PropertyView.prototype.remove.apply(this, arguments);
  },

  onRender() {
    const { model, pfx } = this;
    const props = model.getProperties();

    if (props.length && !this.props) {
      const propsView = new PropertiesView({
        config: { ...this.config, highlightComputed: 0 },
        collection: props,
      });
      propsView.render();
      this.$el.find(`#${pfx}input-holder`).append(propsView.el);
      this.props = propsView;
    }
  },

  clearCached() {
    PropertyView.prototype.clearCached.apply(this, arguments);
    this.props = null;
  },
});
