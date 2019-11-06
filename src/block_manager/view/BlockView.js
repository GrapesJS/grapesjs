import Backbone from 'backbone';
import { isObject } from 'underscore';
import { on, off, hasDnd } from 'utils/mixins';

export default Backbone.View.extend({
  events: {
    click: 'handleClick',
    mousedown: 'startDrag',
    dragstart: 'handleDragStart',
    drag: 'handleDrag',
    dragend: 'handleDragEnd'
  },

  initialize(o, config = {}) {
    const { model } = this;
    this.em = config.em;
    this.config = config;
    this.endDrag = this.endDrag.bind(this);
    this.ppfx = config.pStylePrefix || '';
    this.listenTo(model, 'destroy remove', this.remove);
    this.listenTo(model, 'change', this.render);
  },

  handleClick() {
    const { config, model, em } = this;
    if (!config.appendOnClick) return;
    const sorter = config.getSorter();
    const content = model.get('content');
    const selected = em.getSelected();
    sorter.setDropContent(content);
    let target, valid;

    // If there is a selected component, try first to append
    // the block inside, otherwise, try to place it as a next sibling
    if (selected) {
      valid = sorter.validTarget(selected.getEl(), content);

      if (valid.valid) {
        target = selected;
      } else {
        const parent = selected.parent();
        valid = sorter.validTarget(parent.getEl(), content);
        if (valid.valid) target = parent;
      }
    }

    // If no target found yet, try to append the block to the wrapper
    if (!target) {
      const wrapper = em.getWrapper();
      valid = sorter.validTarget(wrapper.getEl(), content);
      if (valid.valid) target = wrapper;
    }

    const result = target && target.append(content)[0];
    result && em.setSelected(result, { scroll: 1 });
  },

  /**
   * Start block dragging
   * @private
   */
  startDrag(e) {
    const { config, em } = this;
    //Right or middel click
    if (e.button !== 0 || !config.getSorter || this.el.draggable) return;
    em.refreshCanvas();
    const sorter = config.getSorter();
    sorter.setDragHelper(this.el, e);
    sorter.setDropContent(this.model.get('content'));
    sorter.startSort(this.el);
    on(document, 'mouseup', this.endDrag);
  },

  handleDragStart(ev) {
    const { em, model } = this;
    const content = model.get('content');
    const isObj = isObject(content);
    const data = isObj ? JSON.stringify(content) : content;
    em.set('dragResult');

    // Note: data are not available on dragenter for security reason,
    // we have to use dragContent as we need it for the Sorter context
    // IE11 supports only 'text' data type
    ev.dataTransfer.setData('text', data);
    em.set('dragContent', content);
    em.trigger('block:drag:start', model, ev);
  },

  handleDrag(ev) {
    this.em.trigger('block:drag', this.model, ev);
  },

  handleDragEnd() {
    const { em, model } = this;
    const result = em.get('dragResult');

    if (result) {
      const oldKey = 'activeOnRender';
      const oldActive = result.get && result.get(oldKey);

      if (model.get('activate') || oldActive) {
        result.trigger('active');
        result.set(oldKey, 0);
      }

      if (model.get('select')) {
        em.setSelected(result);
      }

      if (model.get('resetId')) {
        result.onAll(model => model.resetId());
      }
    }

    em.set({
      dragResult: null,
      dragContent: null
    });

    em.trigger('block:drag:stop', result, model);
  },

  /**
   * Drop block
   * @private
   */
  endDrag(e) {
    off(document, 'mouseup', this.endDrag);
    const sorter = this.config.getSorter();

    // After dropping the block in the canvas the mouseup event is not yet
    // triggerd on 'this.doc' and so clicking outside, the sorter, tries to move
    // things (throws false positives). As this method just need to drop away
    // the block helper I use the trick of 'moved = 0' to void those errors.
    sorter.moved = 0;
    sorter.endMove();
  },

  render() {
    const { em, el, ppfx, model } = this;
    const className = `${ppfx}block`;
    const label =
      (em && em.t(`blockManager.labels.${model.id}`)) || model.get('label');
    const render = model.get('render');
    const media = model.get('media');
    el.className += ` ${className} ${ppfx}one-bg ${ppfx}four-color-h`;
    el.innerHTML = `
      ${media ? `<div class="${className}__media">${media}</div>` : ''}
      <div class="${className}-label">${label}</div>
    `;
    el.title = el.textContent.trim();
    hasDnd(em) && el.setAttribute('draggable', true);
    const result = render && render({ el, model, className, prefix: ppfx });
    if (result) el.innerHTML = result;
    return this;
  }
});
