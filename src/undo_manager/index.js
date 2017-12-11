/**
 * This module allows to manage the stack of changes applied in canvas
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
  let um;
  let config;
  let beforeCache;
  const configDef = {};

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
        },

        redo(model, bf, af, opt) {
          model.set(af);
        }
      };

      const events = ['style', 'attributes', 'content', 'src'];
      events.forEach(ev => um.addUndoType(`change:${ev}`, customUndoType));
      um.changeUndoType('change', { condition: false });
      um.on('undo redo', () => em.trigger('change:selectedComponent change:canvasOffset'));

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
     * Add an entity (Model/Collection) to track
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
      if (em.get('Canvas').isInputFocused()) return;
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
      if (em.get('Canvas').isInputFocused()) return;
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
