var Backbone = require('backbone');
var ItemView = require('./ItemView');

module.exports = Backbone.View.extend({

  initialize(o) {
    this.opt = o;
    this.config = o.config;
    this.preview = o.preview;
    this.ppfx = o.config.pStylePrefix || '';
    this.pfx = o.config.stylePrefix || '';
    this.parent = o.parent;
    this.listenTo(this.collection, 'add', this.addTo);
    this.listenTo(this.collection, 'reset resetNavigator', this.render);
    this.className   = this.pfx + 'items';

    if(this.config.sortable && !this.opt.sorter){
      var pfx = this.pfx;
      var utils = this.config.em.get('Utils');
      this.opt.sorter = new utils.Sorter({
        container: this.el,
        containerSel: '.' + pfx + 'items',
        itemSel: '.' + pfx + 'item',
        ppfx: this.ppfx,
        ignoreViewChildren: 1,
        pfx,
        nested: 1
      });
    }

    this.sorter = this.opt.sorter || '';

    if(!this.parent)
      this.className  += ' ' + this.pfx + this.config.containerId;

    // For the sorter
    this.$el.data('collection', this.collection);

    if (this.parent) {
      this.$el.data('model', this.parent);
    }
  },

  /**
   * Add to collection
   * @param Object Model
   *
   * @return Object
   * */
  addTo(model) {
    var i  = this.collection.indexOf(model);
    this.addToCollection(model, null, i);
  },

  /**
   * Add new object to collection
   * @param  Object  Model
   * @param  Object   Fragment collection
   * @param  integer  Index of append
   *
   * @return Object Object created
   * */
  addToCollection(model, fragmentEl, index) {
    var fragment  = fragmentEl || null;
    var viewObject  = ItemView;

    var view = new viewObject({
      model,
      config: this.config,
      sorter: this.sorter,
      isCountable: this.isCountable,
      opened: this.opt.opened,
    });
    var rendered  = view.render().el;

    if(fragment){
      fragment.appendChild(rendered);
    }else{
      if(typeof index != 'undefined'){
        var method  = 'before';
        // If the added model is the last of collection
        // need to change the logic of append
        if(this.$el.children().length == index){
          index--;
          method  = 'after';
        }
        // In case the added is new in the collection index will be -1
        if(index < 0){
          this.$el.append(rendered);
        }else
          this.$el.children().eq(index)[method](rendered);
      }else
        this.$el.append(rendered);
    }

    return rendered;
  },

  /**
   * Check if the model could be count by the navigator
   * @param  {Object}  model
   * @return {Boolean}
   * @private
   */
  isCountable(model, hide) {
    var type = model.get('type');
    var tag = model.get('tagName');
    if( ((type == 'textnode' || tag == 'br') && hide) ||
        model.get('hiddenLayer')) {
      return false;
    }
    return true;
  },

  render() {
    var fragment = document.createDocumentFragment();
    this.$el.empty();

    this.collection.each(function(model) {
      if(!this.isCountable(model, this.config.hideTextnode))
        return;
      this.addToCollection(model, fragment);
    }, this);

    this.$el.append(fragment);
    this.$el.attr('class', _.result(this, 'className'));
    return this;
  }
});
