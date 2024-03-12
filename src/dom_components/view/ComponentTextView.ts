import { bindAll } from 'underscore';
import { AddOptions, DisableOptions, ObjectAny } from '../../common';
import RichTextEditorModule from '../../rich_text_editor';
import RichTextEditor from '../../rich_text_editor/model/RichTextEditor';
import { off, on } from '../../utils/dom';
import { getComponentModel } from '../../utils/mixins';
import Component from '../model/Component';
import { getComponentIds } from '../model/Components';
import ComponentText from '../model/ComponentText';
import { ComponentDefinition } from '../model/types';
import ComponentView from './ComponentView';

export default class ComponentTextView<TComp extends ComponentText = ComponentText> extends ComponentView<TComp> {
  rte?: RichTextEditorModule;
  rteEnabled?: boolean;
  activeRte?: RichTextEditor;
  lastContent?: string;

  events() {
    return {
      dblclick: 'onActive',
      input: 'onInput',
    };
  }

  initialize(props: any) {
    super.initialize(props);
    bindAll(this, 'disableEditing', 'onDisable');
    const model = this.model;
    const em = this.em;
    this.listenTo(model, 'focus', this.onActive);
    this.listenTo(model, 'change:content', this.updateContentText);
    this.listenTo(model, 'sync:content', this.syncContent);
    this.rte = em?.RichTextEditor;
  }

  updateContentText(m: any, v: any, opts: { fromDisable?: boolean } = {}) {
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
  async onActive(ev: Event) {
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
    this.lastContent = await this.getContent();

    if (rte) {
      try {
        this.activeRte = await rte.enable(this, this.activeRte!, { event: ev });
      } catch (err) {
        em.logError(err as any);
      }
    }

    this.toggleEvents(true);
  }

  onDisable(opts?: DisableOptions) {
    this.disableEditing(opts);
  }

  /**
   * Disable element content editing
   * @private
   * */
  async disableEditing(opts: DisableOptions = {}) {
    const { model, rte, activeRte, em } = this;
    // There are rare cases when disableEditing is called when the view is already removed
    // so, we have to check for the model, this will avoid breaking stuff.
    const editable = model && model.get('editable');

    if (rte) {
      try {
        await rte.disable(this, activeRte, opts);
      } catch (err) {
        em.logError(err as any);
      }

      if (editable && (await this.getContent()) !== this.lastContent) {
        await this.syncContent(opts);
        this.lastContent = '';
      }
    }

    this.toggleEvents();
  }

  /**
   * get content from RTE
   * @return string
   */
  async getContent() {
    const { rte, activeRte } = this;
    let result = '';

    if (rte) {
      result = await rte.getContent(this, activeRte!);
    }

    return result;
  }

  /**
   * Merge content from the DOM to the model
   */
  async syncContent(opts: ObjectAny = {}) {
    const { model, rte, rteEnabled } = this;
    if (!rteEnabled && !opts.force) return;
    const content = await this.getContent();
    const comps = model.components();
    const contentOpt: ObjectAny = { fromDisable: 1, ...opts };
    model.set('content', '', contentOpt);

    // If there is a custom RTE the content is just added staticly
    // inside 'content'
    if (rte?.customRte && !rte.customRte.parseContent) {
      comps.length &&
        comps.reset(undefined, {
          ...opts,
          // @ts-ignore
          keepIds: getComponentIds(comps),
        });
      model.set('content', content, contentOpt);
    } else {
      comps.resetFromString(content, opts);
    }
  }

  insertComponent(content: ComponentDefinition, opts: AddOptions & { useDomContent?: boolean } = {}) {
    const { model, el } = this;
    const doc = el.ownerDocument;
    const selection = doc.getSelection();

    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      const textNode = range.startContainer;
      const offset = range.startOffset;
      const textModel = getComponentModel(textNode);
      const newCmps: (ComponentDefinition | Component)[] = [];

      if (textModel && textModel.is?.('textnode')) {
        const cmps = textModel.collection;
        cmps.forEach(cmp => {
          if (cmp === textModel) {
            const type = 'textnode';
            const cnt = opts.useDomContent ? textNode.textContent || '' : cmp.content;
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
  disablePropagation(e: Event) {
    e.stopPropagation();
  }

  /**
   * Enable/Disable events
   * @param {Boolean} enable
   */
  toggleEvents(enable?: boolean) {
    const { em, model, $el } = this;
    const mixins = { on, off };
    const method = enable ? 'on' : 'off';
    em.setEditing(enable ? this : false);
    this.rteEnabled = !!enable;

    // The ownerDocument is from the frame
    var elDocs = [this.el.ownerDocument, document];
    mixins.off(elDocs, 'mousedown', this.onDisable as any);
    mixins[method](elDocs, 'mousedown', this.onDisable as any);
    em[method]('toolbar:run:before', this.onDisable);
    if (model) {
      model[method]('removed', this.onDisable);
      model.trigger(`rte:${enable ? 'enable' : 'disable'}`);
    }

    // @ts-ignore Avoid closing edit mode on component click
    $el?.off('mousedown', this.disablePropagation);
    // @ts-ignore
    $el && $el[method]('mousedown', this.disablePropagation);

    // Fixes #2210 but use this also as a replacement
    // of this fix: bd7b804f3b46eb45b4398304b2345ce870f232d2
    if (this.config.draggableComponents) {
      let { el } = this;

      while (el) {
        el.draggable = enable ? !1 : !0;
        // Note: el.parentNode is sometimes null here
        el = el.parentNode as HTMLElement;
        if (el && el.tagName == 'BODY') {
          // @ts-ignore
          el = 0;
        }
      }
    }
  }
}
