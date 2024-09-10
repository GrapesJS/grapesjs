import { isArray, isString, keys } from 'underscore';
import { Model, ObjectAny, ObjectHash, SetOptions } from '../../common';
import ParserHtml from '../../parser/model/ParserHtml';
import Selectors from '../../selector_manager/model/Selectors';
import { shallowDiff } from '../../utils/mixins';
import EditorModel from '../../editor/model/Editor';
import StyleDataVariable from '../../data_sources/model/StyleDataVariable';
import { DataVariableType } from '../../data_sources/model/DataVariable';
import DataVariableListenerManager from '../../data_sources/model/DataVariableListenerManager';

export type StyleProps = Record<
  string,
  | string
  | string[]
  | {
      type: typeof DataVariableType;
      defaultValue: string;
      path: string;
    }
>;

export type UpdateStyleOptions = SetOptions & {
  partial?: boolean;
  addStyle?: StyleProps;
  inline?: boolean;
  noEvent?: boolean;
};

const parserHtml = ParserHtml();

export const getLastStyleValue = (value: string | string[]) => {
  return isArray(value) ? value[value.length - 1] : value;
};

export default class StyleableModel<T extends ObjectHash = any> extends Model<T> {
  em?: EditorModel;
  dataVariableListeners: Record<string, DataVariableListenerManager> = {};

  /**
   * Parse style string to an object
   * @param  {string} str
   * @returns
   */
  parseStyle(str: string) {
    return parserHtml.parseStyle(str);
  }

  /**
   * Trigger style change event with a new object instance
   * @param {Object} prop
   * @return {Object}
   */
  extendStyle(prop: ObjectAny): ObjectAny {
    return { ...this.getStyle(), ...prop };
  }

  /**
   * Get style object
   * @return {Object}
   */
  getStyle(prop?: string | ObjectAny): StyleProps {
    const style = this.get('style') || {};
    const result: ObjectAny = { ...style };
    if (this.em) {
      const resolvedStyle = this.resolveDataVariables({ ...result });
      // @ts-ignore
      return prop && isString(prop) ? resolvedStyle[prop] : resolvedStyle;
    }
    return prop && isString(prop) ? result[prop] : result;
  }

  /**
   * Set new style object
   * @param {Object|string} prop
   * @param {Object} opts
   * @return {Object} Applied properties
   */
  setStyle(prop: string | ObjectAny = {}, opts: UpdateStyleOptions = {}) {
    if (isString(prop)) {
      prop = this.parseStyle(prop);
    }

    const propOrig = this.getStyle(opts);

    if (opts.partial || opts.avoidStore) {
      opts.avoidStore = true;
      prop.__p = true;
    } else {
      delete prop.__p;
    }

    const propNew = { ...prop };
    const newStyle = { ...propNew };

    keys(newStyle).forEach((key) => {
      // Remove empty style properties
      if (newStyle[key] === '') {
        delete newStyle[key];
        return;
      }

      const styleValue = newStyle[key];
      if (typeof styleValue === 'object' && styleValue.type === DataVariableType) {
        const styleDataVariable = new StyleDataVariable(styleValue, { em: this.em });
        newStyle[key] = styleDataVariable;
        this.manageDataVariableListener(styleDataVariable, key);
      }
    });

    this.set('style', newStyle, opts as any);

    const diff = shallowDiff(propOrig, newStyle);
    // Delete the property used for partial updates
    delete diff.__p;

    keys(diff).forEach((pr) => {
      const { em } = this;
      if (opts.noEvent) {
        return;
      }

      this.trigger(`change:style:${pr}`);
      if (em) {
        em.trigger('styleable:change', this, pr, opts);
        em.trigger(`styleable:change:${pr}`, this, pr, opts);
      }
    });

    return newStyle;
  }

  /**
   * Manage DataVariableListenerManager for a style property
   */
  manageDataVariableListener(dataVar: StyleDataVariable, styleProp: string) {
    if (this.dataVariableListeners[styleProp]) {
      this.dataVariableListeners[styleProp].listenToDataVariable();
    } else {
      this.dataVariableListeners[styleProp] = new DataVariableListenerManager({
        model: this,
        em: this.em!,
        dataVariable: dataVar,
        updateValueFromDataVariable: (newValue: string) => this.updateStyleProp(styleProp, newValue),
      });
    }
  }

  /**
   * Update a specific style property
   */
  updateStyleProp(prop: string, value: string) {
    const style = this.getStyle();
    style[prop] = value;
    this.setStyle(style, { noEvent: true });
    this.trigger(`change:style:${prop}`);
  }

  /**
   * Resolve data variables to their actual values
   */
  resolveDataVariables(style: StyleProps): StyleProps {
    const resolvedStyle = { ...style };
    keys(resolvedStyle).forEach((key) => {
      const styleValue = resolvedStyle[key];

      if (typeof styleValue === 'string' || Array.isArray(styleValue)) {
        return;
      }

      if (
        typeof styleValue === 'object' &&
        styleValue.type === DataVariableType &&
        !(styleValue instanceof StyleDataVariable)
      ) {
        const dataVar = new StyleDataVariable(styleValue, { em: this.em });
        resolvedStyle[key] = dataVar.getDataValue();
      }

      if (styleValue instanceof StyleDataVariable) {
        resolvedStyle[key] = styleValue.getDataValue();
      }
    });
    return resolvedStyle;
  }

  /**
   * Add style property
   * @param {Object|string} prop
   * @param {string} value
   * @example
   * this.addStyle({color: 'red'});
   * this.addStyle('color', 'blue');
   */
  addStyle(prop: string | ObjectAny, value: any = '', opts: UpdateStyleOptions = {}) {
    if (typeof prop == 'string') {
      prop = {
        [prop]: value,
      };
    } else {
      opts = value || {};
    }

    opts.addStyle = prop;
    prop = this.extendStyle(prop);
    this.setStyle(prop, opts);
  }

  /**
   * Remove style property
   * @param {string} prop
   */
  removeStyle(prop: string) {
    let style = this.getStyle();
    delete style[prop];
    this.setStyle(style);
  }

  /**
   * Returns string of style properties
   * @param {Object} [opts={}] Options
   * @return {String}
   */
  styleToString(opts: ObjectAny = {}) {
    const result: string[] = [];
    const style = this.getStyle(opts);
    const imp = opts.important;

    for (let prop in style) {
      const important = isArray(imp) ? imp.indexOf(prop) >= 0 : imp;
      const firstChars = prop.substring(0, 2);
      const isPrivate = firstChars === '__';

      if (isPrivate) continue;

      const value = style[prop];
      const values = isArray(value) ? (value as string[]) : [value];

      (values as string[]).forEach((val: string) => {
        const value = `${val}${important ? ' !important' : ''}`;
        value && result.push(`${prop}:${value};`);
      });
    }

    return result.join('');
  }

  getSelectors() {
    return (this.get('selectors') || this.get('classes')) as Selectors;
  }

  getSelectorsString(opts?: ObjectAny) {
    // @ts-ignore
    return this.selectorsToString ? this.selectorsToString(opts) : this.getSelectors().getFullString();
  }
}
