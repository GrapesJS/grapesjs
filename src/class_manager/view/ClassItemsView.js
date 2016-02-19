define(['backbone', 'text!./../template/classItems.html'],
  function (Backbone, itemsTemplate) {
  /**
   * @class ClassItemsView
   * */
  return Backbone.View.extend({

    template: _.template(itemsTemplate),

    events:{
      'click .add': 'startNewClass',
      'keyup .input' : 'onInputKeyUp'
    },

    initialize: function(o) {
      this.events['click #'+this.pfx+'add'] = 'addLayer';

      if(!this.layers){
        this.layers   = new Layers();
        this.model.set('layers', this.layers);
        this.$layers  = new LayersView({
          collection  : this.layers,
          stackModel  : this.model,
          preview   : this.model.get('preview'),
          config    : o.config
        });
      }

      this.targetCl  = this.target.classes;

      this.listenTo( this.targetCl, 'add', this.addClass);
      this.listenTo( this.targetCl, 'reset', this.renderClasses);

      this.delegateEvents();
    },

    onInputKeyUp: function(e){
      if (e.keyCode === 13) {
        this.addItem();
      }else{
        this.searchItem();
      }
    },

    /**
     * Add new object to collection
     * @param Object Model
     * @param Object Fragment collection
     *
     * @return Object Object created
     * */
    addToClasses: function(model, fragmentEl){
      var fragment  = fragmentEl || null;
      var viewObject  = ClassTagView;

      var view = new viewObject({
          model:  model,
          config: this.config,
      });
      var rendered  = view.render().el;

      if(fragment)
        fragment.appendChild( rendered );
      else
        this.$classes.append(rendered);

      return rendered;
    },

    renderClasses: function() {
      var fragment = document.createDocumentFragment();
      this.$classes.empty();

      this.collection.each(function(model){
        this.addToClasses(model, fragment);
      },this);

      this.$classes.append(fragment);
      return this;
    },


    /** @inheritdoc */
    render : function(){
      this.renderLabel();
      this.renderField();
      this.renderLayers();
      this.$el.attr('class', this.className);
      return this;
    },

  });
});
