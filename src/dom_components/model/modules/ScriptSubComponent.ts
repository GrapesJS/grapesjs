import { isArray, isFunction, isObject } from 'underscore';
import { Model } from '../../../common';
import Component from '../Component';
import { ComponentProperties } from '../types';

export interface ScriptData {
  main: string | ((...params: any[]) => any);
  props: string[];
  variables: Record<string, any | (() => any)>;
  signals: Record<string, { componentId?: string; slot?: string }>;
  slots: Record<string, { script: string | ((...params: any[]) => any) }>;
}
const escapeRegExp = (str: string) => {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
};

function isFunctionEmpty(fn: string) {
  const content = fn.toString().match(/\{([\s\S]*)\}/m)?.[1] || ''; // content between first and last { }
  return content.replace(/^\s*\/\/.*$/gm, '').trim().length === 0; // remove comments
}

type MapJsItem = {
  ids: string[];
  code: string;
  props?: Record<string, any>;
};

export default class ScriptSubComponent extends Model {
  defaults() {
    return {
      main: '',
      props: [],
      variables: {},
      signals: {},
      slots: {},
      scriptUpdated: false,
    };
  }

  constructor(component: Component, script: ScriptData) {
    super({ component, ...script });
    this.listenTo(this, 'change:main', this.scriptUpdated);

    this.listenTo(this.component, 'change:script', this.__scriptChange);
    // this.listenTo(this, 'change:slots', this.__scriptPropsChange);

    // If the component has scripts we need to expose his ID
    let attr = this.component.get('attributes');
    const id = this.component.getId();
    this.component.set('attributes', { ...attr, id }, { silent: true });
  }

  get component(): Component {
    return this.get('component');
  }

  get props(): string[] {
    return this.get('props');
  }

  get dataId() {
    return this.component.getId();
  }

  initScriptProps() {
    const { component } = this;
    const prop = 'props';
    const toListen: any = [`change:${prop}`, this.initScriptProps, this];
    this.off(...toListen);
    const prevProps: string[] = this.previous(prop) || [];
    const newProps: string[] = this.get(prop) || [];
    const prevPropsEv = prevProps.map(e => `change:${e}`).join(' ');
    const newPropsEv = newProps.map(e => `change:${e}`).join(' ');
    prevPropsEv && component.off(prevPropsEv, this.__scriptPropsChange);
    newPropsEv && component.on(newPropsEv, this.__scriptPropsChange);
    // @ts-ignore
    this.on(...toListen);
  }

  __scriptPropsChange(m?: any, v?: any, opts: any = {}) {
    if (opts.avoidStore) return;
    console.log('scriptPropsCHange');
    this.component.trigger('rerender');
  }

  __scriptChange() {
    console.log('scriptPropsCHange');
    const script = this.component.get('script');
    if (isObject(script)) {
      this.set(script);
      this.__scriptPropsChange();
    }
  }

  /**
   * Script updated
   * @private
   */
  scriptUpdated() {
    this.set('scriptUpdated', true);
  }

  __getScriptProps() {
    const modelProps = this.component.props();
    const scrProps = this.props || [];
    return scrProps.reduce((acc, prop) => {
      acc[prop] = modelProps[prop];
      return acc;
    }, {} as Partial<ComponentProperties>);
  }

  /**
   * Return script in string format, cleans 'function() {..' from scripts
   * if it's a function
   * @param {string|Function} script
   * @return {string}
   * @private
   */
  getScriptString(script?: string | Function) {
    const { component } = this;
    let scr: string = script || this.get('main') || '';

    if (!scr) {
      return scr;
    }

    if (this.props) {
      scr = scr.toString().trim();
    } else {
      // Deprecated
      // Need to convert script functions to strings
      if (isFunction(scr)) {
        let scrStr = scr.toString().trim();
        scrStr = scrStr.slice(scrStr.indexOf('{') + 1, scrStr.lastIndexOf('}'));
        scr = scrStr.trim();
      }

      const config = component.em.getConfig();
      const tagVarStart = escapeRegExp(config.tagVarStart || '{[ ');
      const tagVarEnd = escapeRegExp(config.tagVarEnd || ' ]}');
      const reg = new RegExp(`${tagVarStart}([\\w\\d-]*)${tagVarEnd}`, 'g');
      scr = scr.replace(reg, (match, v) => {
        // If at least one match is found I have to track this change for a
        // better optimization inside JS generator
        this.scriptUpdated();
        const result = component.attributes[v] || '';
        return isArray(result) || typeof result == 'object' ? JSON.stringify(result) : result;
      });
    }
    return scr;
  }

  static renderComponentSignals(script: ScriptSubComponent) {
    const signals = script.get('signals');
    return `{${Object.keys(signals)
      .map(
        name =>
          `'${name}': ${
            signals[name] && signals[name].componentId && signals[name].slot
              ? `window.globalSlots['${signals[name].componentId}']['${signals[name].slot}']`
              : '(() => {})'
          }`
      )
      .join(',')}}`;
  }

  static renderSlots(scripts: ScriptSubComponent[]) {
    return `
    window.globalScriptParams = {...window.globalScriptParams, ${scripts
      .map(
        script =>
          `'${script.dataId}': {el: document.getElementById('${
            script.dataId
          }'), signals: ${ScriptSubComponent.renderComponentSignals(script)}, props: ${JSON.stringify(
            script.__getScriptProps()
          )},vars: {${Object.keys(script.variables)
            .map(name => `'${name}': (${script.variables[name]})()`)
            .join(',')}}}`
      )
      .join(',')}
    }
    window.globalSlots  = {...window.globalSlots ${scripts
      .map(script =>
        Object.keys(script.get('slots')).length > 0
          ? `, '${script.dataId}': {${Object.keys(script.get('slots'))
              .map(
                name =>
                  `'${name}': (param) => (${script.get('slots')[name].script})(window.globalScriptParams['${
                    script.dataId
                  }'], param)`
              )
              .join(',')}}`
          : ''
      )
      .join('')}};\n`;
  }

  static renderJs(script: ScriptSubComponent | ScriptSubComponent[]) {
    const scripts = isArray(script) ? script : [script];
    const mapJs = ScriptSubComponent.mapScripts(scripts);

    let code = ScriptSubComponent.renderSlots(scripts);
    for (let type in mapJs) {
      const mapType = mapJs[type];

      if (!mapType.code) {
        continue;
      }

      if (mapJs[type].ids.length == 1) {
        code += `var el = document.getElementById('${mapType.ids[0]}');
        if (!el) return;
        (${mapType.code}.bind(el))(${mapType.props ? `window.globalScriptParams['${mapType.ids[0]}']` : ''});`;
      } else {
        if (mapType.props) {
          if (isFunctionEmpty(mapType.code)) {
            continue;
          }

          code += `
            var props = ${JSON.stringify(mapType.props)};
            var ids = Object.keys(props).map((id) => \`#\${id}\`).join(',');
            var els = document.querySelectorAll(ids);
            for (var i = 0, len = els.length; i < len; i++) {
              var el = els[i];
              (${mapType.code}.bind(el))(props[el.id]);
            }`;
        } else {
          // Deprecated
          const ids = '#' + mapType.ids.join(', #');
          code += `
            var els = document.querySelectorAll('${ids}');
            for (var i = 0, len = els.length; i < len; i++) {
              var el = els[i];
              (function(){\n${mapType.code}\n}.bind(el))();
            }`;
        }
      }
    }

    return code;
  }

  private static mapScripts(scripts: ScriptSubComponent[]) {
    const mapJs: { [key: string]: MapJsItem } = {};

    scripts.forEach(script => {
      const type = script.component.get('type')!;
      const id = script.component.getId();

      const scrStr = script.getScriptString();
      const scrProps = script.props;

      // If the script was updated, I'll put its code in a separate container
      if (script.get('scriptUpdated') && !scrProps) {
        mapJs[type + '-' + id] = { ids: [id], code: scrStr };
      } else {
        let props;
        const mapType = mapJs[type];

        if (scrProps) {
          props = script.__getScriptProps();
        }

        if (mapType) {
          mapType.ids.push(id);
          if (props) mapType.props![id] = props;
        } else {
          const res: MapJsItem = { ids: [id], code: scrStr };
          if (props) res.props = { [id]: props };
          mapJs[type] = res;
        }
      }
    });

    return mapJs;
  }

  get variables() {
    return this.get('variables');
  }

  get signals() {
    return this.get('signals');
  }

  get slots() {
    return this.get('slots');
  }
}
