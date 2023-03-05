import { isArray, isUndefined } from 'underscore';
import { AddOptions, Collection } from '../common';
import ModuleModel from './ModuleModel';

type ModuleExt<TModel extends ModuleModel> = TModel extends ModuleModel<infer M> ? M : unknown;
type ModelConstructor<TModel extends ModuleModel> = { new (mod: ModuleExt<TModel>, attr: any): TModel };

export default class ModuleCollection<TModel extends ModuleModel = ModuleModel> extends Collection<TModel> {
  module!: ModuleExt<TModel>;
  private newModel!: ModelConstructor<TModel>;

  add(model: Array<Record<string, any>> | TModel, options?: AddOptions): TModel;
  add(models: Array<Array<Record<string, any>> | TModel>, options?: AddOptions): TModel[];
  add(model?: unknown, options?: AddOptions): any {
    //Note: the undefined case needed because backbonejs not handle the reset() correctly
    var models = isArray(model) ? model : !isUndefined(model) ? [model] : undefined;

    models = models?.map(m => (m instanceof this.newModel ? m : new this.newModel(this.module, m))) ?? [undefined];

    return super.add(isArray(model) ? models : models[0], options);
  }

  constructor(
    module: ModuleExt<TModel>,
    models: TModel[] | Array<Record<string, any>>,
    modelConstructor: ModelConstructor<TModel>
  ) {
    super(models, { module, modelConstructor });
  }

  preinitialize(models?: TModel[] | Array<Record<string, any>>, options?: any) {
    this.newModel = options.modelConstructor;
    this.module = options.module;
  }
}
