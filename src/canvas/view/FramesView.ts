import DomainViews from '../../abstract/DomainViews';
import Frames from '../model/Frames';
import CanvasView from './CanvasView';
import FrameWrapView from './FrameWrapView';

export default class FramesView extends DomainViews<Frames, FrameWrapView> {
  canvasView: CanvasView;
  constructor(opts = {}, config: any) {
    super(opts, true);
    //console.log(this.collection)
    this.listenTo(this.collection, 'reset', this.render);
    this.canvasView = config.canvasView
  }

  onRemoveBefore(items: FrameWrapView[], opts = {}) {
    items.forEach(item => item.remove(opts));
  }

  onRender() {
    const { $el, em } = this;
    em && $el.attr({ class: `${em.config.stylePrefix}frames` });
  }
  protected renderView(item: any, type: string){return new FrameWrapView(item, this.canvasView)}
}

//FramesView.prototype.itemView = FrameWrapView;
