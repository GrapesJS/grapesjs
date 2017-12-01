var Backbone = require('backbone');
var ComponentView = require('./ComponentView');

module.exports = ComponentView.extend({

  tagName: 'img',

  events: {
    'dblclick': 'openModal',
    'click': 'initResize',
  },

  initialize(o) {
    const model = this.model;
    ComponentView.prototype.initialize.apply(this, arguments);
    this.listenTo(model, 'change:src', this.updateSrc);
    this.listenTo(model, 'dblclick active', this.openModal);
    this.classEmpty = `${this.ppfx}plh-image`;
    const config = this.config;
    config.modal && (this.modal = config.modal);
    config.am && (this.am = config.am);
  },


  /**
   * Update src attribute
   * @private
   * */
  updateSrc() {
    const src = this.model.get("src");
    const el = this.$el;
    el.attr('src', src);
    el[src ? 'removeClass' : 'addClass'](this.classEmpty);
  },


  /**
   * Open dialog for image changing
   * @param  {Object}  e  Event
   * @private
   * */
  openModal(e) {
    var em = this.opts.config.em;
    var editor = em ? em.get('Editor') : '';

    if(editor && this.model.get('editable')) {
      editor.runCommand('open-assets', {
        target: this.model,
        onSelect() {
          editor.Modal.close();
          editor.AssetManager.setTarget(null);
        }
      });
    }
  },


  render() {
    this.updateAttributes();
    this.updateClasses();

    var actCls = this.$el.attr('class') || '';
    if(!this.model.get('src'))
      this.$el.attr('class', (actCls + ' ' + this.classEmpty).trim());

    // Avoid strange behaviours while try to drag
    this.$el.attr('onmousedown', 'return false');
    return this;
  },
});
