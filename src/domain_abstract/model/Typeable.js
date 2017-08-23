export default {
  /**
   * Get types
   * @return {Array}
   */
  getTypes() {
    return [];
  },

  /**
   * Get type
   * @param {string} id Type ID
   *
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

    if (type) {
      type.model = definition.model;
      type.view = definition.view;
      type.isType = definition.isType;
    } else {
      definition.id = id;
      this.getTypes().unshift(definition);
    }
  }
}
