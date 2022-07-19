import Backbone from 'backbone';
import Collection from './Collection';
import Model from './Model';
import { IBaseModule } from './Module';

type ModuleFromModel<TModel extends Model> = TModel extends Model<infer M> ? M : unknown;
type Module<TItem extends Model | Collection> = TItem extends Collection<infer M>
  ? ModuleFromModel<M>
  : TItem extends Model<infer M>
  ? M
  : unknown;

type TCollection<TItem extends Model | Collection> = TItem extends Collection ? TItem : unknown;

export default class View<
  TModel extends Model | Collection = Model,
  TElement extends Element = HTMLElement
> extends Backbone.View<TModel extends Model ? TModel : undefined, TElement> {
  protected get pfx() {
    return this.ppfx + (this.config as any).stylePrefix || '';
  }

  protected get ppfx() {
    return this.em.config.stylePrefix || '';
  }

  collection!: TModel extends Model ? Collection<Model> : TModel;

  protected get module(): Module<TModel> {
    return (this.model as any)?.module ?? this.collection.module;
  }

  protected get em() {
    return this.module.em;
  }

  protected get config(): Module<TModel> extends IBaseModule<infer C> ? C : unknown {
    return this.module.config as any;
  }

  public className!: string;

  preinitialize(options?: any) {
    this.className = '';
  }
}
