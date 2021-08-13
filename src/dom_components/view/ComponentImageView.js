import { isString } from 'underscore';
import ComponentView from './ComponentView';

export default ComponentView.extend({
  tagName: 'img',

  events: {
    dblclick: 'onActive',
    click: 'initResize',
    error: 'onError',
    load: 'onLoad',
    dragstart: 'noDrag'
  },

  initialize(o) {
    ComponentView.prototype.initialize.apply(this, arguments);
    this.listenTo(this.model, 'change:src', this.updateSrc);
    this.classEmpty = `${this.ppfx}plh-image`;
    this.fetchFile();
  },

  /**
   * Fetch file if exists
   */
  fetchFile() {
    if (this.modelOpt.temporary) return;
    const model = this.model;
    const file = model.get('file');

    if (file) {
      const fu = this.em.get('AssetManager').FileUploader();
      fu.uploadFile(
        {
          dataTransfer: { files: [file] }
        },
        res => {
          const obj = res && res.data && res.data[0];
          const src = obj && (isString(obj) ? obj : obj.src);
          src && model.set({ src });
        }
      );
      model.set('file', '');
    }
  },

  /**
   * Update src attribute
   * @private
   * */
  updateSrc() {
    const { model, classEmpty, $el } = this;
    const src = model.getSrcResult();
    const srcExists = src && !model.isDefaultSrc();
    model.addAttributes({ src });
    $el[srcExists ? 'removeClass' : 'addClass'](classEmpty);
  },

  /**
   * Open dialog for image changing
   * @param  {Object}  e  Event
   * @private
   * */
  onActive(ev) {
    ev && ev.stopPropagation();
    const { em, model } = this;
    const ed = em && em.get('Editor');

    if (ed && model.get('editable')) {
      ed.runCommand('open-assets', {
        target: model,
        types: ['image'],
        accept: 'image/*',
        onSelect() {
          ed.Modal.close();
          ed.AssetManager.setTarget(null);
        }
      });
    }
  },

  onError() {
    const fallback = this.model.getSrcResult({ fallback: 1 });
    if (fallback) this.el.src = fallback;
  },

  onLoad() {
    // Used to update component tools box (eg. toolbar, resizer) once the image is loaded
    this.em.trigger('change:canvasOffset');
  },

  noDrag(ev) {
    ev.preventDefault();
    return false;
  },

  render() {
    this.renderAttributes();
    this.updateSrc();
    const { $el, model } = this;
    const cls = $el.attr('class') || '';
    !model.get('src') && $el.attr('class', `${cls} ${this.classEmpty}`.trim());
    this.postRender();

    return this;
  }
});
