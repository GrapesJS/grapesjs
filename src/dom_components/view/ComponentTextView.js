import { on, off } from 'utils/mixins';
import ComponentView from './ComponentView';

const compProt = ComponentView.prototype;

export default ComponentView.extend({
  events: {
    dblclick: 'onActive',
    input: 'onInput'
  },

  initialize(o) {
    compProt.initialize.apply(this, arguments);
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
  async onActive(e) {
    const { rte, em } = this;

    // We place this before stopPropagation in case of nested
    // text components will not block the editing (#1394)
    if (
      this.rteEnabled ||
      !this.model.get('editable') ||
      (em && em.isEditing())
    ) {
      return;
    }

    e && e.stopPropagation && e.stopPropagation();

    if (rte) {
      try {
        this.activeRte = await rte.enable(this, this.activeRte);
      } catch (err) {
        em.logError(err);
      }
    }

    this.toggleEvents(1);
  },

  onDisable() {
    this.disableEditing();
  },

  /**
   * Disable element content editing
   * @private
   * */
  async disableEditing() {
    const { model, rte, activeRte, em } = this;
    // There are rare cases when disableEditing is called when the view is already removed
    // so, we have to check for the model, this will avoid breaking stuff.
    const editable = model && model.get('editable');

    if (rte) {
      try {
        await rte.disable(this, activeRte);
      } catch (err) {
        em.logError(err);
      }

      editable && this.syncContent();
    }

    this.toggleEvents();
  },

  /**
   * get content from RTE
   * @return string
   */
  getContent() {
    const { activeRte } = this;
    const canGetRteContent =
      activeRte && typeof activeRte.getContent === 'function';

    return canGetRteContent
      ? activeRte.getContent()
      : this.getChildrenContainer().innerHTML;
  },

  /**
   * Merge content from the DOM to the model
   */
  syncContent(opts = {}) {
    const { model, rte, rteEnabled } = this;
    if (!rteEnabled && !opts.force) return;
    const content = this.getContent();
    const comps = model.components();
    const contentOpt = { fromDisable: 1, ...opts };
    model.set('content', '', contentOpt);

    // If there is a custom RTE the content is just baked staticly
    // inside 'content'
    if (rte.customRte) {
      comps.length && comps.reset(null, opts);
      model.set('content', content, contentOpt);
    } else {
      const clean = model => {
        const textable = !!model.get('textable');
        const selectable =
          !['text', 'default', ''].some(type => model.is(type)) || textable;
        model.set(
          {
            _innertext: !selectable,
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

      comps.reset(content, opts);
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
    const evPfx = 'component';
    const ev = [`${evPfx}:update`, `${evPfx}:input`].join(' ');

    // Update toolbars
    em && em.trigger(ev, this.model);
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
    const { em, model, $el } = this;
    const mixins = { on, off };
    const method = enable ? 'on' : 'off';
    em.setEditing(enable ? this : 0);
    this.rteEnabled = !!enable;

    // The ownerDocument is from the frame
    var elDocs = [this.el.ownerDocument, document];
    mixins.off(elDocs, 'mousedown', this.disableEditing);
    mixins[method](elDocs, 'mousedown', this.disableEditing);
    em[method]('toolbar:run:before', this.disableEditing);
    if (model) {
      model[method]('removed', this.disableEditing);
      model.trigger(`rte:${enable ? 'enable' : 'disable'}`);
    }

    // Avoid closing edit mode on component click
    $el && $el.off('mousedown', this.disablePropagation);
    $el && $el[method]('mousedown', this.disablePropagation);

    // Fixes #2210 but use this also as a replacement
    // of this fix: bd7b804f3b46eb45b4398304b2345ce870f232d2
    if (this.config.draggableComponents) {
      let { el } = this;

      while (el) {
        el.draggable = enable ? !1 : !0;
        // Note: el.parentNode is sometimes null here
        el = el.parentNode;
        el && el.tagName == 'BODY' && (el = 0);
      }
    }
  }
});
