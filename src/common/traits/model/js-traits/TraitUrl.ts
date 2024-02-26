import Trait from '../Trait';
import TraitModifier from '../TraitModifier';
import { jsModifier, jsVariable } from '../TraitModifierJs';
import TraitObject from '../TraitObject';
import TraitObjectItem from '../TraitObjectItem';

export default class TraitUrl extends TraitObject<{ urlRaw: string; variables: { [id: string]: string } }> {
  constructor(target: Trait<{ urlRaw: string; variables: { [id: string]: string } }>) {
    super(target);
    target.opts.type = 'object';
    const variables = Object.entries(target.value.variables ?? {});
    console.log(variables);
    console.log('traits');

    // const targetJsModifier = new TraitModifierJs(trait, jsVariable(this.renderJs))
    // const parseVariables = new TraitModifier(this, TraitUrl.overrideValue)
    // parseVariables.registerForUpdateEvent(this);
  }

  protected initChildren() {
    const { target } = this;

    return [
      new TraitObjectItem('urlRaw', this, { type: 'text', label: 'url' }),
      new TraitObjectItem('variables', this, {
        type: 'unique-list',
        traits: { type: 'link' },
        label: false,
        editable: false,
      }),
    ];
  }

  private static overrideValue(value: { urlRaw: string; variables: { [id: string]: string } }) {
    const variableNames = TraitUrl.parseUrlToVariables(value.urlRaw);
    console.log('aaa', variableNames);
    const oldVariables = value.variables ?? {};
    const variables = Object.fromEntries(variableNames.map(name => [name, oldVariables[name]]));
    console.log('aaa', variables);
    return { ...value, variables };
  }
  protected overrideValue(value: { urlRaw: string; variables: { [id: string]: string } }) {
    let url = value.urlRaw;
    console.log(value);
    console.log(value.urlRaw);
    const variableNames = TraitUrl.parseUrlToVariables(value.urlRaw);
    console.log(variableNames);
    variableNames.forEach(name => {
      let variable = value.variables[name] ?? '';
      console.log(variable);
      url = url.replaceAll(`<${name}>`, `\${${variable}}`);
    });
    console.log(url);
    return jsModifier(jsVariable('`' + url + '`'))(value);
  }

  private static renderJs(value: { urlRaw: string; variables: { [id: string]: string } }) {
    let url = value.urlRaw;
    console.log(value);
    console.log(value.urlRaw);
    const variableNames = TraitUrl.parseUrlToVariables(value.urlRaw);
    console.log(variableNames);
    variableNames.forEach(name => {
      let variable = value.variables[name] ?? '';
      console.log(variable);
      url = url.replaceAll(`<${name}>`, `\${${variable}}`);
    });
    console.log(url);
    return '`' + url + '`';
  }

  private static parseUrlToVariables(url?: string): string[] {
    return url ? Array.from(url.matchAll(/(?<=<)[\w\d]+(?=>)/g), m => m[0]) : [];
  }

  protected setValue(value: { urlRaw: string; variables: { [id: string]: string } }): void {
    super.setValue(value);
    const variablesTrait = this.target.children.find(tr => tr.opts.name == 'variables');
    // if (variablesTrait){
    //     variablesTrait.children =
    // Object.keys(this.value.variables).map(name => new TraitObject(name, variablesTrait, {type: "link"}))
    // }
    variablesTrait?.setValueFromModel();
    // variablesTrait?.view?.onUpdateEvent(this.value, true)
    this.target.view?.onUpdateEvent(this.value, true);

    console.log('aaa', this.value);
  }
}
