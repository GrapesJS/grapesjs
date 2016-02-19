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
      Classes = require('./model/Classes');

    for (var name in def) {
      if (!(name in c))
        c[name] = def[name];
    }

    this.classes = new Classes(c.classes);

    this.Classes = Classes;
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
  };

  return ClassManager;

});