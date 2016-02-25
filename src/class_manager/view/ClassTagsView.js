define(['backbone', 'text!./../template/classTags.html', './ClassTagView'],
  function (Backbone, tagsTemplate, ClassTagView) {
  /**
   * @class ClassTagsView
   * */
  return Backbone.View.extend({

    template: _.template(tagsTemplate),

    events:{
      'click .add': 'startNewClass',
    },

    initialize: function(o) {
      this.config = o.config || {};
      this.pfx = this.config.stylePrefix;
      this.className = this.pfx + 'tags';
      this.addBtnId = this.pfx + 'add-tag';
      this.newInputId = this.pfx + 'new';
      this.events['click #' + this.addBtnId] = 'startNewTag';
      this.events['blur #' + this.newInputId] = 'endNewTag';
      this.events['keyup #' + this.newInputId] = 'onInputKeyUp';

      this.target  = this.config.target;

      this.listenTo( this.target ,'change:selectedComponent',this.componentChanged);

      this.listenTo( this.collection, 'add', this.addNew);
      this.listenTo( this.collection, 'reset', this.renderClasses);

      this.delegateEvents();
    },

    /**
     * Add new model
     * @param {Object} model
     */
    addNew: function(model){
      this.addToClasses(model);
    },

    /**
     * Start new tag event
     * @param {Object} e
     *
     */
    startNewTag: function(e) {
      this.$addBtn.hide();
      this.$input.show().focus();
    },

    /**
     * Start new tag event
     * @param {Object} e
     *
     */
    endNewTag: function(e) {
      this.$addBtn.show();
      this.$input.hide().val('');
    },


    /**
     * Add new class tag
     * @param {Object} model
     *
     */
    addTag: function(model){

    },

    /**
     * Triggered when component is changed
     * @param  {Object} e
     */
    componentChanged: function(e){
      this.compTarget = this.target.get('selectedComponent');
      var models = this.compTarget ? this.compTarget.get('classes').models : [];
      this.collection.reset(models);
    },

    /**
     * Checks what to do on keyup event
     * @param  {Object} e
     */
    onInputKeyUp: function(e) {
      if (e.keyCode === 13)
        this.addNewTag(this.$input.val());
      else if(e.keyCode === 27)
        this.endNewTag();
      else{
        //this.searchItem();
        //console.log('search');
      }
    },

    /**
     * Add new tag to collection, if possible, and to the component
     * @param  {Object} e
     */
    addNewTag: function(name){
      if(!name)
        return;

      if(this.target){
        var cm = this.target.get('ClassManager');
        var model = cm.addClass(name);

        if(this.compTarget)
          this.compTarget.get('classes').add(model);

      }
      this.endNewTag();
    },

    /**
     * Add new object to collection
     * @param   {Object} model  Model
     * @param   {Object} fragmentEl   Fragment collection
     *
     * @return {Object} Object created
     * */
    addToClasses: function(model, fragmentEl) {
      var fragment  = fragmentEl || null;

      var view = new ClassTagView({
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

    /**
     * Render the collection of classes
     * @return {this}
     */
    renderClasses: function() {
      var fragment = document.createDocumentFragment();

      this.collection.each(function(model){
        this.addToClasses(model, fragment);
      },this);

      if(this.$classes)
        this.$classes.empty().append(fragment);

      return this;
    },


    /** @inheritdoc */
    render : function(){
      this.$el.html( this.template({
        label: this.config.label,
        statesLabel: this.config.statesLabel,
        pfx: this.pfx,
      }));
      this.$input = this.$el.find('input#' + this.newInputId);
      this.$addBtn = this.$el.find('#' + this.addBtnId);
      this.$classes = this.$el.find('#' + this.pfx + 'tags-c');
      this.renderClasses();
      this.$el.attr('class', this.className);
      return this;
    },

  });
});
