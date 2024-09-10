import { isEmpty, isArray, isString, isFunction, each, includes, extend, flatten, keys } from 'underscore';
import Component from './Component';
import { AddOptions, Collection } from '../../common';
import { DomComponentsConfig } from '../config/config';
import EditorModel from '../../editor/model/Editor';
import ComponentManager from '..';
import CssRule from '../../css_composer/model/CssRule';

import {
  ComponentAdd,
  ComponentAddType,
  ComponentDefinition,
  ComponentDefinitionDefined,
  ComponentProperties,
} from './types';
import ComponentText from './ComponentText';
import ComponentWrapper from './ComponentWrapper';
import { ComponentsEvents, ParseStringOptions } from '../types';
import { isSymbolInstance, isSymbolRoot, updateSymbolComps } from './SymbolUtils';

export const getComponentIds = (cmp?: Component | Component[] | Components, res: string[] = []) => {
  if (!cmp) return [];
  const cmps = (isArray(cmp) || isFunction((cmp as Components).map) ? cmp : [cmp]) as Component[];
  cmps.map((cmp) => {
    res.push(cmp.getId());
    getComponentIds(cmp.components().models, res);
  });
  return res;
};

const getComponentsFromDefs = (
  items: ReturnType<Components['parseString']>,
  all: ReturnType<ComponentManager['allById']> = {},
  opts: any = {},
) => {
  opts.visitedCmps = opts.visitedCmps || {};
  const { visitedCmps } = opts;
  const itms = isArray(items) ? items : [items];

  return itms.map((item) => {
    const { attributes = {}, components, tagName, style } = item;
    let { id, draggable, ...restAttr } = attributes;
    let result = item;

    if (id) {
      // Detect components with the same ID
      if (!visitedCmps[id]) {
        visitedCmps[id] = [];

        // Update the component if exists already
        if (all[id]) {
          result = all[id] as any;
          const cmp = result as unknown as Component;
          tagName && cmp.set({ tagName }, { ...opts, silent: true });
          keys(restAttr).length && cmp.addAttributes(restAttr, { ...opts });
          keys(style).length && cmp.addStyle(style, opts);
        }
      } else {
        // Found another component with the same ID, treat it as a new component
        visitedCmps[id].push(result);
        id = Component.getNewId(all);
        result.attributes.id = id;
      }
    }

    if (components) {
      const newComponents = getComponentsFromDefs(components, all);

      if (isFunction(result.components)) {
        const cmps = result.components();
        cmps.length > 0 && cmps.reset(newComponents, opts);
      } else {
        result.components = newComponents;
      }
    }

    return result;
  });
};

export interface ComponentsOptions {
  em: EditorModel;
  config?: DomComponentsConfig;
  domc?: ComponentManager;
}

interface AddComponentOptions extends AddOptions {
  previousModels?: Component[];
  keepIds?: string[];
}

export default class Components extends Collection</**
 * Keep this format to avoid errors in TS bundler */
/** @ts-ignore */
Component> {
  opt!: ComponentsOptions;
  config?: DomComponentsConfig;
  em: EditorModel;
  domc?: ComponentManager;
  parent?: Component;

  constructor(models: any, opt: ComponentsOptions) {
    super(models, opt);
    this.opt = opt;
    this.listenTo(this, 'add', this.onAdd);
    this.listenTo(this, 'remove', this.removeChildren);
    this.listenTo(this, 'reset', this.resetChildren);
    const { em, config } = opt;
    this.config = config;
    this.em = em;
    this.domc = opt.domc || em?.Components;
  }

  get events() {
    return this.domc?.events!;
  }

  resetChildren(models: Components, opts: { previousModels?: Component[]; keepIds?: string[] } = {}) {
    const coll = this;
    const prev = opts.previousModels || [];
    const toRemove = prev.filter((prev) => !models.get(prev.cid));
    const newIds = getComponentIds(models);
    const idsToKeep = getComponentIds(prev).filter((pr) => newIds.indexOf(pr) >= 0);
    opts.keepIds = (opts.keepIds || []).concat(idsToKeep);
    toRemove.forEach((md) => this.removeChildren(md, coll, opts));
    models.each((model) => this.onAdd(model));
  }

  resetFromString(input = '', opts: { visitedCmps?: Record<string, Component[]>; keepIds?: string[] } = {}) {
    opts.keepIds = getComponentIds(this);
    const { domc, em, parent } = this;
    const cssc = em?.Css;
    const allByID = domc?.allById() || {};
    const parsed = this.parseString(input, opts);
    const newCmps = getComponentsFromDefs(parsed, allByID, opts);
    const { visitedCmps = {} } = opts;

    // Clone styles for duplicated components
    Object.keys(visitedCmps).forEach((id) => {
      const cmps = visitedCmps[id];
      if (cmps.length) {
        // Get all available rules of the component
        const rulesToClone = cssc?.getRules(`#${id}`) || [];

        if (rulesToClone.length) {
          cmps.forEach((cmp) => {
            rulesToClone.forEach((rule) => {
              const newRule = rule.clone();
              // @ts-ignore
              newRule.set('selectors', [`#${cmp.attributes.id}`]);
              cssc!.getAll().add(newRule);
            });
          });
        }
      }
    });

    this.reset(newCmps, opts as any);
    em?.trigger('component:content', parent, opts, input);
    (parent as ComponentText).__checkInnerChilds?.();
  }

  removeChildren(removed: Component, coll?: Components, opts: any = {}) {
    // Removing a parent component can cause this function
    // to be called with an already removed child element
    if (!removed) {
      return;
    }

    const { domc, em } = this;
    const isTemp = opts.temporary || opts.fromUndo;
    removed.prevColl = this; // This one is required for symbols

    if (!isTemp) {
      // Remove the component from the global list
      const id = removed.getId();
      const sels = em.Selectors.getAll();
      const rules = em.Css.getAll();
      const canRemoveStyle = (opts.keepIds || []).indexOf(id) < 0;
      const allByID = domc ? domc.allById() : {};
      delete allByID[id];

      // Remove all component related styles
      const rulesRemoved = (
        canRemoveStyle
          ? rules.remove(
              rules.filter((r) => r.getSelectors().getFullString() === `#${id}`),
              opts,
            )
          : []
      ) as CssRule[];

      // Clean selectors
      sels.remove(rulesRemoved.map((rule) => rule.getSelectors().at(0)));

      if (!removed.opt.temporary) {
        em.Commands.run('core:component-style-clear', { target: removed });
        removed.removed();
        removed.trigger('removed');
        em.trigger(ComponentsEvents.remove, removed);

        if (domc && isSymbolInstance(removed) && isSymbolRoot(removed)) {
          domc.symbols.__trgEvent(domc.events.symbolInstanceRemove, { component: removed }, true);
        }
      }

      const inner = removed.components();
      inner.forEach((it) => {
        updateSymbolComps(it, it, inner, { ...opts, skipRefsUp: true });
        this.removeChildren(it, coll, opts);
      });
    }

    // Remove stuff registered in DomComponents.handleChanges
    const inner = removed.components();
    em.stopListening(inner);
    em.stopListening(removed);
    em.stopListening(removed.get('classes'));
    removed.__postRemove();
  }

  /** @ts-ignore */
  model(attrs: Partial<ComponentProperties>, options: any) {
    const { opt } = options.collection;
    const em = opt.em as EditorModel;
    let model;
    const df = em.Components.componentTypes;
    options.em = em;
    options.config = opt.config;
    options.componentTypes = df;
    options.domc = opt.domc;

    for (let it = 0; it < df.length; it++) {
      const dfId = df[it].id;
      if (dfId == attrs.type) {
        model = df[it].model;
        break;
      }
    }

    // If no model found, get the default one
    if (!model) {
      model = df[df.length - 1].model;
      em &&
        attrs.type &&
        em.logWarning(`Component type '${attrs.type}' not found`, {
          attrs,
          options,
        });
    }

    return new model(attrs, options) as Component;
  }

  parseString(value: string, opt: ParseStringOptions = {}) {
    const { em, domc, parent } = this;
    const asDocument = opt.asDocument && parent?.is('wrapper');
    const cssc = em.Css;
    const parsed = em.Parser.parseHtml(value, { asDocument, ...opt.parserOptions });
    let components = parsed.html;

    if (asDocument) {
      const root = parent as ComponentWrapper;
      const { components: bodyCmps, ...restBody } = (parsed.html as ComponentDefinitionDefined) || {};
      const { components: headCmps, ...restHead } = parsed.head || {};
      components = bodyCmps!;
      root.set(restBody as any, opt);
      root.head.set(restHead as any, opt);
      root.head.components(headCmps, opt);
      root.docEl.set(parsed.root as any, opt);
      root.set({ doctype: parsed.doctype });
    }

    // We need this to avoid duplicate IDs
    Component.checkId(components, parsed.css, domc!.componentsById, opt);

    if (parsed.css && cssc && !opt.temporary) {
      const { at, ...optsToPass } = opt;
      cssc.addCollection(parsed.css, {
        ...optsToPass,
        extend: 1,
      });
    }

    return components;
  }

  add(model: Exclude<ComponentAddType, string>, opt?: AddComponentOptions): Component;
  add(models: ComponentAddType[], opt?: AddComponentOptions): Component[];
  add(models: ComponentAdd, opt?: AddComponentOptions): Component | Component[];
  add(models: unknown, opt: AddComponentOptions = {}): unknown {
    if (models == undefined) return;

    opt.keepIds = [...(opt.keepIds || []), ...getComponentIds(opt.previousModels)];

    if (isString(models)) {
      models = this.parseString(models, opt)!;
    } else if (isArray(models)) {
      models.forEach((item: string, index: number) => {
        if (isString(item)) {
          const nodes = this.parseString(item, opt);
          (models as any)[index] = isArray(nodes) && !nodes.length ? null : nodes;
        }
      });
    }

    const processedModels = (isArray(models) ? models : [models])
      .filter(Boolean)
      .map((model: any) => this.processDef(model));

    models = isArray(models) ? flatten(processedModels as any, 1) : processedModels[0];

    return super.add(models as any, opt);
  }

  /**
   * Process component definition.
   */
  processDef(mdl: Component | ComponentDefinition | ComponentDefinitionDefined) {
    // Avoid processing Models
    if (mdl.cid && mdl.ccid) return mdl;
    const { em, config = {} } = this;
    const { processor } = config;
    let model = mdl;

    if (processor) {
      model = { ...model }; // Avoid 'Cannot delete property ...'
      const modelPr = processor(model);
      if (modelPr) {
        //@ts-ignore
        each(model, (val, key) => delete model[key]);
        extend(model, modelPr);
      }
    }

    // React JSX preset
    //@ts-ignore
    if (model.$$typeof && typeof model.props == 'object') {
      model = { ...model };
      model.props = { ...model.props };
      const domc = em.Components;
      const parser = em.Parser;
      const { parserHtml } = parser;

      each(model, (value, key) => {
        //@ts-ignore
        if (!includes(['props', 'type'], key)) delete model[key];
      });
      const { props } = model;
      const comps = props.children;
      delete props.children;
      delete model.props;
      const res = parserHtml.splitPropsFromAttr(props);
      model.attributes = res.attrs;

      if (comps) {
        model.components = comps;
      }
      if (!model.type) {
        model.type = 'textnode';
      } else if (!domc.getType(model.type)) {
        model.tagName = model.type;
        delete model.type;
      }

      extend(model, res.props);
    }

    return model;
  }

  onAdd(model: Component, c?: any, opts: { temporary?: boolean } = {}) {
    const { domc, em } = this;
    const style = model.getStyle();
    const avoidInline = em && em.getConfig().avoidInlineStyle;
    domc && domc.Component.ensureInList(model);

    if (!isEmpty(style) && !avoidInline && em && em.getConfig().forceClass && !opts.temporary) {
      const name = model.cid;
      em.Css.setClassRule(name, style);
      model.setStyle({});
      model.addClass(name);
    }

    model.__postAdd({ recursive: true });

    if (em && !opts.temporary) {
      const triggerAdd = (model: Component) => {
        em.trigger(ComponentsEvents.add, model, opts);
        model.components().forEach((comp) => triggerAdd(comp));
      };
      triggerAdd(model);

      if (domc && isSymbolInstance(model) && isSymbolRoot(model)) {
        domc.symbols.__trgEvent(domc.events.symbolInstanceAdd, { component: model }, true);
      }
    }
  }
}
