import { isString } from 'underscore';
import Backbone from 'backbone';
import PropertyView from './PropertyView';

const $ = Backbone.$;

export default PropertyView.extend({
  templateInput() {
    const { pfx, em } = this;

    return `
    <div class="${pfx}field ${pfx}file">
      <div id='${pfx}input-holder'>
        <div class="${pfx}btn-c">
          <button class="${pfx}btn" id="${pfx}images" type="button">
            ${em.t('styleManager.fileButton')}
          </button>
        </div>
        <div style="clear:both;"></div>
      </div>
      <div id="${pfx}preview-box">
        <div id="${pfx}preview-file"></div>
        <div id="${pfx}close">&Cross;</div>
      </div>
    </div>
    `;
  },

  init() {
    const em = this.em;
    this.modal = em.get('Modal');
    this.am = em.get('AssetManager');
    this.events['click #' + this.pfx + 'close'] = 'removeFile';
    this.events['click #' + this.pfx + 'images'] = 'openAssetManager';
    this.delegateEvents();
  },

  onRender() {
    if (!this.$input) {
      const plh = this.model.getDefaultValue();
      this.$input = $(`<input placeholder="${plh}">`);
    }

    if (!this.$preview) {
      this.$preview = this.$el.find('#' + this.pfx + 'preview-file');
    }

    if (!this.$previewBox) {
      this.$previewBox = this.$el.find('#' + this.pfx + 'preview-box');
    }

    this.setValue(this.componentValue, 0);
  },

  clearCached() {
    PropertyView.prototype.clearCached.apply(this, arguments);
    this.$preview = null;
    this.$previewBox = null;
  },

  setValue(value, f) {
    PropertyView.prototype.setValue.apply(this, arguments);
    this.setPreviewView(value && value != this.model.getDefaultValue());
    this.setPreview(value);
  },

  /**
   * Change visibility of the preview box
   * @param bool Visibility
   *
   * @return void
   * */
  setPreviewView(v) {
    const pv = this.$previewBox;
    pv && pv[v ? 'addClass' : 'removeClass'](`${this.pfx}show`);
    pv && pv.css({ display: v ? 'block' : 'none' });
  },

  /**
   * Spread url
   * @param string Url
   *
   * @return void
   * */
  spreadUrl(url) {
    this.model.set('value', url);
    this.setPreviewView(1);
  },

  /**
   * Shows file preview
   * @param string Value
   * */
  setPreview(value) {
    const preview = this.$preview;
    value = value && value.indexOf('url(') < 0 ? `url(${value})` : value;
    preview && preview.css('background-image', value);
  },

  /** @inheritdoc */
  cleanValue() {
    this.setPreviewView(0);
    this.model.set({ value: '' }, { silent: true });
  },

  /**
   * Remove file from input
   *
   * @return void
   * */
  removeFile(...args) {
    this.model.set('value', this.model.getDefaultValue());
    PropertyView.prototype.cleanValue.apply(this, args);
    this.setPreviewView(0);
  },

  /**
   * Open dialog for image selecting
   * @param  {Object}  e  Event
   *
   * @return void
   * */
  openAssetManager(e) {
    const { em, modal } = this;
    const editor = em ? em.get('Editor') : '';

    if (editor) {
      editor.runCommand('open-assets', {
        types: ['image'],
        accept: 'image/*',
        target: this.getTargetModel(),
        onClick() {},
        onDblClick() {},
        onSelect: asset => {
          modal.close();
          const url = isString(asset) ? asset : asset.get('src');
          this.spreadUrl(url);
        }
      });
    }
  }
});
