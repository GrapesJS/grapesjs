import {on, off} from 'utils/mixins'

const ComponentView = require('./ComponentView');

module.exports = ComponentView.extend({

  events: {
    'dblclick': 'enableEditing',
  },

  initialize(o) {
    ComponentView.prototype.initialize.apply(this, arguments);
    this.disableEditing = this.disableEditing.bind(this);
    const model = this.model;
    this.listenTo(model, 'focus active', this.enableEditing);
    this.listenTo(model, 'change:content', this.updateContent);
    this.rte = this.config.rte || '';
    this.activeRte = null;
  },

  /**
   * Enable the component to be editable
   * @param {Event} e
   * @private
   * */
  enableEditing(e) {
    const editable = this.model.get('editable');
    const rte = this.rte;

    if (rte && editable) {
      try {
        this.activeRte = rte.attach(this, this.activeRte);
        rte.focus(this, this.activeRte);
      } catch (err) {
        console.error(err);
      }
    }

    this.toggleEvents(1);
  },

  /**
   * Disable this component to be editable
   * @param {Event}
   * @private
   * */
  disableEditing(e) {
    const model = this.model;
    const editable = model.get('editable');
    const rte = this.rte;

    if (rte && editable) {
      try {
        rte.detach(this, this.activeRte);
      } catch (err) {
        console.error(err);
      }

      const content = this.getChildrenContainer().innerHTML;
      const comps = model.get('components');

      // If there is a custom RTE the content is just baked staticly
      // inside 'content'
      if (rte.customRte) {
        // Avoid double content by removing its children components
        comps.reset();
        model.set('content', content);
      } else {
        const clean = model => {
          model.set({
            highlightable: 0,
            removable: 0,
            draggable: 0,
            copyable: 0,
            toolbar: '',
          });
          model.get('components').each(model => clean(model));
        }

        // Avoid re-render on reset with silent option
        model.set('content', '');
        comps.reset();
        comps.add(content);
        comps.each(model => clean(model));
        // With rerender is possible to see changes applied after clean
        this.render();
      }
    }

    this.toggleEvents();
  },

  /**
   * Isolate disable propagation method
   * @param {Event}
   * @private
   * */
  disablePropagation(e) {
    e.stopPropagation();
  },

  /**
   * Enable/Disable events
   * @param {Boolean} enable
   */
  toggleEvents(enable) {
    var method = enable ? 'on' : 'off';
    const mixins = {on, off};

    // The ownerDocument is from the frame
    var elDocs = [this.el.ownerDocument, document];
    mixins.off(elDocs, 'mousedown', this.disableEditing);
    mixins[method](elDocs, 'mousedown', this.disableEditing);

    // Avoid closing edit mode on component click
    this.$el.off('mousedown', this.disablePropagation);
    this.$el[method]('mousedown', this.disablePropagation);
  },

});
