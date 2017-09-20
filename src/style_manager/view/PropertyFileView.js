var Backbone = require('backbone');
var PropertyView = require('./PropertyView');

module.exports = PropertyView.extend({

  templateInput() {
    const pfx = this.pfx;
    const ppfx = this.ppfx;
    const assetsLabel = this.config.assetsLabel || 'Images';
    return `
    <div class="${pfx}field ${pfx}file">
      <div id='${pfx}input-holder'>
        <div class="${pfx}btn-c">
          <button class="${pfx}btn" id="${pfx}images" type="button">
            ${assetsLabel}
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
    this.assets = this.target.get('assets');
    this.modal = this.target.get('Modal');
    this.am = this.target.get('AssetManager');
    this.events['click #'+this.pfx+'close']    = 'removeFile';
    this.events['click #'+this.pfx+'images']  = 'openAssetManager';
    this.delegateEvents();
  },

  onRender() {
    if (!this.$input) {
      this.$input = $('<input>', {placeholder: this.model.getDefaultValue(), type: 'text' });
    }

    if (!this.$preview) {
      this.$preview = this.$el.find('#' + this.pfx + 'preview-file');
    }

    if (!this.$previewBox) {
      this.$previewBox = this.$el.find('#' + this.pfx + 'preview-box');
    }

    this.setValue(this.componentValue, 0);
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
    this.model.set({value: ''},{silent: true});
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
    var that  = this;
    var em = this.em;
    var editor = em ? em.get('Editor') : '';

    if(editor) {
      this.modal.setTitle('Select image');
      this.modal.setContent(this.am.getContainer());
      this.am.setTarget(null);
      editor.runCommand('open-assets', {
        target: this.model,
        onSelect(target) {
          that.modal.close();
          that.spreadUrl(target.get('src'));
        }
      });
    }
  },
});
