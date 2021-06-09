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
import { isArray, isBoolean, isEmpty } from 'underscore';

export default () => {
  let em;
  let um;
  let config;
  let beforeCache;
  const configDef = {
    maximumStackLength: 500,
    trackSelection: 1
  };
  const hasSkip = opts => opts.avoidStore || opts.noUndo;
  const getChanged = obj => Object.keys(obj.changedAttributes());

  return {
    name: 'UndoManager',

    /**
     * Initialize module
     * @param {Object} config Configurations
     * @private
     */
    init(opts = {}) {
      config = { ...configDef, ...opts };
      em = config.em;
      this.em = em;
      const fromUndo = true;
      um = new UndoManager({ track: true, register: [], ...config });
      um.changeUndoType('change', {
        condition: object => {
          const hasUndo = object.get('_undo');
          if (hasUndo) {
            const undoExc = object.get('_undoexc');
            if (isArray(undoExc)) {
              if (getChanged(object).some(chn => undoExc.indexOf(chn) >= 0))
                return false;
            }
            if (isBoolean(hasUndo)) return true;
            if (isArray(hasUndo)) {
              if (getChanged(object).some(chn => hasUndo.indexOf(chn) >= 0))
                return true;
            }
          }
          return false;
        },
        on(object, v, opts) {
          !beforeCache && (beforeCache = object.previousAttributes());
          const opt = opts || v || {};
          opt.noUndo &&
            setTimeout(() => {
              beforeCache = null;
            });
          if (hasSkip(opt)) {
            return;
          } else {
            const after = object.toJSON({ fromUndo });
            const result = {
              object,
              before: beforeCache,
              after
            };
            beforeCache = null;
            // Skip undo in case of empty changes
            if (isEmpty(after)) return;

            return result;
          }
        }
      });
      um.changeUndoType('add', {
        on: (model, collection, options = {}) => {
          if (hasSkip(options) || !this.isRegistered(collection)) return;
          return {
            object: collection,
            before: undefined,
            after: model,
            options: { ...options, fromUndo }
          };
        }
      });
      um.changeUndoType('remove', {
        on: (model, collection, options = {}) => {
          if (hasSkip(options) || !this.isRegistered(collection)) return;
          return {
            object: collection,
            before: model,
            after: undefined,
            options: { ...options, fromUndo }
          };
        }
      });

      um.on('undo redo', () => {
        em.trigger('component:toggled change:canvasOffset');
        em.getSelectedAll().map(c => c.trigger('rerender:layer'));
      });
      ['undo', 'redo'].forEach(ev => um.on(ev, () => em.trigger(ev)));

      return this;
    },

    postLoad() {
      config.trackSelection && em && this.add(em.get('selected'));
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
    undo(all = true) {
      !em.isEditing() && um.undo(all);
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
    redo(all = true) {
      !em.isEditing() && um.redo(all);
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
     * Check if the entity (Model/Collection) to tracked
     * Note: New Components and CSSRules will be added automatically
     * @param {Model|Collection} entity Entity to track
     * @returns {Boolean}
     */
    isRegistered(obj) {
      return !!this.getInstance().objectRegistry.isRegistered(obj);
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
     * Get grouped undo manager stack.
     * The difference between `getStack` is when you do multiple operations at a time,
     * like appending multiple components:
     * `editor.getWrapper().append(`<div>C1</div><div>C2</div>`);`
     * `getStack` will return a collection length of 2.
     *  `getStackGroup` instead will group them as a single operation (the first
     * inserted component will be returned in the list) by returning an array length of 1.
     * @return {Array}
     */
    getStackGroup() {
      const result = [];
      const inserted = [];

      this.getStack().forEach(item => {
        const index = item.get('magicFusionIndex');
        if (inserted.indexOf(index) < 0) {
          inserted.push(index);
          result.push(item);
        }
      });

      return result;
    },

    __getStackRead() {
      const result = {};
      const createItem = item => {
        const { type, after, before, object } = item.attributes;
        return {
          type,
          after,
          before,
          object
        };
      };
      this.getStack().forEach(item => {
        const index = item.get('magicFusionIndex');
        const value = createItem(item);
        if (!result[index]) result[index] = [value];
        else result[index].push(value);
      });
      return Object.keys(result).map(i => result[i]);
    },

    getPointer() {
      return this.getStack().pointer;
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
    },

    destroy() {
      this.clear().removeAll();
      [em, um, config, beforeCache].forEach(i => (i = {}));
      this.em = {};
    }
  };
};
