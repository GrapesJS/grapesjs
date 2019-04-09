import { on, off } from 'utils/mixins';

const ComponentView = require('./ComponentView');

module.exports = ComponentView.extend({
  events: {
    dblclick: 'onActive',
    input: 'onInput'
  },

  initialize(o) {
    ComponentView.prototype.initialize.apply(this, arguments);
    this.disableEditing = this.disableEditing.bind(this);
    const model = this.model;
    const em = this.em;
    this.listenTo(model, 'focus', this.onActive);
    this.listenTo(model, 'change:content', this.updateContentText);
    this.listenTo(model, 'sync:content', this.syncContent);
    this.rte = em && em.get('RichTextEditor');
  },

  updateContentText(m, v, opts = {}) {
    !opts.fromDisable && this.disableEditing();
  },

  /**
   * Enable element content editing
   * @private
   * */
  onActive(e) {
    // We place this before stopPropagation in case of nested
    // text components will not block the editing (#1394)
    if (this.rteEnabled || !this.model.get('editable')) {
      return;
    }
    e && e.stopPropagation && e.stopPropagation();
    const rte = this.rte;

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
    const { model, rte, activeRte } = this;
    const editable = model.get('editable');

    if (rte && editable) {
      try {
        rte.disable(this, activeRte);
      } catch (err) {
        console.error(err);
      }

      this.syncContent();
    }

    this.rteEnabled = 0;
    this.toggleEvents();
  },

  /**
   * Merge content from the DOM to the model
   */
  syncContent(opts = {}) {
    const { model, rte, rteEnabled } = this;
    if (!rteEnabled && !opts.force) return;
    const content = this.getChildrenContainer().innerHTML;
    const comps = model.components();
    const contentOpt = { fromDisable: 1, ...opts };
    comps.length && comps.reset(null, opts);
    model.set('content', '', contentOpt);

    // If there is a custom RTE the content is just baked staticly
    // inside 'content'
    if (rte.customRte) {
      model.set('content', content, contentOpt);
    } else {
      const clean = model => {
        const textable = !!model.get('textable');
        const selectable =
          !['text', 'default', ''].some(type => model.is(type)) || textable;
        model.set(
          {
            editable: selectable && model.get('editable'),
            selectable: selectable,
            hoverable: selectable,
            removable: textable,
            draggable: textable,
            highlightable: 0,
            copyable: textable,
            ...(!textable && { toolbar: '' })
          },
          opts
        );
        model.get('components').each(model => clean(model));
      };

      // Avoid re-render on reset with silent option
      !opts.silent && model.trigger('change:content', model, '', contentOpt);
      comps.add(content, opts);
      comps.each(model => clean(model));
      comps.trigger('resetNavigator');
    }
  },

  /**
   * Callback on input event
   * @param  {Event} e
   */
  onInput() {
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
