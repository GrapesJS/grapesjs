import { ModuleView } from '../../abstract';
import Resizer from '../../utils/Resizer';
import Panel from '../model/Panel';
import ButtonsView from './ButtonsView';

export default class PanelView extends ModuleView<Panel> {
  constructor(model: Panel) {
    super({ model, el: model.get('el') as string });
    this.className = this.pfx + 'panel';
    this.id = this.pfx + model.get('id');
    this.listenTo(model, 'change:appendContent', this.appendContent);
    this.listenTo(model, 'change:content', this.updateContent);
    this.listenTo(model, 'change:visible', this.toggleVisible);
    model.view = this;
  }

  /**
   * Append content of the panel
   * */
  appendContent() {
    this.$el.append(this.model.get('appendContent')!);
  }

  /**
   * Update content
   * */
  updateContent() {
    this.$el.html(this.model.get('content')!);
  }

  toggleVisible() {
    if (!this.model.get('visible')) {
      this.$el.addClass(`${this.ppfx}hidden`);
      return;
    }
    this.$el.removeClass(`${this.ppfx}hidden`);
  }

  //@ts-ignore
  attributes() {
    return this.model.get('attributes');
  }

  initResize() {
    const { em } = this;
    const editor = em?.Editor;
    const resizable = this.model.get('resizable');

    if (editor && resizable) {
      const resz = resizable === true ? [true, true, true, true] : resizable;
      const resLen = (resz as boolean[]).length;
      let tc,
        cr,
        bc,
        cl = false;

      // Choose which sides of the panel are resizable
      if (resLen == 2) {
        const resBools = resz as boolean[];
        tc = resBools[0];
        bc = resBools[0];
        cr = resBools[1];
        cl = resBools[1];
      } else if (resLen == 4) {
        const resBools = resz as boolean[];
        tc = resBools[0];
        cr = resBools[1];
        bc = resBools[2];
        cl = resBools[3];
      }

      const resizer: Resizer = new editor.Utils.Resizer({
        tc,
        cr,
        bc,
        cl,
        tl: false,
        tr: false,
        bl: false,
        br: false,
        appendTo: this.el,
        silentFrames: true,
        avoidContainerUpdate: true,
        prefix: editor.getConfig().stylePrefix,
        onEnd() {
          em.Canvas.refresh({ all: true });
        },
        posFetcher: (el: HTMLElement, { target }: any) => {
          const style = el.style as any;
          const config = resizer.getConfig();
          const keyWidth = config.keyWidth!;
          const keyHeight = config.keyHeight!;
          const rect = el.getBoundingClientRect();
          const forContainer = target == 'container';
          const styleWidth = style[keyWidth];
          const styleHeight = style[keyHeight];
          const width = styleWidth && !forContainer ? parseFloat(styleWidth) : rect.width;
          const height = styleHeight && !forContainer ? parseFloat(styleHeight) : rect.height;
          return {
            left: 0,
            top: 0,
            width,
            height,
          };
        },
        ...(resizable && typeof resizable !== 'boolean' ? resizable : {}),
      });
      resizer.blur = () => {};
      resizer.focus(this.el);
    }
  }

  render() {
    const { buttons } = this.model;
    const $el = this.$el;
    const ppfx = this.ppfx;
    const cls = `${this.className} ${this.id} ${ppfx}one-bg ${ppfx}two-color`;
    $el.addClass(cls);

    this.toggleVisible();

    if (buttons.length) {
      var buttonsView = new ButtonsView(buttons);
      $el.append(buttonsView.render().el);
    }

    $el.append(this.model.get('content')!);
    return this;
  }
}
