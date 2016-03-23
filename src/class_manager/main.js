define(function(require) {
  /**
   * @class   ClassManager
   * @param   {Object} config Configurations
   *
   * */
  var ClassManager  = function(config)
  {
    var c = config || {},
      def = require('./config/config');
    this.ClassTags = require('./model/ClassTags');
    this.ClassTagsView = require('./view/ClassTagsView');

    for (var name in def) {
      if (!(name in c))
        c[name] = def[name];
    }

    this.classes = new this.ClassTags(c.defaults);
    this.config = c;
  };

  ClassManager.prototype  = {

      /**
       * Add new class to collection only if it's not already exists
       * @param {String} name Class name
       *
       * @return  {Object} Model class
       * */
      addClass: function(name){
        var label = name;
        var c = this.getClass(name);
        if(!c)
          return  this.classes.add({name: name, label: label});
        return c;
      },

      /**
       * Get class by its name
       * @param {String} id Class name
       *
       * @return  {Object|null}
       * */
      getClass  : function(id) {
        var res = this.classes.where({name: id});
        return res.length ? res[0] : null;
      },

      /**
       * Get collection of classes
       *
       * @return  {Object}
       * */
      getClasses : function() {
        return  this.classes;
      },

  };

  return ClassManager;

});