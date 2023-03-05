import { Model, ObjectHash, SetOptions, CombinedModelConstructorOptions } from '../common';
import EditorModel from '../editor/model/Editor';
import Module, { IBaseModule } from './Module';

export default class ModuleModel<
  TModule extends IBaseModule<any> = Module,
  T extends ObjectHash = any,
  S = SetOptions,
  E = any
> extends Model<T, S, E> {
  private _module: TModule;

  constructor(module: TModule, attributes?: T, options?: CombinedModelConstructorOptions<E>) {
    super(attributes, options);
    this._module = module;
  }

  public get module() {
    return this._module;
  }

  public get config(): TModule extends IBaseModule<infer C> ? C : unknown {
    return this._module.config;
  }

  public get em(): EditorModel {
    return this._module.em;
  }
}
