import { on, off } from 'utils/mixins';

const ComponentView = require('./ComponentView');

module.exports = ComponentView.extend({
  events: {
    dblclick: 'enableEditing',
    input: 'onInput'
  },

  initialize(o) {
    ComponentView.prototype.initialize.apply(this, arguments);
    this.disableEditing = this.disableEditing.bind(this);
    const model = this.model;
    const em = this.em;
    this.listenTo(model, 'focus active', this.enableEditing);
    this.listenTo(model, 'change:content', this.updateContent);
    this.rte = em && em.get('RichTextEditor');
  },

  /**
   * Enable element content editing
   * @private
   * */
  enableEditing() {
    const rte = this.rte;

    if (this.rteEnabled || !this.model.get('editable')) {
      return;
    }

    if (rte) {
      try {
        this.activeRte = rte.enable(this, this.activeRte);
      } catch (err) {
        console.error(err);
      }
    }

    this.rteEnabled = 1;
    this.toggleEvents(1);
  },

  /**
   * Disable element content editing
   * @private
   * */
  disableEditing() {
    const model = this.model;
    const editable = model.get('editable');
    const rte = this.rte;

    if (rte && editable) {
      try {
        rte.disable(this, this.activeRte);
      } catch (err) {
        console.error(err);
      }

      const content = this.getChildrenContainer().innerHTML;
      const comps = model.get('components');
      comps.length && comps.reset();
      model.set('content', '');

      // If there is a custom RTE the content is just baked staticly
      // inside 'content'
      if (rte.customRte) {
        // Avoid double content by removing its children components
        // and force to trigger change
        model.set('content', content);
      } else {
        const clean = model => {
          model.set({
            editable: 0,
            highlightable: 0,
            removable: 0,
            draggable: 0,
            copyable: 0,
            toolbar: ''
          });
          model.get('components').each(model => clean(model));
        };

        // Avoid re-render on reset with silent option
        model.trigger('change:content', model);
        comps.add(content);
        comps.each(model => clean(model));
        comps.trigger('resetNavigator');
      }
    }

    this.rteEnabled = 0;
    this.toggleEvents();
  },

  /**
   * Callback on input event
   * @param  {Event} e
   */
  onInput(e) {
    const { em } = this;

    // Update toolbars
    em && em.trigger('change:canvasOffset');
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
    const mixins = { on, off };
    this.em.setEditing(enable);

    // The ownerDocument is from the frame
    var elDocs = [this.el.ownerDocument, document];
    mixins.off(elDocs, 'mousedown', this.disableEditing);
    mixins[method](elDocs, 'mousedown', this.disableEditing);

    // Avoid closing edit mode on component click
    this.$el.off('mousedown', this.disablePropagation);
    this.$el[method]('mousedown', this.disablePropagation);
  }
});
