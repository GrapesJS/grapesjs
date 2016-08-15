/**
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [remove](#remove)
 * * [store](#store)
 * * [load](#load)
 * * [render](#render)
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var classManager = editor.ClassManager;
 * ```
 *
 * @module ClassManager
 */
define(function(require) {

  return function(config) {
    var c = config || {},
      def = require('./config/config');
    ClassTags = require('./model/ClassTags');
    ClassTagsView = require('./view/ClassTagsView');

    for (var name in def) {
      if (!(name in c))
        c[name] = def[name];
    }

    classes = new ClassTags(c.defaults);
    config = c;

    return {

      config: config,

      ClassTags: ClassTags,

      ClassTagsView: ClassTagsView,

      /**
       * Name of the module
       * @type {String}
       * @private
       */
      name: 'ClassManager',

      /**
       * Indicates if module is public
       * @type {Boolean}
       * @private
       */
      public: true,

      /**
       * Add new class to collection only if it's not already exists
       * @param {String} name Class name
       * @return {Model}
       * */
      addClass: function(name){
        var label = name;
        var c = this.getClass(name);
        if(!c)
          return  classes.add({name: name, label: label});
        return c;
      },

      /**
       * Get class by its name
       * @param {String} id Class name
       *
       * @return  {Object|null}
       * */
      getClass: function(id) {
        return classes.where({name: id})[0];
      },

      /**
       * Get the collection of classes
       * @return  {Collection}
       * */
      getAllClasses: function() {
        return  classes;
      },

    };
  };

});