import { each } from 'underscore';
import { Model, Collection } from '../../common';

export default class JsonGenerator extends Model {
  build(model) {
    var json = model.toJSON();
    this.beforeEach(json);

    each(
      json,
      function (v, attr) {
        var obj = json[attr];
        if (obj instanceof Model) {
          json[attr] = this.build(obj);
        } else if (obj instanceof Collection) {
          var coll = obj;
          json[attr] = [];
          if (coll.length) {
            coll.each(function (el, index) {
              json[attr][index] = this.build(el);
            }, this);
          }
        }
      },
      this
    );

    return json;
  }

  /**
   * Execute on each object
   * @param {Object} obj
   */
  beforeEach(obj) {
    delete obj.status;
  }
}
