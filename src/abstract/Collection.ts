import Backbone, { AddOptions } from 'backbone';
import { isArray, isObject } from 'underscore';
import Model from './Model';

type Module<TModel extends Model> = TModel extends Model<infer M> ? M : unknown;
type ModelConstructor<TModel extends Model> = { new (mod: Module<TModel>, attr: any): TModel };

export default class Collection<TModel extends Model = Model> extends Backbone.Collection<TModel> {
  module!: Module<TModel>;
  private newModel!: { new (mod: Module<TModel>, attr: any): TModel };

  //modelConstructor = {new (mod: Module<TModel>, attr: any): TModel}
  add(model: Array<Record<string, any>> | TModel, options?: AddOptions): TModel;
  add(models: Array<Array<Record<string, any>> | TModel>, options?: AddOptions): TModel[];
  add(model: unknown, options?: AddOptions): any {
    var models = isArray(model) ? model : [model];
    models = models.map(m => (m instanceof this.newModel ? m : new this.newModel(this.module, m)));
    return super.add(isArray(model) ? models : models[0], options);
  }

  constructor(
    module: Module<TModel>,
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
