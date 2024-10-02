import { bindAll, indexOf } from 'underscore';
import CanvasModule from '../canvas';
import { ObjectStrings } from '../common';
import EditorModel from '../editor/model/Editor';
import { getDocumentScroll, off, on } from './dom';
import { DragDirection } from './sorter/types';
import CanvasNewComponentNode from './sorter/CanvasNewComponentNode';
import ComponentSorter from './sorter/ComponentSorter';

// TODO move in sorter
type SorterOptions = {
  sorter: any;
  event: any;
};

type DragStop = (cancel?: boolean) => void;

/**
 * This class makes the canvas droppable
 */
export default class Droppable {
  em: EditorModel;
  canvas: CanvasModule;
  el: HTMLElement;
  counter: number;
  getSorterOptions?: (sorter: any) => Record<string, any> | null;
  over?: boolean;
  dragStop?: DragStop;
  draggedNode?: CanvasNewComponentNode;
  sorter!: ComponentSorter<CanvasNewComponentNode>;

  constructor(em: EditorModel, rootEl?: HTMLElement) {
    this.em = em;
    this.canvas = em.Canvas;
    const el = rootEl || this.canvas.getFrames().map((frame) => frame.getComponent().getEl()!);
    const els = Array.isArray(el) ? el : [el];
    this.el = els[0];
    this.counter = 0;
    bindAll(this, 'handleDragEnter', 'handleDragOver', 'handleDrop', 'handleDragLeave', 'handleDragEnd');
    els.forEach((el) => this.toggleEffects(el, true));
  }

  toggleEffects(el: HTMLElement, enable: boolean) {
    const methods = { on, off };
    const method = enable ? 'on' : 'off';
    methods[method](el, 'dragenter', this.handleDragEnter);
    methods[method](el, 'dragover', this.handleDragOver);
    methods[method](el, 'drop', this.handleDrop);
    methods[method](el, 'dragleave', this.handleDragLeave);
  }

  __customTglEff(enable: boolean) {
    const method = enable ? on : off;
    const doc = this.el.ownerDocument;
    const frameEl = doc.defaultView?.frameElement as HTMLIFrameElement;
    const getSorterOptions: (sorter: any) => Record<string, any> = (sorter: any) => ({
      legacyOnStartSort() {
        on(frameEl, 'pointermove', sorter.onMove);
      },
      legacyOnEnd() {
        off(frameEl, 'pointermove', sorter.onMove);
      },
      customTarget({ event }: SorterOptions) {
        return doc.elementFromPoint(event.clientX, event.clientY);
      },
    });

    this.getSorterOptions = enable ? getSorterOptions : undefined;
    method(frameEl, 'pointerenter', this.handleDragEnter);
    method(frameEl, 'pointermove', this.handleDragOver);
    method(document, 'pointerup', this.handleDrop);
    method(frameEl, 'pointerout', this.handleDragLeave);

    // Test with touch devices (seems like frameEl is not capturing pointer events).
    // on/off(document, 'pointermove', sorter.onMove); // for the sorter
    // enable && this.handleDragEnter({}); // no way to use pointerenter/pointerout
  }

  startCustom() {
    this.__customTglEff(true);
  }

  endCustom(cancel?: boolean) {
    this.over ? this.endDrop(cancel) : this.__customTglEff(false);
  }

  /**
   * This function is expected to be always executed at the end of d&d.
   */
  endDrop(cancel?: boolean, ev?: Event) {
    const { em, dragStop } = this;
    this.counter = 0;
    dragStop && dragStop(cancel || !this.over);
    this.__customTglEff(false);
    em.trigger('canvas:dragend', ev);
  }

  handleDragLeave(ev: Event) {
    this.updateCounter(-1, ev);
  }

  updateCounter(value: number, ev: Event) {
    this.counter += value;
    this.counter === 0 && this.endDrop(true, ev);
  }

  handleDragEnter(ev: DragEvent | Event) {
    const { em, canvas } = this;
    const dt = (ev as DragEvent).dataTransfer;
    const dragSource = em.get('dragSource');

    if (!dragSource?.content && !canvas.getConfig().allowExternalDrop) {
      return;
    }

    this.updateCounter(1, ev);
    if (this.over) return;
    this.over = true;
    const utils = em.Utils;
    // For security reason I can't read the drag data on dragenter, but
    // as I need it for the Sorter context I will use `dragContent` or just
    // any not empty element
    let content = dragSource.content || '<br>';
    let dragStop: DragStop;
    let dragContent;
    em.stopDefault();

    // Select the right drag provider
    if (em.inAbsoluteMode()) {
      const wrapper = em.Components.getWrapper()!;
      const target = wrapper.append({})[0];
      const dragger = em.Commands.run('core:component-drag', {
        event: ev,
        guidesInfo: 1,
        center: 1,
        target,
        onEnd: (ev: any, dragger: any, { cancelled }: any) => {
          let comp;
          if (!cancelled) {
            comp = wrapper.append(content)[0];
            const canvasOffset = canvas.getOffset();
            const { top, left, position } = target.getStyle() as ObjectStrings;
            const scroll = getDocumentScroll(ev.target);
            const postLeft = parseInt(`${parseFloat(left) + scroll.x - canvasOffset.left}`, 10);
            const posTop = parseInt(`${parseFloat(top) + scroll.y - canvasOffset.top}`, 10);

            comp.addStyle({
              left: postLeft + 'px',
              top: posTop + 'px',
              position,
            });
          }
          this.handleDragEnd(comp, dt);
          target.remove();
        },
      });
      dragStop = (cancel?: boolean) => dragger.stop(ev, { cancel });
      dragContent = (cnt: any) => (content = cnt);
    } else {
      const sorter = new utils.ComponentSorter({
        em,
        treeClass: CanvasNewComponentNode,
        containerContext: {
          container: this.el,
          containerSel: '*',
          itemSel: '*',
          pfx: 'gjs-',
          placeholderElement: canvas.getPlacerEl()!,
          document: this.el.ownerDocument,
        },
        dragBehavior: {
          dragDirection: DragDirection.BothDirections,
          nested: true,
        },
        positionOptions: {
          windowMargin: 1,
          canvasRelative: true,
        },
        eventHandlers: {
          legacyOnEndMove: this.handleDragEnd,
        },
      });
      const sorterOptions = this.getSorterOptions?.(sorter);
      if (sorterOptions) {
        sorter.eventHandlers.legacyOnStartSort = sorterOptions.legacyOnStart;
        sorter.eventHandlers.legacyOnEnd = sorterOptions.legacyOnEnd;
        sorter.containerContext.customTarget = sorterOptions.customTarget;
      }
      this.em.on(
        'frame:scroll',
        ((...agrs: any[]) => {
          const canvasScroll = this.canvas.getCanvasView().frame === agrs[0].frame;
          if (canvasScroll) sorter.recalculateTargetOnScroll();
        }).bind(this),
      );
      let dropModel = this.getTempDropModel(content);
      const el = dropModel.view?.el;
      sorter.startSort(
        el
          ? [
              {
                element: el,
                dragSource,
              },
            ]
          : [],
      );
      this.sorter = sorter;
      this.draggedNode = sorter.sourceNodes?.[0];
      dragStop = (cancel?: boolean) => {
        if (cancel) {
          sorter.cancelDrag();
        } else {
          sorter.endDrag();
        }
      };
    }

    this.dragStop = dragStop;
    em.trigger('canvas:dragenter', dt, content);
  }

  /**
   * Generates a temporary model of the content being dragged for use with the sorter.
   * @returns The temporary model representing the dragged content.
   */
  private getTempDropModel(content?: any) {
    const comps = this.em.Components.getComponents();
    const opts = {
      avoidChildren: 1,
      avoidStore: 1,
      avoidUpdateStyle: 1,
    };
    const tempModel = comps.add(content, { ...opts, temporary: true });
    let dropModel = comps.remove(tempModel, { ...opts, temporary: true } as any);
    // @ts-ignore
    dropModel = dropModel instanceof Array ? dropModel[0] : dropModel;
    dropModel.view?.$el.data('model', dropModel);
    return dropModel;
  }

  handleDragEnd(model: any, dt: any) {
    const { em } = this;
    this.over = false;
    if (model) {
      em.set('dragResult', model);
      em.trigger('canvas:drop', dt, model);
    }
    em.runDefault({ preserveSelected: 1 });
  }

  /**
   * Always need to have this handler active for enabling the drop
   * @param {Event} ev
   */
  handleDragOver(ev: Event) {
    ev.preventDefault();
    this.em.trigger('canvas:dragover', ev);
  }

  /**
   * WARNING: This function might fail to run on drop, for example, when the
   * drop, accidentally, happens on some external element (DOM not inside the iframe)
   */
  handleDrop(ev: Event | DragEvent) {
    ev.preventDefault();
    const dt = (ev as DragEvent).dataTransfer;
    const content = this.getContentByData(dt).content;
    if (this.draggedNode) {
      this.draggedNode.content = content;
    }
    this.endDrop(!content, ev);
  }

  getContentByData(dt: any) {
    const em = this.em;
    const types = dt && dt.types;
    const files = (dt && dt.files) || [];
    const dragSource = em.get('dragSource');
    let content = dt && dt.getData('text');

    if (files.length) {
      content = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const type = file.type.split('/')[0];

        if (type == 'image') {
          content.push({
            type,
            file,
            attributes: { alt: file.name },
          });
        }
      }
    } else if (dragSource.content) {
      content = dragSource.content;
    } else if (indexOf(types, 'text/html') >= 0) {
      content = dt && dt.getData('text/html').replace(/<\/?meta[^>]*>/g, '');
    } else if (indexOf(types, 'text/uri-list') >= 0) {
      content = {
        type: 'link',
        attributes: { href: content },
        content: content,
      };
    } else if (indexOf(types, 'text/json') >= 0) {
      const json = dt && dt.getData('text/json');
      json && (content = JSON.parse(json));
    } else if (types.length === 1 && types[0] === 'text/plain') {
      // Avoid dropping non-selectable and non-editable text nodes inside the editor
      content = `<div>${content}</div>`;
    }

    const result = { content };
    em.trigger('canvas:dragdata', dt, result);

    return result;
  }
}
