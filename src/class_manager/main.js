define(function(require) {
  /**
   * @class   ClassManager
   * @param   {Object} config Configurations
   *
   * */
  var ClassManager  = function(config)
  {
    var c = config || {},
      def = require('./config/config'),
      ClassTags = require('./model/ClassTags'),
      ClassTagsView = require('./view/ClassTagsView');

    for (var name in def) {
      if (!(name in c))
        c[name] = def[name];
    }

    this.classes = new ClassTags(c.classes);

    var obj = {
        collection: this.classes,
        config: c,
    };
    this.tagsView  = new ClassTagsView(obj);
    //this.ClassTagsView  = new ClassTagsView(obj);
  };

  ClassManager.prototype  = {

      /**
       * Get collection of classes
       *
       * @return  {Object}
       * */
      getClasses : function() {
        return  this.classes;
      },

      /**
       * Get class by its name
       *
       * @return  {Object|null}
       * */
      getClass  : function(id) {
        var res = this.classes.where({name: id});
        return res.length ? res[0] : null;
      },

      /**
       * Add new class to collection only if it's not already exists
       * @param {String} name Class name
       * @return  {Object} Model class
       * */
      addClass: function(name){
        var label = name;
        var fname = this.escapeName(name);
        var c = this.getClass(fname);
        if(!c)
          return  this.classes.add({name: fname, label: label});
        return c;
      },

      /**
       * Escape string
       * @param {String} name
       * @return {String}
       */
      escapeName: function(name) {
        return name.toLowerCase().replace(/([^a-z0-9\w]+)/gi, '-');
      },

      /**
       * Renders a collection of class tags. Useful for components classes
       * @return {Object} Rendered view
       */
      renderTags: function(){
          return this.tagsView.render().el;
      },
  };

  return ClassManager;

});