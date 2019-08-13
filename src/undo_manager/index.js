/**
 * This module allows to manage the stack of changes applied in canvas.
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const um = editor.UndoManager;
 * ```
 *
 * * [getConfig](#getconfig)
 * * [add](#add)
 * * [remove](#remove)
 * * [removeAll](#removeall)
 * * [start](#start)
 * * [stop](#stop)
 * * [undo](#undo)
 * * [undoAll](#undoall)
 * * [redo](#redo)
 * * [redoAll](#redoall)
 * * [hasUndo](#hasundo)
 * * [hasRedo](#hasredo)
 * * [getStack](#getstack)
 * * [clear](#clear)
 *
 * @module UndoManager
 */

import UndoManager from 'backbone-undo';

export default () => {
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
      um.changeUndoType('change', { condition: false });
      um.changeUndoType('add', {
        on(model, collection, options = {}) {
          if (options.avoidStore) return;
          return {
            object: collection,
            before: undefined,
            after: model,
            options: { ...options }
          };
        }
      });
      um.changeUndoType('remove', {
        on(model, collection, options = {}) {
          if (options.avoidStore) return;
          return {
            object: collection,
            before: model,
            after: undefined,
            options: { ...options }
          };
        }
      });
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
      um.on('undo redo', () =>
        em.trigger('component:toggled change:canvasOffset')
      );
      ['undo', 'redo'].forEach(ev => um.on(ev, () => em.trigger(ev)));

      return this;
    },

    /**
     * Get module configurations
     * @return {Object} Configuration object
     * @example
     * const config = um.getConfig();
     * // { ... }
     */
    getConfig() {
      return config;
    },

    /**
     * Add an entity (Model/Collection) to track
     * Note: New Components and CSSRules will be added automatically
     * @param {Model|Collection} entity Entity to track
     * @return {this}
     * @example
     * um.add(someModelOrCollection);
     */
    add(entity) {
      um.register(entity);
      return this;
    },

    /**
     * Remove and stop tracking the entity (Model/Collection)
     * @param {Model|Collection} entity Entity to remove
     * @return {this}
     * @example
     * um.remove(someModelOrCollection);
     */
    remove(entity) {
      um.unregister(entity);
      return this;
    },

    /**
     * Remove all entities
     * @return {this}
     * @example
     * um.removeAll();
     */
    removeAll() {
      um.unregisterAll();
      return this;
    },

    /**
     * Start/resume tracking changes
     * @return {this}
     * @example
     * um.start();
     */
    start() {
      um.startTracking();
      return this;
    },

    /**
     * Stop tracking changes
     * @return {this}
     * @example
     * um.stop();
     */
    stop() {
      um.stopTracking();
      return this;
    },

    /**
     * Undo last change
     * @return {this}
     * @example
     * um.undo();
     */
    undo() {
      !em.isEditing() && um.undo(1);
      return this;
    },

    /**
     * Undo all changes
     * @return {this}
     * @example
     * um.undoAll();
     */
    undoAll() {
      um.undoAll();
      return this;
    },

    /**
     * Redo last change
     * @return {this}
     * @example
     * um.redo();
     */
    redo() {
      !em.isEditing() && um.redo(1);
      return this;
    },

    /**
     * Redo all changes
     * @return {this}
     * @example
     * um.redoAll();
     */
    redoAll() {
      um.redoAll();
      return this;
    },

    /**
     * Checks if exists an available undo
     * @return {Boolean}
     * @example
     * um.hasUndo();
     */
    hasUndo() {
      return um.isAvailable('undo');
    },

    /**
     * Checks if exists an available redo
     * @return {Boolean}
     * @example
     * um.hasRedo();
     */
    hasRedo() {
      return um.isAvailable('redo');
    },

    /**
     * Get stack of changes
     * @return {Collection}
     * @example
     * const stack = um.getStack();
     * stack.each(item => ...);
     */
    getStack() {
      return um.stack;
    },

    /**
     * Clear the stack
     * @return {this}
     * @example
     * um.clear();
     */
    clear() {
      um.clear();
      return this;
    },

    getInstance() {
      return um;
    }
  };
};
