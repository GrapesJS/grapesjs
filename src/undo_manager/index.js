/**
 * This module allows to manage the stack of changes applied on canvas
 *
 * You can access the module in this way
 * ```js
 * const undoManager = editor.UndoManager;
 * ```
 *
 */
import UndoManager from 'backbone-undo';

module.exports = () => {
  let em;
  let config;
  let um;
  let beforeCache;
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
      em = config.em;
      this.em = em;
      um = new UndoManager({ track: true, register: [] });
      um.changeUndoType('change', { condition: false });
      const updated = () => em.trigger('change:selectedComponent');
      const customUndoType = {
        on(object, value, opt = {}) {
          !beforeCache && (beforeCache = object.previousAttributes());

          if (opt.avoidStore) {
            return;
          } else {
            const result = {
              object,
              before: beforeCache,
              after: object.toJSON()
            };
            beforeCache = null;
            return result;
          }
        },

        undo(model, bf, af, opt) {
          model.set(bf);
          updated();
        },

        redo(model, bf, af, opt) {
          model.set(af);
          updated();
        }
      };

      const events = ['style', 'attributes', 'content', 'src'];
      events.forEach(ev => um.addUndoType(`change:${ev}`, customUndoType));

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
      um.startTracking();
    },


    /**
     * Stop tracking changes
     */
    stop() {
      um.stopTracking();
    },


    /**
     * Undo last change
     */
    undo() {
      um.undo(1);
    },


    /**
     * Undo all changes
     */
    undoAll() {
      um.undoAll();
    },


    /**
     * Redo last change
     */
    redo() {
      um.redo(1);
    },


    /**
     * Redo all changes
     */
    redoAll() {
      um.redoAll();
    },


    /**
     * Checks if there is an available undo
     * @return {Boolean}
     */
    hasUndo() {
      return um.isAvailable('undo');
    },


    /**
     * Checks if there is an available redo
     * @return {Boolean}
     */
    hasRedo() {
      return um.isAvailable('redo');
    },


    /**
     * Get stack of changes
     * @return {Array}
     */
    getStack() {
      return um.stack;
    },

    /**
     * Clear the stack
     */
    clear() {
      um.clear();
    }
  };
};
