import Module from "./Module";

export abstract class ModuleConfig {
  protected abstract stylePrefix?: string;
  private: boolean = false;
  abstract name: string;
  module: Module;

  public get pfx() {
    return this.module.em.getConfig() || "";
  }
  public get ppfx() {
    return this.pfx + this.stylePrefix || "";
  }

  constructor(module: Module) {
    this.module = module;
    //console.log(module.name)
    /*const moduleConfig: { [id: string]: any } =
      config[module.name as keyof EditorConfig];
    if (moduleConfig) {
      for (const key in moduleConfig) {
        if (Object.prototype.hasOwnProperty.call(this, key)) {
          console.log(key);
          const element = moduleConfig[key];
        }
      }
    }*/
  }
}
