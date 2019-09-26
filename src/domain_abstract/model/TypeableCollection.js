import { isFunction } from 'underscore';
import Backbone from 'backbone';

const Model = Backbone.Model;
const View = Backbone.View;

export default {
  types: [],

  initialize(models, opts) {
    this.model = (attrs = {}, options = {}) => {
      let Model, View, type;

      if (attrs && attrs.type) {
        const baseType = this.getBaseType();
        type = this.getType(attrs.type);
        Model = type ? type.model : baseType.model;
        View = type ? type.view : baseType.view;
      } else {
        const typeFound = this.recognizeType(attrs);
        type = typeFound.type;
        Model = type.model;
        View = type.view;
        attrs = typeFound.attributes;
      }

      const model = new Model(attrs, options);
      model.typeView = View;
      return model;
    };
    const init = this.init && this.init.bind(this);
    init && init();
  },

  /**
   * Recognize type by any value
   * @param  {mixed} value
   * @return {Object} Found type
   */
  recognizeType(value) {
    const types = this.getTypes();

    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      let typeFound = type.isType(value);
      typeFound =
        typeof typeFound == 'boolean' && typeFound
          ? { type: type.id }
          : typeFound;

      if (typeFound) {
        return {
          type,
          attributes: typeFound
        };
      }
    }

    // If, for any reason, the type is not found it'll return the base one
    return {
      type: this.getBaseType(),
      attributes: value
    };
  },

  /**
   * Returns the base type (last object in the stack)
   * @return {Object}
   */
  getBaseType() {
    const types = this.getTypes();
    return types[types.length - 1];
  },

  /**
   * Get types
   * @return {Array}
   */
  getTypes() {
    return this.types;
  },

  /**
   * Get type
   * @param {string} id Type ID
   * @return {Object} Type definition
   */
  getType(id) {
    const types = this.getTypes();

    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      if (type.id === id) {
        return type;
      }
    }
  },

  /**
   * Add new type
   * @param {string} id Type ID
   * @param {Object} definition Definition of the type. Each definition contains
   *                            `model` (business logic), `view` (presentation logic)
   *                            and `isType` function which recognize the type of the
   *                            passed entity
   * addType('my-type', {
   *  model: {},
   *  view: {},
   *  isType: (value) => {},
   * })
   */
  addType(id, definition) {
    const type = this.getType(id);
    const baseType = this.getBaseType();
    const ModelInst = type ? type.model : baseType.model;
    const ViewInst = type ? type.view : baseType.view;
    let { model, view, isType } = definition;
    model =
      model instanceof Model || isFunction(model)
        ? model
        : ModelInst.extend(model || {});
    view =
      view instanceof View || isFunction(view)
        ? view
        : ViewInst.extend(view || {});

    if (type) {
      type.model = model;
      type.view = view;
      type.isType = isType || type.isType;
    } else {
      definition.id = id;
      definition.model = model;
      definition.view = view;
      definition.isType =
        isType ||
        function(value) {
          if (value && value.type == id) {
            return true;
          }
        };
      this.getTypes().unshift(definition);
    }
  }
};
