import { isArray, isFunction } from 'underscore';
import { Model } from '../../../common';
import Component from '../Component';
import { ComponentProperties } from '../types';

export interface ScriptData {
  main: string | ((...params: any[]) => any);
  props: string[];
}
const escapeRegExp = (str: string) => {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
};

export default class ScriptSubComponent extends Model {
  defaults() {
    return {
      main: '',
      props: [],
      scriptUpdated: false,
    };
  }

  constructor(component: Component, script: ScriptData) {
    super({ component, ...script });
    this.listenTo(this, 'change:main', this.scriptUpdated);
  }

  get component() {
    return this.get('component');
  }

  get props(): string[] {
    return this.get('props');
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

  __scriptPropsChange(m: any, v: any, opts: any = {}) {
    if (opts.avoidStore) return;
    this.component.trigger('rerender');
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
}
