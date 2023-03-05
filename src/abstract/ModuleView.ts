import ModuleCollection from './ModuleCollection';
import ModuleModel from './ModuleModel';
import { IBaseModule } from './Module';
import { View } from '../common';
import EditorModel from '../editor/model/Editor';

type ModuleFromModel<TModel extends ModuleModel> = TModel extends ModuleModel<infer M> ? M : unknown;
type ModuleModelExt<TItem extends ModuleModel | ModuleCollection> = TItem extends ModuleCollection<infer M>
  ? ModuleFromModel<M>
  : TItem extends ModuleModel<infer M>
  ? M
  : unknown;

// type TCollection<TItem extends ModuleModel | ModuleCollection> = TItem extends ModuleCollection ? TItem : unknown;

export default class ModuleView<
  TModel extends ModuleModel | ModuleCollection = ModuleModel,
  TElement extends Element = HTMLElement
> extends View<TModel extends ModuleModel ? TModel : undefined, TElement> {
  protected get pfx() {
    return this.ppfx + (this.config as any).stylePrefix || '';
  }

  protected get ppfx() {
    return this.em.config.stylePrefix || '';
  }

  collection!: TModel extends ModuleModel ? ModuleCollection<ModuleModel> : TModel;

  protected get module(): ModuleModelExt<TModel> {
    return (this.model as any)?.module ?? this.collection.module;
  }

  protected get em(): EditorModel {
    return this.module.em;
  }

  protected get config(): ModuleModelExt<TModel> extends IBaseModule<infer C> ? C : unknown {
    return this.module.config as any;
  }

  public className!: string;

  preinitialize(options?: any) {
    this.className = '';
  }
}
