import { Model } from '../../common';
import Component from '../../dom_components/model/Component';
import ScriptSubComponent from '../../dom_components/model/modules/ScriptSubComponent';

export default class JsGenerator extends Model {
  private collectScripts(model: Component): ScriptSubComponent[] {
    const comps = model.get('components')!;
    const scripts: ScriptSubComponent[] = [];
    comps.forEach(comp => scripts.push(...this.collectScripts(comp)));
    return model.scriptSubComp ? [model.scriptSubComp, ...scripts] : scripts;
  }

  build(model: Component) {
    const scripts = this.collectScripts(model);
    return ScriptSubComponent.renderJs(scripts);
  }
}
