import EditorModel from "../editor/model/Editor";
import { ModuleConfig } from "./ModuleConfig";

export interface IModule {
  init(cfg: any): void;
  destroy(): void;
  postLoad(key: any): any;
  getConfig(): ModuleConfig;
  onLoad?(): void;
  name: string;
  postRender?(view: any): void;
}

export default abstract class Module<T extends ModuleConfig = ModuleConfig>
  implements IModule
{
  //conf: CollectionCollectionModuleConfig;
  private _em: EditorModel;
  private _config: T;
  cls: any[] = [];
  events: any;

  constructor(
    em: EditorModel,
    confClass: { new (em: EditorModel, module: Module<T>): T }
  ) {
    this._em = em;
    this._config = new confClass(em, this);
  }

  public get em() {
    return this._em;
  }
  public get config() {
    return this._config;
  }
  //abstract name: string;
  isPrivate: boolean = false;
  onLoad?(): void;
  init(cfg: any) {}
  abstract destroy(): void;
  postLoad(key: any): void {}

  get name(): string {
    return this.config.name;
  }

  getConfig() {
    return this.config;
  }

  __logWarn(str: string) {
    this.em.logWarning(`[${this.name}]: ${str}`);
  }

  postRender?(view: any): void;
}
