import { isFunction } from 'underscore';
import { View } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { on, off, hasDnd } from '../../utils/mixins';
import { BlockManagerConfig } from '../config/config';
import Block from '../model/Block';

export interface BlockViewConfig {
  em?: EditorModel;
  pStylePrefix?: string;
  appendOnClick?: BlockManagerConfig['appendOnClick'];
  getSorter?: any;
}

export default class BlockView extends View<Block> {
  em: EditorModel;
  config: BlockViewConfig;
  ppfx: string;

  events() {
    return {
      click: 'handleClick',
      mousedown: 'startDrag',
      dragstart: 'handleDragStart',
      drag: 'handleDrag',
      dragend: 'handleDragEnd',
    };
  }

  constructor(o: any, config: BlockViewConfig = {}) {
    super(o);
    const { model } = this;
    this.em = config.em!;
    this.config = config;
    this.endDrag = this.endDrag.bind(this);
    this.ppfx = config.pStylePrefix || '';
    this.listenTo(model, 'destroy remove', this.remove);
    this.listenTo(model, 'change', this.render);
  }

  __getModule() {
    return this.em.Blocks;
  }

  handleClick(ev: Event) {
    const { config, model, em } = this;
    const onClick = model.get('onClick') || config.appendOnClick;
    em.trigger('block:click', model, ev);
    if (!onClick) {
      return;
    } else if (isFunction(onClick)) {
      return onClick(model, em?.getEditor(), { event: ev });
    }
    const sorter = config.getSorter();
    const content = model.get('content');
    const selected = em.getSelected();
    sorter.setDropContent(content);
    let target, valid, insertAt;

    // If there is a selected component, try first to append
    // the block inside, otherwise, try to place it as a next sibling
    if (selected) {
      valid = sorter.validTarget(selected.getEl(), content);

      if (valid.valid) {
        target = selected;
      } else {
        const parent = selected.parent();
        if (parent) {
          valid = sorter.validTarget(parent.getEl(), content);
          if (valid.valid) {
            target = parent;
            insertAt = parent.components().indexOf(selected) + 1;
          }
        }
      }
    }

    // If no target found yet, try to append the block to the wrapper
    if (!target) {
      const wrapper = em.getWrapper();
      valid = sorter.validTarget(wrapper.getEl(), content);
      if (valid.valid) target = wrapper;
    }

    const result = target && target.append(content, { at: insertAt })[0];
    result && em.setSelected(result, { scroll: 1 });
  }

  /**
   * Start block dragging
   * @private
   */
  startDrag(e: MouseEvent) {
    const { config, em, model } = this;
    const disable = model.get('disable');
    //Right or middel click
    if (e.button !== 0 || !config.getSorter || this.el.draggable || disable) return;
    em.refreshCanvas();
    const sorter = config.getSorter();
    sorter.__currentBlock = model;
    sorter.setDragHelper(this.el, e);
    sorter.setDropContent(this.model.get('content'));
    sorter.startSort(this.el);
    on(document, 'mouseup', this.endDrag);
  }

  handleDragStart(ev: DragEvent) {
    this.__getModule().__startDrag(this.model, ev);
  }

  handleDrag(ev: DragEvent) {
    this.__getModule().__drag(ev);
  }

  handleDragEnd() {
    this.__getModule().__endDrag();
  }

  /**
   * Drop block
   * @private
   */
  endDrag() {
    off(document, 'mouseup', this.endDrag);
    const sorter = this.config.getSorter();

    // After dropping the block in the canvas the mouseup event is not yet
    // triggerd on 'this.doc' and so clicking outside, the sorter, tries to move
    // things (throws false positives). As this method just need to drop away
    // the block helper I use the trick of 'moved = 0' to void those errors.
    sorter.moved = 0;
    sorter.endMove();
  }

  render() {
    const { em, el, $el, ppfx, model } = this;
    const disable = model.get('disable');
    const attr = model.get('attributes') || {};
    const cls = attr.class || '';
    const className = `${ppfx}block`;
    const label = (em && em.t(`blockManager.labels.${model.id}`)) || model.get('label');
    // @ts-ignore deprecated
    const render = model.get('render');
    const media = model.get('media');
    const clsAdd = disable ? `${className}--disable` : `${ppfx}four-color-h`;
    $el.attr(attr);
    el.className = `${cls} ${className} ${ppfx}one-bg ${clsAdd}`.trim();
    el.innerHTML = `
      ${media ? `<div class="${className}__media">${media}</div>` : ''}
      <div class="${className}-label">${label}</div>
    `;
    el.title = attr.title || el.textContent?.trim();
    el.setAttribute('draggable', `${hasDnd(em) && !disable ? true : false}`);
    const result = render && render({ el, model, className, prefix: ppfx });
    if (result) el.innerHTML = result;
    return this;
  }
}
