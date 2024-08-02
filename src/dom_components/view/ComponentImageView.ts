import { isString } from 'underscore';
import { ObjectAny } from '../../common';
import ComponentImage from '../model/ComponentImage';
import ComponentView from './ComponentView';

export default class ComponentImageView<TComp extends ComponentImage = ComponentImage> extends ComponentView<TComp> {
  classEmpty!: string;
  el!: HTMLImageElement;

  tagName() {
    return 'img';
  }

  events(): ObjectAny {
    return {
      dblclick: 'onActive',
      click: 'initResize',
      error: 'onError',
      load: 'onLoad',
      dragstart: 'noDrag',
    };
  }

  initialize(props: any) {
    super.initialize(props);
    this.listenTo(this.model, 'change:src', this.updateSrc);
    this.classEmpty = `${this.ppfx}plh-image`;
    this.fetchFile();
  }

  /**
   * Fetch file if exists
   */
  fetchFile() {
    if (this.modelOpt.temporary) return;
    const { model, em } = this;
    const file = model.get('file');

    if (file && em) {
      const fu = em.Assets.FileUploader();
      fu?.uploadFile(
        {
          // @ts-ignore
          dataTransfer: { files: [file] },
        },
        (res: any) => {
          const obj = res && res.data && res.data[0];
          const src = obj && (isString(obj) ? obj : obj.src);
          src && model.set({ src });
        }
      );
      model.set('file', '');
    }
  }

  /**
   * Update src attribute
   * @private
   * */
  updateSrc() {
    const { model } = this;
    model.addAttributes({ src: model.getSrcResult() });
    this.updateClasses();
  }

  updateClasses() {
    super.updateClasses();
    const { el, classEmpty, model } = this;
    const srcExists = model.getSrcResult() && !model.isDefaultSrc();
    const method = srcExists ? 'remove' : 'add';
    el.classList[method](classEmpty);
  }

  /**
   * Open dialog for image changing
   * @param  {Object}  e  Event
   * @private
   * */
  onActive(ev: Event) {
    ev?.stopPropagation();
    const { em, model } = this;
    const am = em?.Assets;

    if (am && model.get('editable')) {
      am.open({
        select(asset, complete) {
          model.set({ src: asset.getSrc() });
          complete && am.close();
        },
        target: model,
        types: ['image'],
        accept: 'image/*',
      });
    }
  }

  onError() {
    const fallback = this.model.getSrcResult({ fallback: true });
    if (fallback) {
      this.el.src = fallback;
    }
  }

  onLoad() {
    // Used to update component tools box (eg. toolbar, resizer) once the image is loaded
    this.em.Canvas.refresh({ all: true });
  }

  noDrag(ev: Event) {
    ev.preventDefault();
    return false;
  }

  render() {
    this.renderAttributes();
    if (this.modelOpt.temporary) return this;
    this.updateSrc();
    const { $el, model } = this;
    const cls = $el.attr('class') || '';
    !model.get('src') && $el.attr('class', `${cls} ${this.classEmpty}`.trim());
    this.postRender();

    return this;
  }
}
