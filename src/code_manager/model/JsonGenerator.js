let Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  /** @inheritdoc */
  build(model) {
    let json = model.toJSON();
    this.beforeEach(json);

    _.each(
      json,
      function(v, attr) {
        let obj = json[attr];
        if (obj instanceof Backbone.Model) {
          json[attr] = this.build(obj);
        } else if (obj instanceof Backbone.Collection) {
          let coll = obj;
          json[attr] = [];
          if (coll.length) {
            coll.each(function(el, index) {
              json[attr][index] = this.build(el);
            }, this);
          }
        }
      },
      this
    );

    return json;
  },

  /**
   * Execute on each object
   * @param {Object} obj
   */
  beforeEach(obj) {
    delete obj.status;
  }
});
