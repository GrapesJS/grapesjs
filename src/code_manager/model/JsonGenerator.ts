import { each } from 'underscore';
import { Model, Collection } from '../../common';
import Component from '../../dom_components/model/Component';

type ComponentProps = Record<string, any>;

export default class JsonGenerator extends Model {
  build(model: Component) {
    // @ts-ignore
    const json = model.toJSON() as ComponentProps;
    this.beforeEach(json);

    each(json, (v, attr) => {
      const obj = json[attr];
      if (obj instanceof Model) {
        // @ts-ignore
        json[attr] = this.build(obj);
      } else if (obj instanceof Collection) {
        const coll = obj;
        json[attr] = [];
        if (coll.length) {
          coll.forEach((el, index) => {
            json[attr][index] = this.build(el);
          });
        }
      }
    });

    return json;
  }

  /**
   * Execute on each object
   * @param {Object} obj
   */
  beforeEach(obj: ComponentProps) {
    delete obj.status;
  }
}
