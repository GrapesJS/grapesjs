import Backbone from 'backbone';
import Module, { IBaseModule } from './Module';

export default class Model<
  TModule extends IBaseModule<any> = Module,
  T extends Backbone.ObjectHash = any,
  S = Backbone.ModelSetOptions,
  E = any
> extends Backbone.Model<T, S, E> {
  private _module: TModule;

  constructor(
    module: TModule,
    attributes?: T,
    options?: Backbone.CombinedModelConstructorOptions<E>
  ) {
    super(attributes, options);
    this._module = module;
  }

  public get module() {
    return this._module;
  }

  public get config(): TModule extends IBaseModule<infer C> ? C : unknown {
    return this._module.config;
  }

  public get em() {
    return this._module.em;
  }
}
