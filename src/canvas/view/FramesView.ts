import CanvasModule from '..';
import DomainViews from '../../abstract/DomainViews';
import Frames from '../model/Frames';
import CanvasView from './CanvasView';
import FrameWrapView from './FrameWrapView';

export default class FramesView extends DomainViews<Frames, FrameWrapView> {
  canvasView: CanvasView;
  private _module: CanvasModule;
  
  constructor(opts = {}, config: any) {
    super(opts, true);
    //console.log(this.collection)
    this.listenTo(this.collection, 'reset', this.render);
    this.canvasView = config.canvasView
    this._module = config.module;
  }

  onRemoveBefore(items: FrameWrapView[], opts = {}) {
    items.forEach(item => item.remove(opts));
  }

  onRender() {
    const { $el, ppfx } = this;
    $el.attr({ class: `${ppfx}frames` });
  }
  protected renderView(item: any, type: string){return new FrameWrapView(item, this.canvasView)}
}
