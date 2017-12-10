/**
 * This module allows to create shortcuts for functions and commands (via command id)
 *
 * You can access the module in this way
 * ```js
 * const undoManager = editor.UndoManager;
 * ```
 *
 */
import UndoManager from 'backbone-undo';

module.exports = () => {
  let config;
  let um;
  const configDef = {};
  const keymaps = {};

  /*
  const canvas = this.get('Canvas');

  if (this.um) {
    return;
  }

  var cmp = this.get('DomComponents');
  if(cmp && this.config.undoManager) {
    var that = this;
    this.um = new UndoManager({
        register: [cmp.getComponents(), this.get('CssComposer').getAll()],
        track: true
    });
    this.UndoManager = this.um;
    this.set('UndoManager', this.um);

    key('⌘+z, ctrl+z', () => {
      if (canvas.isInputFocused()) {
        return;
      }

      that.um.undo(true);
      that.trigger('component:update');
    });

    key('⌘+shift+z, ctrl+shift+z', () => {
      if (canvas.isInputFocused()) {
        return;
      }
      that.um.redo(true);
      that.trigger('component:update');
    });

    var beforeCache;
    const customUndoType = {
      on: function (model, value, opts) {
        var opt = opts || {};
        if(!beforeCache){
          beforeCache = model.previousAttributes();
        }
        if (opt && opt.avoidStore) {
          return;
        } else {
          var obj = {
              object: model,
              before: beforeCache,
              after: model.toJSON()
          };
          beforeCache = null;
          return obj;
        }
      },
      undo: function (model, bf, af, opt) {
        model.set(bf);
        // Update also inputs inside Style Manager
        that.trigger('change:selectedComponent');
      },
      redo: function (model, bf, af, opt) {
        model.set(af);
        // Update also inputs inside Style Manager
        that.trigger('change:selectedComponent');
      }
    };

    UndoManager.removeUndoType("change");
    UndoManager.addUndoType("change:style", customUndoType);
    UndoManager.addUndoType("change:attributes", customUndoType);
    UndoManager.addUndoType("change:content", customUndoType);
    UndoManager.addUndoType("change:src", customUndoType);
  }
   */

  return {

    name: 'UndoManager',


    /**
     * Initialize module
     * @param {Object} config Configurations
     * @private
     */
    init(opts = {}) {
      config = { ...opts, ...configDef };
      this.em = config.em;
      um = new UndoManager({ track: true, register: [] });
      return this;
    },


    /**
     * Get module configurations
     * @return {Object} Configuration object
     */
    getConfig() {
      return config;
    },


    /**
     * Add an entity (Model/Collection) to track changes
     * @param {Model|Collection} entity Entity to track
     */
    add(entity) {
      um.register(entity);
    },


    /**
     * Remove and stop tracking the entity (Model/Collection)
     * @param {Model|Collection} entity Entity to remove
     */
    remove(entity) {
      um.unregister(entity);
    },


    /**
     * Remove all entities
     */
    removeAll() {
      um.unregisterAll()
    },


    /**
     * Start/resume tracking changes
     */
    start() {
      em.startTracking();
    },


    /**
     * Stop tracking changes
     */
    stop() {
      em.stopTracking();
    },


    /**
     * Undo last change
     */
    undo() {
      em.undo(1);
    },


    /**
     * Undo all changes
     */
    undoAll() {
      em.undoAll();
    },


    /**
     * Redo last change
     */
    redo() {
      em.redo(1);
    },


    /**
     * Redo all changes
     */
    redoAll() {
      em.redoAll();
    },


    /**
     * Get stack of changes
     * @return {Array}
     */
    getStack() {

    },

    /**
     * Clear the stack
     */
    clear() {

    }
  };
};
