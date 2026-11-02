// @ts-nocheck
/*!
 * Adapted from backbone-undo v0.2.6 (Backbone.Undo.js).
 * https://github.com/osartun/Backbone.Undo.js
 *
 * MIT License
 *
 * Copyright (c) 2013 Oliver Sartun
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
 * OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import Backbone from 'backbone';
import _ from 'underscore';

var core_slice = Array.prototype.slice;

/**
 * As call is faster than apply, this is a faster version of apply as it uses call.
 *
 * @param  {Function} fn 	The function to execute
 * @param  {Object}   ctx 	The context the function should be called in
 * @param  {Array}    args 	The array of arguments that should be applied to the function
 * @return Forwards whatever the called function returns
 */
function apply(fn, ctx, args) {
  return args.length <= 4 ? fn.call(ctx, args[0], args[1], args[2], args[3]) : fn.apply(ctx, args);
}

/**
 * Uses slice on an array or an array-like object.
 *
 * @param  {Array|Object} 	arr 	The array or array-like object.
 * @param  {Number} 		[index]	The index from where the array should be sliced. Default is 0.
 * @return {Array} The sliced array
 */
function slice(arr, index) {
  return core_slice.call(arr, index);
}

/**
 * Checks if an object has one or more specific keys. The keys
 * don't have to be an owned property.
 * You can call this function either this way:
 * hasKeys(obj, ["a", "b", "c"])
 * or this way:
 * hasKeys(obj, "a", "b", "c")
 *
 * @param  {Object}  	obj 	The object to check on
 * @param  {Array}  	keys 	The keys to check for
 * @return {Boolean} True, if the object has all those keys
 */
function hasKeys(obj, keys) {
  if (obj == null) return false;
  if (!_.isArray(keys)) {
    keys = slice(arguments, 1);
  }
  return _.all(keys, function (key) {
    return key in obj;
  });
}

/**
 * Returns a number that is unique per call stack. The number gets
 * changed after the call stack has been completely processed.
 *
 * @return {number} MagicFusionIndex
 */
var getMagicFusionIndex = (function () {
  // If you add several models to a collection or set several
  // attributes on a model all in sequence and yet all for
  // example in one function, then several Undo-Actions are
  // generated.
  // If you want to undo your last action only the last model
  // would be removed from the collection or the last set
  // attribute would be changed back to its previous value.
  // To prevent that we have to figure out a way to combine
  // all those actions that happened "at the same time".
  // Timestamps aren't exact enough. A complex routine could
  // run several milliseconds and in that time produce a lot
  // of actions with different timestamps.
  // Instead we take advantage of the single-threadedness of
  // JavaScript:

  var callstackWasIndexed = false,
    magicFusionIndex = -1;
  function indexCycle() {
    magicFusionIndex++;
    callstackWasIndexed = true;
    _.defer(function () {
      // Here comes the magic. With a Timeout of 0
      // milliseconds this function gets called whenever
      // the current callstack is completed
      callstackWasIndexed = false;
    });
  }
  return function () {
    if (!callstackWasIndexed) {
      indexCycle();
    }
    return magicFusionIndex;
  };
})();

/**
 * To prevent binding a listener several times to one
 * object, we register the objects in an ObjectRegistry
 *
 * @constructor
 */
function ObjectRegistry() {
  // This uses two different ways of storing
  // objects: In case the object has a cid
  // (which Backbone objects typically have)
  // it uses this cid as an index. That way
  // the Array's length attribute doesn't
  // change and the object isn't an item
  // in the array, but an object-property.
  // Otherwise it's added to the Array as an
  // item.
  // That way we can use the fast property-
  // lookup and only have to fall back to
  // iterating over the array in case
  // non-Backbone-objects are registered.
  this.registeredObjects = [];
  // To return a list of all registered
  // objects in the 'get' method we have to
  // store the objects that have a cid in
  // an additional array.
  this.cidIndexes = [];
}
ObjectRegistry.prototype = {
  /**
   * Returns whether the object is already registered in this ObjectRegistry or not.
   *
   * @this 	{ObjectRegistry}
   * @param  	{Object} 		 obj 	The object to check
   * @return 	{Boolean} True if the object is already registered
   */
  isRegistered: function (obj) {
    // This is where we get a performance boost
    // by using the two different ways of storing
    // objects.
    return obj && obj.cid ? this.registeredObjects[obj.cid] : _.contains(this.registeredObjects, obj);
  },
  /**
   * Registers an object in this ObjectRegistry.
   *
   * @this 	{ObjectRegistry}
   * @param  	{Object} 		 obj 	The object to register
   * @return 	{undefined}
   */
  register: function (obj) {
    if (!this.isRegistered(obj)) {
      if (obj && obj.cid) {
        this.registeredObjects[obj.cid] = obj;
        this.cidIndexes.push(obj.cid);
      } else {
        this.registeredObjects.push(obj);
      }
      return true;
    }
    return false;
  },
  /**
   * Unregisters an object from this ObjectRegistry.
   *
   * @this {ObjectRegistry}
   * @param  {Object} obj The object to unregister
   * @return {undefined}
   */
  unregister: function (obj) {
    if (this.isRegistered(obj)) {
      if (obj && obj.cid) {
        delete this.registeredObjects[obj.cid];
        this.cidIndexes.splice(_.indexOf(this.cidIndexes, obj.cid), 1);
      } else {
        var i = _.indexOf(this.registeredObjects, obj);
        this.registeredObjects.splice(i, 1);
      }
      return true;
    }
    return false;
  },
  /**
   * Returns an array of all objects that are currently in this ObjectRegistry.
   *
   * @return {Array} An array of all the objects which are currently in the ObjectRegistry
   */
  get: function () {
    return _.map(
      this.cidIndexes,
      function (cid) {
        return this.registeredObjects[cid];
      },
      this,
    ).concat(this.registeredObjects);
  },
};

/**
 * Binds or unbinds the "all"-listener for one or more objects.
 *
 * @param  {String}   which 	Either "on" or "off"
 * @param  {Object[]} objects 	Array of the objects on which the "all"-listener should be bound / unbound to
 * @param  {Function} [fn] 		The function that should be bound / unbound. Optional in case of "off"
 * @param  {Object}   [ctx] 	The context the function should be called in
 * @return {undefined}
 */
function onoff(which, objects, fn, ctx) {
  for (var i = 0, l = objects.length, obj; i < l; i++) {
    obj = objects[i];
    if (!obj) continue;
    if (which === 'on') {
      if (!ctx.objectRegistry.register(obj)) {
        // register returned false, so obj was already registered
        continue;
      }
    } else {
      if (!ctx.objectRegistry.unregister(obj)) {
        // unregister returned false, so obj wasn't registered
        continue;
      }
    }
    if (_.isFunction(obj[which])) {
      obj[which]('all', fn, ctx);
    }
  }
}

/**
 * Calls the undo/redo-function for a specific action.
 *
 * @param  {String} which 	Either "undo" or "redo"
 * @param  {Object} action 	The Action's attributes
 * @return {undefined}
 */
function actionUndoRedo(which, action) {
  var type = action.type,
    undoTypes = action.undoTypes,
    fn = !undoTypes[type] || undoTypes[type][which];
  if (_.isFunction(fn)) {
    fn(action.object, action.before, action.after, action.options);
  }
}

/**
 * The main undo/redo function.
 *
 * @param  {String} 		which 	    Either "undo" or "redo"
 * @param  {UndoManager} 	manager	    The UndoManager-instance on which an "undo"/"redo"-Event is triggered afterwards
 * @param  {UndoStack} 		stack 	    The UndoStack on which we perform
 * @param  {Boolean} 		magic 	    If true, undoes / redoes all actions with the same magicFusionIndex
 * @param  {Boolean} 		everything  If true, undoes / redoes every action that had been tracked
 * @return {undefined}
 */
function managerUndoRedo(which, manager, stack, magic, everything) {
  if (
    stack.isCurrentlyUndoRedoing ||
    (which === 'undo' && stack.pointer === -1) ||
    (which === 'redo' && stack.pointer === stack.length - 1)
  ) {
    // We're either currently in an undo- / redo-process or
    // we reached the end of the stack
    return;
  }
  stack.isCurrentlyUndoRedoing = true;
  var action,
    actions,
    isUndo = which === 'undo';
  if (everything) {
    // Undo / Redo all steps until you reach the stack's beginning / end
    actions =
      (isUndo && stack.pointer === stack.length - 1) || // If at the stack's end calling undo
      (!isUndo && stack.pointer === -1) // or at the stack's beginning calling redo
        ? _.clone(stack.models) // => Take all the models. Otherwise:
        : core_slice.apply(stack.models, isUndo ? [0, stack.pointer] : [stack.pointer, stack.length - 1]);
  } else {
    // Undo / Redo only one step
    action = stack.at(isUndo ? stack.pointer : stack.pointer + 1);
    actions = magic ? stack.where({ magicFusionIndex: action.get('magicFusionIndex') }) : [action];
  }

  stack.pointer += (isUndo ? -1 : 1) * actions.length;
  while ((action = isUndo ? actions.pop() : actions.shift())) {
    // Here we're calling the Action's undo / redo method
    action[which]();
  }
  stack.isCurrentlyUndoRedoing = false;

  manager.trigger(which, manager);
}

/**
 * Checks whether an UndoAction should be created or not. Therefore it checks
 * whether a "condition" property is set in the undoTypes-object of the specific
 * event type. If not, it returns true. If it's set and a boolean, it returns it.
 * If it's a function, it returns its result, converting it into a boolean.
 * Otherwise it returns true.
 *
 * @param  {Object} 	undoTypesType 	The object within the UndoTypes that holds the function for this event type (i.e. "change")
 * @param  {Arguments} 	args       		The arguments the "condition" function is called with
 * @return {Boolean} 	True, if an UndoAction should be created
 */
function validateUndoActionCreation(undoTypesType, args) {
  var condition = undoTypesType.condition,
    type = typeof condition;
  return type === 'function' ? !!apply(condition, undoTypesType, args) : type === 'boolean' ? condition : true;
}

/**
 * Adds an Undo-Action to the stack.
 *
 * @param {UndoStack} 		stack 		The undostack the action should be added to.
 * @param {String} 			type 		The event type (i.e. "change")
 * @param {Arguments} 		args 		The arguments passed to the undoTypes' "on"-handler
 * @param {OwnedUndoTypes} 	undoTypes 	The undoTypes-object which has the "on"-handler
 * @return {undefined}
 */
function addToStack(stack, type, args, undoTypes) {
  if (
    stack.track &&
    !stack.isCurrentlyUndoRedoing &&
    type in undoTypes &&
    validateUndoActionCreation(undoTypes[type], args)
  ) {
    // An UndoAction should be created
    var res = apply(undoTypes[type]['on'], undoTypes[type], args),
      diff;
    if (hasKeys(res, 'object', 'before', 'after')) {
      res.type = type;
      res.magicFusionIndex = getMagicFusionIndex();
      res.undoTypes = undoTypes;
      if (stack.pointer < stack.length - 1) {
        // New Actions must always be added to the end of the stack.
        // If the pointer is not pointed to the last action in the
        // stack, presumably because actions were undone before, then
        // all following actions must be discarded
        var diff = stack.length - stack.pointer - 1;
        while (diff--) {
          stack.pop();
        }
      }
      stack.pointer = stack.length;
      stack.add(res);
      if (stack.length > stack.maximumStackLength) {
        stack.shift();
        stack.pointer--;
      }
    }
  }
}

/**
 * Predefined UndoTypes object with default handlers for the most common events.
 * @type {Object}
 */
var UndoTypes = {
  add: {
    undo: function (collection, ignore, model, options) {
      // Undo add = remove
      collection.remove(model, options);
    },
    redo: function (collection, ignore, model, options) {
      // Redo add = add
      if (options.index) {
        options.at = options.index;
      }
      collection.add(model, options);
    },
    on: function (model, collection, options) {
      return {
        object: collection,
        before: undefined,
        after: model,
        options: _.clone(options),
      };
    },
  },
  remove: {
    undo: function (collection, model, ignore, options) {
      if ('index' in options) {
        options.at = options.index;
      }
      collection.add(model, options);
    },
    redo: function (collection, model, ignore, options) {
      collection.remove(model, options);
    },
    on: function (model, collection, options) {
      return {
        object: collection,
        before: model,
        after: undefined,
        options: _.clone(options),
      };
    },
  },
  change: {
    undo: function (model, before, after, options) {
      if (_.isEmpty(before)) {
        _.each(_.keys(after), model.unset, model);
      } else {
        model.set(before);
        if (options && options.unsetData && options.unsetData.before && options.unsetData.before.length) {
          _.each(options.unsetData.before, model.unset, model);
        }
      }
    },
    redo: function (model, before, after, options) {
      if (_.isEmpty(after)) {
        _.each(_.keys(before), model.unset, model);
      } else {
        model.set(after);
        if (options && options.unsetData && options.unsetData.after && options.unsetData.after.length) {
          _.each(options.unsetData.after, model.unset, model);
        }
      }
    },
    on: function (model, options) {
      var afterAttributes = model.changedAttributes(),
        keysAfter = _.keys(afterAttributes),
        previousAttributes = _.pick(model.previousAttributes(), keysAfter),
        keysPrevious = _.keys(previousAttributes),
        unsetData = ((options || (options = {})).unsetData = {
          after: [],
          before: [],
        });

      if (keysAfter.length != keysPrevious.length) {
        // There are new attributes or old attributes have been unset
        if (keysAfter.length > keysPrevious.length) {
          // New attributes have been added
          _.each(
            keysAfter,
            function (val) {
              if (!(val in previousAttributes)) {
                unsetData.before.push(val);
              }
            },
            this,
          );
        } else {
          // Old attributes have been unset
          _.each(keysPrevious, function (val) {
            if (!(val in afterAttributes)) {
              unsetData.after.push(val);
            }
          });
        }
      }
      return {
        object: model,
        before: previousAttributes,
        after: afterAttributes,
        options: _.clone(options),
      };
    },
  },
  reset: {
    undo: function (collection, before, after) {
      collection.reset(before);
    },
    redo: function (collection, before, after) {
      collection.reset(after);
    },
    on: function (collection, options) {
      return {
        object: collection,
        before: options.previousModels,
        after: _.clone(collection.models),
      };
    },
  },
};

/**
 * Every UndoManager instance has an own undoTypes object
 * which is an instance of OwnedUndoTypes. OwnedUndoTypes'
 * prototype is the global UndoTypes object. Changes to the
 * global UndoTypes object take effect on every instance of
 * UndoManager as the object is its prototype. And yet every
 * local UndoTypes object can be changed individually.
 *
 * @constructor
 */
function OwnedUndoTypes() {}
OwnedUndoTypes.prototype = UndoTypes;

/**
 * Adds, changes or removes an undo-type from an UndoTypes-object.
 * You can call it this way:
 * manipulateUndoType (1, "reset", {"on": function () {}}, undoTypes)
 * or this way to perform bulk actions:
 * manipulateUndoType (1, {"reset": {"on": function () {}}}, undoTypes)
 * In case of removing undo-types you can pass an Array for performing
 * bulk actions:
 * manipulateUndoType(2, ["reset", "change"], undoTypes)
 *
 * @param  {Number} 				  manipType 		Indicates the kind of action to execute: 0 for add, 1 for change, 2 for remove
 * @param  {String|Object|Array} 	  undoType 			The type of undoType that should be added/changed/removed. Can be an object / array to perform bulk actions
 * @param  {Object} 				  [fns] 			Object with the functions to add / change. Is optional in case you passed an object as undoType that contains these functions
 * @param  {OwnedUndoTypes|UndoTypes} undoTypesInstance The undoTypes object to act on
 * @return {undefined}
 */
function manipulateUndoType(manipType, undoType, fns, undoTypesInstance) {
  // manipType, passed by the calling function
  // 0: add
  // 1: change
  // 2: remove
  if (typeof undoType === 'object') {
    // bulk action. Iterate over this data.
    return _.each(undoType, function (val, key) {
      if (manipType === 2) {
        // remove
        // undoType is an array
        manipulateUndoType(manipType, val, fns, undoTypesInstance);
      } else {
        // undoType is an object
        manipulateUndoType(manipType, key, val, fns);
      }
    });
  }

  switch (manipType) {
    case 0: // add
      if (hasKeys(fns, 'undo', 'redo', 'on') && _.all(_.pick(fns, 'undo', 'redo', 'on'), _.isFunction)) {
        undoTypesInstance[undoType] = fns;
      }
      break;
    case 1: // change
      if (undoTypesInstance[undoType] && _.isObject(fns)) {
        // undoTypeInstance[undoType] may be a prototype's property
        // So, if we did this _.extend(undoTypeInstance[undoType], fns)
        // we would extend the object on the prototype which means
        // that this change would have a global effect
        // Instead we just want to manipulate this instance. That's why
        // we're doing this:
        undoTypesInstance[undoType] = _.extend({}, undoTypesInstance[undoType], fns);
      }
      break;
    case 2: // remove
      delete undoTypesInstance[undoType];
      break;
  }
  return this;
}

/**
 * Instantiating "Action" creates the UndoActions that
 * are collected in an UndoStack. It holds all relevant
 * data to undo / redo an action and has an undo / redo
 * method.
 */
var Action = Backbone.Model.extend({
    defaults: {
      type: null, // "add", "change", "reset", etc.
      object: null, // The object on which the action occurred
      before: null, // The previous values which were changed with this action
      after: null, // The values after this action
      magicFusionIndex: null, // The magicFusionIndex helps to combine
      // all actions that occurred "at the same time" to undo/redo them altogether
    },
    /**
     * Undoes this action.
     * @param  {OwnedUndoTypes|UndoTypes} undoTypes The undoTypes object which contains the "undo"-handler that should be used
     * @return {undefined}
     */
    undo: function (undoTypes) {
      actionUndoRedo('undo', this.attributes);
    },
    /**
     * Redoes this action.
     * @param  {OwnedUndoTypes|UndoTypes} undoTypes The undoTypes object which contains the "redo"-handler that should be used
     * @return {undefined}
     */
    redo: function (undoTypes) {
      actionUndoRedo('redo', this.attributes);
    },
  }),
  /**
   * An UndoStack is a collection of UndoActions in
   * chronological order.
   */
  UndoStack = Backbone.Collection.extend({
    model: Action,
    pointer: -1, // The pointer indicates the index where we are located within the stack. We start at -1
    track: false,
    isCurrentlyUndoRedoing: false,
    maximumStackLength: Infinity,
    setMaxLength: function (val) {
      this.maximumStackLength = val;
    },
  }),
  /**
   * An instance of UndoManager can keep track of
   * changes to objects and helps to undo them.
   */
  UndoManager = Backbone.Model.extend({
    defaults: {
      maximumStackLength: Infinity,
      track: false,
    },
    /**
     * The constructor function.
     * @param  {attr} 		[attr] Object with parameters. The available parameters are:
     *                         	   - maximumStackLength {number} 	Set the undo-stack's maximum size
     *                             - track 				{boolean}	Start tracking changes right away
     * @return {undefined}
     */
    initialize: function (attr) {
      this.stack = new UndoStack();
      this.objectRegistry = new ObjectRegistry();
      this.undoTypes = new OwnedUndoTypes();

      // sync the maximumStackLength attribute with our stack
      this.stack.setMaxLength(this.get('maximumStackLength'));
      this.on(
        'change:maximumStackLength',
        function (model, value) {
          this.stack.setMaxLength(value);
        },
        this,
      );

      // Start tracking, if attr.track == true
      if (attr && attr.track) {
        this.startTracking();
      }

      // Register objects passed in the "register" attribute
      if (attr && attr.register) {
        if (_.isArray(attr.register) || _.isArguments(attr.register)) {
          apply(this.register, this, attr.register);
        } else {
          this.register(attr.register);
        }
      }
    },
    /**
     * Starts tracking. Changes of registered objects won't be processed until you've called this function
     * @return {undefined}
     */
    startTracking: function () {
      this.set('track', true);
      this.stack.track = true;
    },
    /**
     * Stops tracking. Afterwards changes of registered objects won't be processed.
     * @return {undefined}
     */
    stopTracking: function () {
      this.set('track', false);
      this.stack.track = false;
    },
    /**
     * Return the state of the tracking
     * @return {boolean}
     */
    isTracking: function () {
      return this.get('track');
    },
    /**
     * This is the "all"-handler which is bound to registered
     * objects. It creates an UndoAction from the event and adds
     * it to the stack.
     *
     * @param  {String} 	type 	The event type
     * @return {undefined}
     */
    _addToStack: function (type) {
      addToStack(this.stack, type, slice(arguments, 1), this.undoTypes);
    },
    /**
     * Registers one or more objects to track their changes.
     * @param {...Object} 	obj 	The object or objects of which changes should be tracked
     * @return {undefined}
     */
    register: function () {
      onoff('on', arguments, this._addToStack, this);
    },
    /**
     * Unregisters one or more objects.
     * @param {...Object} 	obj 	The object or objects of which changes shouldn't be tracked any longer
     * @return {undefined}
     */
    unregister: function () {
      onoff('off', arguments, this._addToStack, this);
    },
    /**
     * Unregisters all previously registered objects.
     * @return {undefined}
     */
    unregisterAll: function () {
      apply(this.unregister, this, this.objectRegistry.get());
    },
    /**
     * Undoes the last action or the last set of actions in case 'magic' is true.
     * @param {Boolean} 	[magic] 	If true, all actions that happened basically at the same time are undone together
     * @return {undefined}
     */
    undo: function (magic) {
      managerUndoRedo('undo', this, this.stack, magic);
    },

    /**
     * Undoes all actions ever tracked by the undo manager
     * @return {undefined}
     */
    undoAll: function () {
      managerUndoRedo('undo', this, this.stack, false, true);
    },

    /**
     * Redoes a previously undone action or a set of actions.
     * @param {Boolean} 	[magic] 	If true, all actions that happened basically at the same time are redone together
     * @return {undefined}
     */
    redo: function (magic) {
      managerUndoRedo('redo', this, this.stack, magic);
    },

    /**
     * Redoes all actions ever tracked by the undo manager
     * @return {undefined}
     */
    redoAll: function () {
      managerUndoRedo('redo', this, this.stack, false, true);
    },
    /**
     * Checks if there's an action in the stack that can be undone / redone
     * @param  {String} 	type 	Either "undo" or "redo"
     * @return {Boolean} True if there is a set of actions which can be undone / redone
     */
    isAvailable: function (type) {
      var s = this.stack,
        l = s.length;

      switch (type) {
        case 'undo':
          return l > 0 && s.pointer > -1;
        case 'redo':
          return l > 0 && s.pointer < l - 1;
        default:
          return false;
      }
    },
    /**
     * Sets the stack-reference to the stack of another undoManager.
     * @param  {UndoManager} 	undoManager 	The undoManager whose stack-reference is set to this stack
     * @return {undefined}
     */
    merge: function (undoManager) {
      // This sets the stack-reference to the stack of another
      // undoManager so that the stack of this other undoManager
      // is used by two different managers.
      // This enables to set up a main-undoManager and besides it
      // several others for special, exceptional cases (by using
      // instance-based custom UndoTypes). Models / collections
      // which need this special treatment are only registered at
      // those special undoManagers. Those special ones are then
      // merged into the main-undoManager to write on its stack.
      // That way it's easier to manage exceptional cases.
      var args = _.isArray(undoManager) ? undoManager : slice(arguments),
        manager;
      while ((manager = args.pop())) {
        if (manager instanceof UndoManager && manager.stack instanceof UndoStack) {
          // set the stack reference to our stack
          manager.stack = this.stack;
        }
      }
    },
    /**
     * Add an UndoType to this specific UndoManager-instance.
     * @param {String} type The event this UndoType is made for
     * @param {Object} fns  An object of functions that are called to generate the data for an UndoAction or to process it. Must have the properties "undo", "redo" and "on". Can have the property "condition".
     * @return {undefined}
     */
    addUndoType: function (type, fns) {
      manipulateUndoType(0, type, fns, this.undoTypes);
    },
    /**
     * Overwrite properties of an existing UndoType for this specific UndoManager-instance.
     * @param  {String} type The event the UndoType is made for
     * @param  {Object} fns  An object of functions that are called to generate the data for an UndoAction or to process it. It extends the existing object.
     * @return {undefined}
     */
    changeUndoType: function (type, fns) {
      manipulateUndoType(1, type, fns, this.undoTypes);
    },
    /**
     * Remove one or more UndoTypes of this specific UndoManager-instance to fall back to the global UndoTypes.
     * @param  {String|Array} type The event the UndoType that should be removed is made for. You can also pass an array of events.
     * @return {undefined}
     */
    removeUndoType: function (type) {
      manipulateUndoType(2, type, undefined, this.undoTypes);
    },

    /**
     * Removes all actions from the stack.
     * @return {undefined}
     */
    clear: function () {
      this.stack.reset();
      this.stack.pointer = -1;
    },
  });

_.extend(UndoManager, {
  /**
   * Change the UndoManager's default attributes
   * @param  {Object} defaultAttributes An object with the new default values.
   * @return {undefined}
   */
  defaults: function (defaultAttributes) {
    _.extend(UndoManager.prototype.defaults, defaultAttributes);
  },
  /**
   * Add an UndoType to the global UndoTypes-object.
   * @param  {String} type The event this UndoType is made for
   * @param  {Object} fns  An object of functions that are called to generate the data for an UndoAction or to process it. Must have the properties "undo", "redo" and "on". Can have the property "condition".
   * @return {undefined}
   */
  addUndoType: function (type, fns) {
    manipulateUndoType(0, type, fns, UndoTypes);
  },
  /**
   * Overwrite properties of an existing UndoType in the global UndoTypes-object.
   * @param  {String} type The event the UndoType is made for
   * @param  {Object} fns  An object of functions that are called to generate the data for an UndoAction or to process it. It extends the existing object.
   * @return {undefined}
   */
  changeUndoType: function (type, fns) {
    manipulateUndoType(1, type, fns, UndoTypes);
  },
  /**
   * Remove one or more UndoTypes of this specific UndoManager-instance to fall back to the global UndoTypes.
   * @param  {String|Array} type The event the UndoType that should be removed is made for. You can also pass an array of events.
   * @return {undefined}
   */
  removeUndoType: function (type) {
    manipulateUndoType(2, type, undefined, UndoTypes);
  },
});

Backbone.UndoManager = UndoManager;

export default UndoManager;
