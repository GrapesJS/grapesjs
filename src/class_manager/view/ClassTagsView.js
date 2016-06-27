define(['backbone', 'text!./../template/classTags.html', './ClassTagView'],
  function (Backbone, tagsTemplate, ClassTagView) {
  /**
   * @class ClassTagsView
   * */
  return Backbone.View.extend({

    template: _.template(tagsTemplate),

    events: {},

    initialize: function(o) {
      this.config = o.config || {};
      this.pfx = this.config.stylePrefix || '';
      this.className = this.pfx + 'tags';
      this.addBtnId = this.pfx + 'add-tag';
      this.newInputId = this.pfx + 'new';
      this.stateInputId = this.pfx + 'states';
      this.stateInputC = this.pfx + 'input-c';
      this.states = this.config.states || [];
      this.events['click #' + this.addBtnId] = 'startNewTag';
      this.events['blur #' + this.newInputId] = 'endNewTag';
      this.events['keyup #' + this.newInputId] = 'onInputKeyUp';
      this.events['change #' + this.stateInputId] = 'stateChanged';

      this.target  = this.config.target;

      this.listenTo(this.target ,'change:selectedComponent',this.componentChanged);
      this.listenTo(this.target, 'targetClassUpdated', this.updateSelector);

      this.listenTo(this.collection, 'add', this.addNew);
      this.listenTo(this.collection, 'reset', this.renderClasses);
      this.listenTo(this.collection, 'remove', this.tagRemoved);

      this.delegateEvents();
    },

    /**
     * Triggered when a tag is removed from collection
     * @param {Object} model Removed model
     */
    tagRemoved: function(model){
      this.updateStateVis();
    },

    /**
     * Create select input with states
     * @return {string} String of options
     */
    getStateOptions: function(){
      var strInput = '';
      for(var i = 0; i < this.states.length; i++){
        strInput += '<option value="' + this.states[i].name + '">' + this.states[i].label + '</option>';
      }
      return strInput;
    },

    /**
     * Add new model
     * @param {Object} model
     */
    addNew: function(model){
      this.addToClasses(model);
    },

    /**
     * Start tag creation
     * @param {Object} e
     *
     */
    startNewTag: function(e) {
      this.$addBtn.hide();
      this.$input.show().focus();
    },

    /**
     * End tag creation
     * @param {Object} e
     *
     */
    endNewTag: function(e) {
      this.$addBtn.show();
      this.$input.hide().val('');
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
    },

    /**
     * Triggered when component is changed
     * @param  {Object} e
     */
    componentChanged: function(e){
      this.compTarget = this.target.get('selectedComponent');
      if(this.compTarget)
        this.$states.val(this.compTarget.get('state'));
      var models = this.compTarget ? this.compTarget.get('classes').models : [];
      this.collection.reset(models);
      this.updateStateVis();
    },

    /**
     * Update states visibility. Hides states in case there is no tags
     * inside collection
     */
    updateStateVis: function(){
      if(this.collection.length)
        this.$statesC.css('display','block');
      else
        this.$statesC.css('display','none');
      this.updateSelector();
    },

    /**
     * Udpate selector helper
     * @return {this}
     * @private
     */
    updateSelector: function(){
      this.compTarget = this.target.get('selectedComponent');
      if(!this.compTarget || !this.compTarget.get)
        return;
      var result = '';
      var models = this.compTarget.get('classes');
      models.each(function(model){
        if(model.get('active'))
          result += '.' + model.get('name');
      });
      var state = this.compTarget.get('state');
      result = state ? result + ':' + state : result;
      this.el.querySelector('#' + this.pfx + 'sel').innerHTML = result;
    },

    /**
     * Triggered when the select with states is changed
     * @param  {Object} e
     */
    stateChanged: function(e){
      if(this.compTarget){
        this.compTarget.set('state', this.$states.val());
        if(this.target)
          this.target.trigger('targetStateUpdated');
        this.updateSelector();
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

        if(this.compTarget){
          var targetCls = this.compTarget.get('classes');
          var lenB = targetCls.length;
          targetCls.add(model);
          var lenA = targetCls.length;
          this.collection.add(model);

          if(lenA > lenB)
            this.target.trigger('targetClassAdded');

          this.updateStateVis();
        }
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
          coll: this.collection,
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
      this.$states = this.$el.find('#' + this.stateInputId);
      this.$statesC = this.$el.find('#' + this.stateInputC);
      this.$states.append(this.getStateOptions());
      this.renderClasses();
      this.$el.attr('class', this.className);
      return this;
    },

  });
});
