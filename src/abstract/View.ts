import Backbone from 'backbone';
import Model from './Model';

export default class View<
  TModel extends Model = Model,
  TElement extends Element = HTMLElement
> extends Backbone.View<TModel, TElement> {
  protected get pfx() {
    return (this.model.module.em.config as any).stylePrefix || '';
  }

  protected get ppfx() {
    return this.pfx + this.model.module.config.stylePrefix || '';
  }

  protected get em() {
    return this.model.module.em;
  }
}
