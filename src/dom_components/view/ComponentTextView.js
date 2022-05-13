import { on, off, getModel } from 'utils/mixins';
import ComponentView from './ComponentView';
import { bindAll } from 'underscore';

const compProt = ComponentView.prototype;

export default class ComponentTextView extends ComponentView {
  events() {
    return {
      dblclick: 'onActive',
      input: 'onInput',
    };
  }

  initialize(o) {
    compProt.initialize.apply(this, arguments);
    bindAll(this, 'disableEditing', 'onDisable');
    const model = this.model;
    const em = this.em;
    this.listenTo(model, 'focus', this.onActive);
    this.listenTo(model, 'change:content', this.updateContentText);
    this.listenTo(model, 'sync:content', this.syncContent);
    this.rte = em && em.get('RichTextEditor');
  }

  updateContentText(m, v, opts = {}) {
    !opts.fromDisable && this.disableEditing();
  }

  canActivate() {
    const { model, rteEnabled, em } = this;
    const modelInEdit = em?.getEditing();
    const sameInEdit = modelInEdit === model;
    let result = true;
    let isInnerText = false;
    let delegate;

    if (rteEnabled || !model.get('editable') || sameInEdit || (isInnerText = model.isChildOf('text'))) {
      result = false;
      // If the current is inner text, select the closest text
      if (isInnerText && !model.get('textable')) {
        let parent = model.parent();

        while (parent && !parent.isInstanceOf('text')) {
          parent = parent.parent();
        }

        if (parent && parent.get('editable')) {
          delegate = parent;
        } else {
          result = true;
        }
      }
    }

    return { result, delegate };
  }

  /**
   * Enable element content editing
   * @private
   * */
  async onActive(ev) {
    const { rte, em } = this;
    const { result, delegate } = this.canActivate();

    // We place this before stopPropagation in case of nested
    // text components will not block the editing (#1394)
    if (!result) {
      if (delegate) {
        ev?.stopPropagation?.();
        em.setSelected(delegate);
        delegate.trigger('active', ev);
      }
      return;
    }

    ev?.stopPropagation?.();
    this.lastContent = this.getContent();

    if (rte) {
      try {
        this.activeRte = await rte.enable(this, this.activeRte, { event: ev });
      } catch (err) {
        em.logError(err);
      }
    }

    this.toggleEvents(1);
  }

  onDisable() {
    this.disableEditing();
  }

  /**
   * Disable element content editing
   * @private
   * */
  async disableEditing(opts = {}) {
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

      if (editable && this.getContent() !== this.lastContent) {
        this.syncContent(opts);
        this.lastContent = '';
      }
    }

    this.toggleEvents();
  }

  /**
   * get content from RTE
   * @return string
   */
  getContent() {
    const { activeRte } = this;
    const canGetRteContent = activeRte && typeof activeRte.getContent === 'function';

    return canGetRteContent ? activeRte.getContent() : this.getChildrenContainer().innerHTML;
  }

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
      comps.resetFromString(content, opts);
    }
  }

  insertComponent(content, opts = {}) {
    const { model, el } = this;
    const doc = el.ownerDocument;
    const selection = doc.getSelection();

    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      const textNode = range.startContainer;
      const offset = range.startOffset;
      const textModel = getModel(textNode);
      const newCmps = [];

      if (textModel && textModel.is?.('textnode')) {
        const cmps = textModel.collection;
        cmps.forEach(cmp => {
          if (cmp === textModel) {
            const type = 'textnode';
            const cnt = cmp.get('content');
            newCmps.push({ type, content: cnt.slice(0, offset) });
            newCmps.push(content);
            newCmps.push({ type, content: cnt.slice(offset) });
          } else {
            newCmps.push(cmp);
          }
        });

        const result = newCmps.filter(Boolean);
        const index = result.indexOf(content);
        cmps.reset(result, opts);

        return cmps.at(index);
      }
    }

    return model.append(content, opts);
  }

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
  }

  /**
   * Isolate disable propagation method
   * @param {Event}
   * @private
   * */
  disablePropagation(e) {
    e.stopPropagation();
  }

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
    mixins.off(elDocs, 'mousedown', this.onDisable);
    mixins[method](elDocs, 'mousedown', this.onDisable);
    em[method]('toolbar:run:before', this.onDisable);
    if (model) {
      model[method]('removed', this.onDisable);
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
}
