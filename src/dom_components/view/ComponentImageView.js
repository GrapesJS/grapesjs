var Backbone = require('backbone');
var ComponentView = require('./ComponentView');

module.exports = ComponentView.extend({

  tagName: 'img',

  events: {
    'dblclick': 'openModal',
    'click': 'initResize',
  },

  initialize(o) {
    ComponentView.prototype.initialize.apply(this, arguments);
    this.listenTo(this.model, 'change:src', this.updateSrc);
    this.listenTo(this.model, 'dblclick active', this.openModal);
    this.classEmpty = this.ppfx + 'plh-image';

    if(this.config.modal)
      this.modal = this.config.modal;

    if(this.config.am)
      this.am = this.config.am;
  },

  /**
   * Update src attribute
   * @private
   * */
  updateSrc() {
    var src = this.model.get("src");
    this.$el.attr('src', src);
    if(!src)
      this.$el.addClass(this.classEmpty);
    else
      this.$el.removeClass(this.classEmpty);
  },

  /**
   * Open dialog for image changing
   * @param  {Object}  e  Event
   * @private
   * */
  openModal(e) {
    var em = this.opts.config.em;
    var editor = em ? em.get('Editor') : '';

    if(editor) {
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
