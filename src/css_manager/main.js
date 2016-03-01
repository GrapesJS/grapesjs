define(function(require) {
  /**
   * @class   CssManager
   * @param   {Object} config Configurations
   *
   * */
  var CssManager  = function(config)
  {
    var c = config || {},
      def = require('./config/config');
    this.CssRules = require('./model/CssRules');

    for (var name in def) {
      if (!(name in c))
        c[name] = def[name];
    }

    this.rules = new this.CssRules([]);
    this.config = c;
  };

  CssManager.prototype  = {

      /**
       * Add new class to collection only if it's not already exists
       * @param {String} name Class name
       *
       * @return  {Object} Model class
       * */
      addRule: function(name){
        var label = name;
        var c = this.getClass(name);
        if(!c)
          return  this.classes.add({name: name, label: label});
        return c;
      },

      /**
       * Get class by its name
       * @param {Array[String]} ids Array of ids
       * @param {String} status Rule status
       * @param {String} set Query set
       *
       * @return  {Object|null}
       * */
      getRule  : function(ids, status, set) {
        var res = this.classes.where({name: id});
        return res.length ? res[0] : null;
      },

      /**
       * Get collection of css rules
       *
       * @return  {Object}
       * */
      getRules : function() {
        return  this.rules;
      },

  };

  return ClassManager;

});