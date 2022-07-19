import { View } from '../../abstract';
import Panel from '../model/Panel';
import ButtonsView from './ButtonsView';

export default class PanelView extends View<Panel> {
  constructor(model: Panel) {
    super({ model, el: model.get('el') });
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
    this.$el.append(this.model.get('appendContent'));
  }

  /**
   * Update content
   * */
  updateContent() {
    this.$el.html(this.model.get('content'));
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
    const em = this.em;
    const editor = em ? em.get('Editor') : '';
    const resizable = this.model.get('resizable');

    if (editor && resizable) {
      var resz = resizable === true ? [1, 1, 1, 1] : resizable;
      var resLen = resz.length;
      var tc,
        cr,
        bc,
        cl = 0;

      // Choose which sides of the panel are resizable
      if (resLen == 2) {
        tc = resz[0];
        bc = resz[0];
        cr = resz[1];
        cl = resz[1];
      } else if (resLen == 4) {
        tc = resz[0];
        cr = resz[1];
        bc = resz[2];
        cl = resz[3];
      }

      var resizer = editor.Utils.Resizer.init({
        tc,
        cr,
        bc,
        cl,
        tl: 0,
        tr: 0,
        bl: 0,
        br: 0,
        appendTo: this.el,
        silentFrames: 1,
        avoidContainerUpdate: 1,
        prefix: editor.getConfig().stylePrefix,
        onEnd() {
          em && em.trigger('change:canvasOffset');
        },
        posFetcher: (el: HTMLElement, { target }: any) => {
          const style = el.style;
          const config = resizer.getConfig();
          const keyWidth = config.keyWidth;
          const keyHeight = config.keyHeight;
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
        ...resizable,
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

    $el.append(this.model.get('content'));
    return this;
  }
}
