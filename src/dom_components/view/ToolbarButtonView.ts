import { isFunction, isString } from 'underscore';
import { View } from '../../common';
import EditorModel from '../../editor/model/Editor';
import ToolbarButton from '../model/ToolbarButton';

export type ToolbarViewProps = { em: EditorModel };

export default class ToolbarButtonView extends View<ToolbarButton> {
  em: EditorModel;

  events() {
    return (
      this.model.get('events') || {
        mousedown: 'handleClick',
      }
    );
  }

  // @ts-ignore
  attributes() {
    return this.model.get('attributes');
  }

  constructor(props: { config: ToolbarViewProps; model: ToolbarButton }) {
    super(props);
    this.em = props.config.em;
  }

  handleClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    /*
     * Since the toolbar lives outside the canvas frame, the event's
     * generated on it have clientX and clientY relative to the page.
     *
     * This causes issues during events like dragging, where they depend
     * on the clientX and clientY.
     *
     * This makes sure the offsets are calculated.
     *
     * More information on
     * https://github.com/artf/grapesjs/issues/2372
     * https://github.com/artf/grapesjs/issues/2207
     */

    const { em } = this;
    const { left, top } = em.Canvas.getFrameEl().getBoundingClientRect();
    const ev = {
      ...event,
      clientX: event.clientX - left,
      clientY: event.clientY - top,
    };

    em.trigger('toolbar:run:before', { event: ev });
    this.execCommand(ev);
  }

  execCommand(event: MouseEvent) {
    const { em, model } = this;
    const opts = { event };
    const command = model.get('command');
    const editor = em.Editor;

    if (isFunction(command)) {
      command(editor, null, opts);
    }

    if (isString(command)) {
      editor.runCommand(command, opts);
    }
  }

  render() {
    const { em, $el, model } = this;
    const id = model.get('id');
    const label = model.get('label');
    const pfx = em.getConfig().stylePrefix;
    $el.addClass(`${pfx}toolbar-item`);
    id && $el.addClass(`${pfx}toolbar-item__${id}`);
    label && $el.append(label);
    return this;
  }
}
