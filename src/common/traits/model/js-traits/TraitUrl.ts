import Trait from '../Trait';
import TraitListUnique from '../TraitListUnique';
import TraitModifier from '../TraitModifier';
import { jsModifier, jsVariable } from '../TraitModifierJs';
import TraitObject from '../TraitObject';
import TraitObjectItem from '../TraitObjectItem';
import TraitVariable, { VariableType } from './TraitVariable';

export default class TraitUrl extends TraitObject<{ url: string; variables: { [id: string]: VariableType } }> {
  constructor(target: Trait<{ url: string; variables: { [id: string]: VariableType } }>) {
    super(target);
    // target.opts.type = 'object';
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
      new TraitObjectItem('url', this, { type: 'text', label: 'url' }),
      new TraitListUnique(
        new TraitObjectItem('variables', this, {
          type: 'unique-list',
          traits: { type: 'variable' },
          label: false,
          editable: false,
        })
      ),
    ];
  }

  // private static overrideValue(value: { url: string; variables: { [id: string]: string } }) {
  //   const variableNames = TraitUrl.parseUrlToVariables(value.url);
  //   console.log('aaa', variableNames);
  //   const oldVariables = value.variables ?? {};
  //   const variables = Object.fromEntries(variableNames.map(name => [name, oldVariables[name]]));
  //   console.log('aaa', variables);
  //   return { ...value, variables };
  // }

  protected static overrideValue(value: { url: string; variables: { [id: string]: VariableType } }) {
    let url = value.url;
    console.log(value);
    console.log(value.url);
    const variableNames = TraitUrl.parseUrlToVariables(value.url);
    console.log(variableNames);
    // variableNames.forEach(name => {
    //   let variable = value.variables[name] ?? '';
    //   console.log(variable);
    //   url = url.replaceAll(`<${name}>`, `\${${variable}}`);
    // });
    // console.log(url);

    const oldVariables = value.variables ?? {};
    const variables = Object.fromEntries(variableNames.map(name => [name, oldVariables[name]]));
    console.log('urlTe', variables);
    // return jsModifier(jsVariable('`' + url + '`'))({ ...value, variables });
    return { url, variables };
  }

  static renderJs(value: { url: string; variables: { [id: string]: VariableType } }, paramJsName: string) {
    let url = value.url;
    console.log(value);
    console.log(value.url);
    const variableNames = TraitUrl.parseUrlToVariables(value.url);
    console.log(variableNames);
    variableNames.forEach(name => {
      let variable = TraitVariable.renderJs(value.variables[name], `${paramJsName}?.${name}`);
      console.log(variable);
      url = url.replaceAll(`<${name}>`, `\${${variable}}`);
    });
    console.log('urlTest', url, variableNames, value.variables);
    return '`' + url + '`';
  }

  private static parseUrlToVariables(url?: string): string[] {
    return url ? Array.from(url.matchAll(/(?<=<)[\w\d]+(?=>)/g), m => m[0]) : [];
  }

  protected setValue(value: { url: string; variables: { [id: string]: VariableType } }): void {
    super.setValue(TraitUrl.overrideValue(value));
    console.log('setValue', value);
    console.log('setValue', this.children);

    const variablesTrait = this.children.find(tr => tr.name == 'variables');
    console.log('setValue', variablesTrait);
    // if (variablesTrait){
    //     variablesTrait.children =
    //   Object.keys(this.value.variables).map(name => new TraitObjectItem(name, variablesTrait, {type: "variable"}))
    // }

    variablesTrait?.setValueFromModel();
    // this.setValueFromModel();
    this.onUpdateEvent();
    // this.target.view?.onUpdateEvent(this.value, true);

    console.log('aaa', this.value);
  }
}
