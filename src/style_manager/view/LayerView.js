var Backbone = require('backbone');

module.exports = Backbone.View.extend({

  events:{
    'click': 'updateIndex',
  },

  template: _.template(`
  <div id="<%= pfx %>move">
    <i class="fa fa-arrows"></i>
  </div>
  <div id="<%= pfx %>label"><%= label %></div>
  <div id="<%= pfx %>preview-box">
  	<div id="<%= pfx %>preview"></div>
  </div>
  <div id="<%= pfx %>close-layer" class="<%= pfx %>btn-close">&Cross;</div>
  <div id="<%= pfx %>inputs"></div>
  <div style="clear:both"></div>`),

  initialize(o) {
    let model = this.model;
    this.stackModel = o.stackModel || {};
    this.config = o.config || {};
    this.pfx = this.config.stylePrefix || '';
    this.className = this.pfx + 'layer';
    this.sorter = o.sorter || null;
    this.listenTo(model, 'destroy remove', this.remove);
    this.listenTo(model, 'change:value', this.valueChanged);
    this.listenTo(model, 'change:props', this.showProps);
    this.events['click #' + this.pfx + 'close-layer'] = 'remove';
    this.events['mousedown > #' + this.pfx + 'move'] = 'initSorter';

    if (!model.get('preview')) {
      this.$el.addClass(this.pfx + 'no-preview');
    }

    // For the sorter
    model.view = this;
    model.set({droppable: 0, draggable: 1});
    this.$el.data('model', model);
    this.delegateEvents();
  },

  /**
   * Delegate sorting
   * @param  {Event} e
   * */
  initSorter(e) {
    if(this.sorter)
      this.sorter.startSort(this.el);
  },

  /**
   * Returns properties
   * @return {Collection|null}
   */
  getProps() {
    if(this.stackModel.get)
      return this.stackModel.get('properties');
    else
      return null;
  },

  /**
   * Emitted when the value is changed
   */
  valueChanged() {
    var preview = this.model.get('preview');

    if(!preview)
      return;

    if(!this.$preview)
        this.$preview = this.$el.find('#' + this.pfx + 'preview');

    var prw = '';
    var props = this.getProps();
    var previewEl = this.$preview;
    if (typeof preview === 'function') {
      preview(props, previewEl);
    } else {
      this.onPreview(props, previewEl);
    }
  },

  /**
   * Default method for changing preview box
   * @param {Collection} props
   * @param {Element} $el
   */
  onPreview(props, $el) {
    var  aV = this.model.get('value').split(' ');
    var lim = 3;
    var nV = '';
    props.each((p, index) => {
      var v = aV[index] || '';
      if(v){
        if(p.get('type') == 'integer'){
          var vI  = parseInt(v, 10),
          u  = v.replace(vI,'');
          vI  = !isNaN(vI) ? vI : 0;
          if(vI > lim)
            vI = lim;
          if(vI < -lim)
            vI = -lim;
          v = vI + u;
        }
      }
      nV  += v + ' ';
    });

    if(this.stackModel.get){
      var property = this.stackModel.get('property');
      if(property)
        this.$preview.get(0).style[property] = nV;
    }
  },

  /**
   * Show inputs on this layer
   * */
  showProps() {
    this.$props = this.model.get('props');
    this.$el.find('#' + this.pfx + 'inputs').html(this.$props.show());
    this.model.set({props: null }, {silent: true });
  },

  /** @inheritdoc */
  remove(e) {
    // Prevent from revoming all events on props
    if(this.$props)
      this.$props.detach();

    if(e && e.stopPropagation)
      e.stopPropagation();

    Backbone.View.prototype.remove.apply(this, arguments);

    //---
    if(this.model.collection.contains(this.model))
      this.model.collection.remove(this.model);

    if(this.stackModel && this.stackModel.set){
      this.stackModel.set({stackIndex: null}, {silent: true});
      this.stackModel.trigger('updateValue');
    }
  },

  /**
   * Update index
   * @param Event
   *
   * @return void
   * */
  updateIndex(e) {
    var i = this.getIndex();
    this.stackModel.set('stackIndex', i);

    if(this.model.collection)
      this.model.collection.trigger('deselectAll');

    this.$el.addClass(this.pfx + 'active');
  },

  /**
   * Fetch model index
   * @return {number} Index
   */
  getIndex() {
    var index = 0;
    var model = this.model;

    if (model.collection) {
      index = model.collection.indexOf(model);
    }

    return index;
  },

  render() {
    this.$el.html( this.template({
      label: 'Layer ' + this.model.get('index'),
      pfx: this.pfx,
    }));
    this.$el.attr('class', this.className);
    this.valueChanged();
    return this;
  },

});
