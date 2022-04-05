import Backbone from "backbone";
import Model from "./Model";

export default class View<
  TModel extends Model = Model,
  TElement extends Element = HTMLElement
> extends Backbone.View<TModel, TElement> {
  protected get pfx() {
    return this.model.module.config.pfx;
  }

  protected get ppfx() {
    return this.model.module.config.ppfx;
  }

  protected get em() {
    return this.model.module.em;
  }
}
