import { isArray, isString, keys } from 'underscore';
import { Model, ObjectAny, ObjectHash, SetOptions } from '../../common';
import ParserHtml from '../../parser/model/ParserHtml';
import Selectors from '../../selector_manager/model/Selectors';
import { shallowDiff } from '../../utils/mixins';
import EditorModel from '../../editor/model/Editor';
import { DataVariableProps } from '../../data_sources/model/DataVariable';
import CssRuleView from '../../css_composer/view/CssRuleView';
import ComponentView from '../../dom_components/view/ComponentView';
import Frame from '../../canvas/model/Frame';
import { DataConditionProps } from '../../data_sources/model/conditional_variables/DataCondition';
import { ToCssOptions } from '../../css_composer/model/CssRule';
import { ModelDataResolverWatchers } from '../../dom_components/model/ModelDataResolverWatchers';
import { DataCollectionStateMap } from '../../data_sources/model/data_collection/types';
import { DynamicWatchersOptions } from '../../dom_components/model/ModelResolverWatcher';

export type StyleProps = Record<string, string | string[] | DataVariableProps | DataConditionProps>;

export interface UpdateStyleOptions extends SetOptions, DynamicWatchersOptions {
  partial?: boolean;
  addStyle?: StyleProps;
  inline?: boolean;
  noEvent?: boolean;
}

export type StyleableView = ComponentView | CssRuleView;

const parserHtml = ParserHtml();

export const getLastStyleValue = (value: string | string[]) => {
  return isArray(value) ? value[value.length - 1] : value;
};

export default class StyleableModel<T extends ObjectHash = any> extends Model<T, UpdateStyleOptions> {
  em?: EditorModel;
  views: StyleableView[] = [];
  dataResolverWatchers: ModelDataResolverWatchers;
  collectionsStateMap: DataCollectionStateMap = {};

  constructor(attributes: T, options: { em?: EditorModel } = {}) {
    const em = options.em!;
    const dataResolverWatchers = new ModelDataResolverWatchers(undefined, { em });
    super(attributes, { ...options, dataResolverWatchers });
    dataResolverWatchers.bindModel(this);
    dataResolverWatchers.setStyles(this.get('style')!);
    this.dataResolverWatchers = dataResolverWatchers;
    this.em = options.em;
  }

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
    return { ...this.getStyle('', { skipResolve: true }), ...prop };
  }

  /**
   * Get style object
   * @return {Object}
   */
  getStyle(prop?: string | ObjectAny, opts: { skipResolve?: boolean } = {}): StyleProps {
    const style: ObjectAny = { ...(this.get('style') || {}) };
    delete style.__p;
    if (!opts.skipResolve) {
      return prop && isString(prop) ? { ...style }[prop] : { ...style };
    }

    const result: ObjectAny = { ...style, ...this.dataResolverWatchers.getDynamicStylesDefs() };
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

    const propOrig = this.getStyle({ skipResolve: true });

    if (opts.partial || opts.avoidStore) {
      opts.avoidStore = true;
      prop.__p = true;
    } else {
      delete prop.__p;
    }

    const propNew = { ...prop };
    let newStyle = { ...propNew };

    keys(newStyle).forEach((key) => {
      // Remove empty style properties
      if (newStyle[key] === '') {
        delete newStyle[key];
        return;
      }
    });
    newStyle = this.dataResolverWatchers.setStyles(newStyle, opts);

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

  getView(frame?: Frame) {
    let { views, em } = this;
    const frm = frame || em?.getCurrentFrameModel();
    return frm ? views.find((v) => v.frameView === frm.view) : views[0];
  }

  setView(view: StyleableView) {
    let { views } = this;
    !views.includes(view) && views.push(view);
  }

  removeView(view: StyleableView) {
    const { views } = this;
    views.splice(views.indexOf(view), 1);
  }

  updateView() {
    this.views.forEach((view) => view.updateStyles());
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
  styleToString(opts: ToCssOptions = {}) {
    const result: string[] = [];
    const style = opts.style || this.getStyle(opts);
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
