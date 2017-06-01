var Backbone = require('backbone');
var ComponentView = require('./ComponentView');

module.exports = ComponentView.extend({

  events: {
    'dblclick': 'enableEditing',
    'change': 'parseRender',
  },

  initialize(o) {
    ComponentView.prototype.initialize.apply(this, arguments);
    _.bindAll(this,'disableEditing');
    this.listenTo(this.model, 'focus active', this.enableEditing);
    this.rte = this.config.rte || '';
    this.activeRte = null;
    this.em = this.config.em;
  },

  /**
   * Enable the component to be editable
   * @param {Event} e
   * @private
   * */
  enableEditing(e) {
    var editable = this.model.get('editable');
    if(this.rte && editable) {
      try {
        this.activeRte = this.rte.attach(this, this.activeRte);
        this.rte.focus(this, this.activeRte);
      } catch (err) {
          console.error(err);
      }
    }
    this.toggleEvents(1);
  },

  /**
   * Disable this component to be editable
   * @param {Event}
   * @private
   * */
  disableEditing(e) {
    var model = this.model;
    var editable = model.get('editable');

    if(this.rte && editable) {
      try {
        this.rte.detach(this, this.activeRte);
      } catch (err) {
        console.error(err);
      }
      var el = this.getChildrenContainer();
      model.set('content', el.innerHTML);
    }

    if(!this.rte.customRte && editable) {
      this.parseRender();
    }

    this.toggleEvents();
  },

  /**
   * Isolate disable propagation method
   * @param {Event}
   * @private
   * */
  disablePropagation(e) {
    e.stopPropagation();
  },

  /**
   * Parse content and re-render it
   * @private
   */
  parseRender() {
    var el = this.getChildrenContainer();
    var comps = this.model.get('components');
    var opts = {silent: true};

    // Avoid re-render on reset with silent option
    comps.reset(null, opts);
    comps.add(el.innerHTML, opts);
    this.model.set('content', '');
    this.render();

    // As the reset was in silent mode I need to notify
    // the navigator about the change
    comps.trigger('resetNavigator');
  },

  /**
   * Enable/Disable events
   * @param {Boolean} enable
   */
  toggleEvents(enable) {
    var method = enable ? 'on' : 'off';

    // The ownerDocument is from the frame
    var elDocs = [this.el.ownerDocument, document, this.rte];
    $(elDocs).off('mousedown', this.disableEditing);
    $(elDocs)[method]('mousedown', this.disableEditing);

    // Avoid closing edit mode on component click
    this.$el.off('mousedown', this.disablePropagation);
    this.$el[method]('mousedown', this.disablePropagation);
  },

});
