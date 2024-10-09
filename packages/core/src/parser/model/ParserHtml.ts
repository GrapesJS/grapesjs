import { each, isArray, isFunction, isUndefined } from 'underscore';
import { ObjectAny, ObjectStrings } from '../../common';
import { ComponentDefinitionDefined, ComponentStackItem } from '../../dom_components/model/types';
import EditorModel from '../../editor/model/Editor';
import { HTMLParseResult, HTMLParserOptions, ParseNodeOptions, ParserConfig } from '../config/config';
import BrowserParserHtml from './BrowserParserHtml';
import { doctypeToString } from '../../utils/dom';
import { isDef } from '../../utils/mixins';

const modelAttrStart = 'data-gjs-';
const event = 'parse:html';

const ParserHtml = (em?: EditorModel, config: ParserConfig & { returnArray?: boolean } = {}) => {
  return {
    compTypes: [] as ComponentStackItem[],

    modelAttrStart,

    getPropAttribute(attrName: string, attrValue?: string) {
      const name = attrName.replace(this.modelAttrStart, '');
      const valueLen = attrValue?.length || 0;
      const firstChar = attrValue?.substring(0, 1);
      const lastChar = attrValue?.substring(valueLen - 1);
      let value: any = attrValue === 'true' ? true : attrValue === 'false' ? false : attrValue;

      // Try to parse JSON where it's possible
      // I can get false positive here (eg. a selector '[data-attr]')
      // so put it under try/catch and let fail silently
      try {
        value =
          (firstChar == '{' && lastChar == '}') || (firstChar == '[' && lastChar == ']') ? JSON.parse(value) : value;
      } catch (e) {}

      return {
        name,
        value,
      };
    },

    /**
     * Extract component props from an attribute object
     * @param {Object} attr
     * @returns {Object} An object containing props and attributes without them
     */
    splitPropsFromAttr(attr: ObjectAny = {}) {
      const props: ObjectAny = {};
      const attrs: ObjectStrings = {};

      each(attr, (value, key) => {
        if (key.indexOf(this.modelAttrStart) === 0) {
          const propsResult = this.getPropAttribute(key, value);
          props[propsResult.name] = propsResult.value;
        } else {
          attrs[key] = value;
        }
      });

      return {
        props,
        attrs,
      };
    },

    /**
     * Parse style string to object
     * @param {string} str
     * @return {Object}
     * @example
     * var stl = ParserHtml.parseStyle('color:black; width:100px; test:value;');
     * console.log(stl);
     * // {color: 'black', width: '100px', test: 'value'}
     */
    parseStyle(str: string) {
      const result: Record<string, string | string[]> = {};

      while (str.indexOf('/*') >= 0) {
        const start = str.indexOf('/*');
        const end = str.indexOf('*/') + 2;
        str = str.replace(str.slice(start, end), '');
      }

      const decls = str.split(';');

      for (let i = 0, len = decls.length; i < len; i++) {
        const decl = decls[i].trim();
        if (!decl) continue;
        const prop = decl.split(':');
        const key = prop[0].trim();
        const value = prop.slice(1).join(':').trim();

        // Support multiple values for the same key
        if (result[key]) {
          if (!isArray(result[key])) {
            result[key] = [result[key] as string];
          }

          (result[key] as string[]).push(value);
        } else {
          result[key] = value;
        }
      }

      return result;
    },

    /**
     * Parse class string to array
     * @param {string} str
     * @return {Array<string>}
     * @example
     * var res = ParserHtml.parseClass('test1 test2 test3');
     * console.log(res);
     * // ['test1', 'test2', 'test3']
     */
    parseClass(str: string) {
      const result = [];
      const cls = str.split(' ');

      for (let i = 0, len = cls.length; i < len; i++) {
        const cl = cls[i].trim();
        if (!cl) continue;
        result.push(cl);
      }

      return result;
    },

    parseNodeAttr(node: HTMLElement, result?: ComponentDefinitionDefined) {
      const model = result || {};
      const attrs = node.attributes || [];
      const attrsLen = attrs.length;

      for (let i = 0; i < attrsLen; i++) {
        const nodeName = attrs[i].nodeName;
        let nodeValue: string | boolean = attrs[i].nodeValue!;

        if (nodeName == 'style') {
          model.style = this.parseStyle(nodeValue);
        } else if (nodeName == 'class') {
          model.classes = this.parseClass(nodeValue);
        } else if (nodeName == 'contenteditable') {
          continue;
        } else if (nodeName.indexOf(this.modelAttrStart) === 0) {
          const propsResult = this.getPropAttribute(nodeName, nodeValue);
          model[propsResult.name] = propsResult.value;
        } else {
          // @ts-ignore Check for attributes from props (eg. required, disabled)
          if (nodeValue === '' && node[nodeName] === true) {
            nodeValue = true;
          }

          if (!model.attributes) {
            model.attributes = {};
          }

          model.attributes[nodeName] = nodeValue;
        }
      }

      return model;
    },

    detectNode(node: HTMLElement, opts: ParseNodeOptions = {}) {
      const { compTypes } = this;
      let result: ComponentDefinitionDefined = {};

      if (compTypes) {
        const type = node.getAttribute?.(`${this.modelAttrStart}type`);

        // If the type is already defined, use it
        if (type) {
          result = { type };
        } else {
          // Find the component type
          for (let i = 0; i < compTypes.length; i++) {
            const compType = compTypes[i];
            let obj = compType.model.isComponent(node, opts);

            if (obj) {
              if (typeof obj !== 'object') {
                obj = { type: compType.id };
              }
              result = obj;
              break;
            }
          }
        }
      }

      return result;
    },

    parseNode(node: HTMLElement, opts: ParseNodeOptions = {}) {
      const nodes = (node as HTMLTemplateElement).content?.childNodes || node.childNodes;
      const nodesLen = nodes.length;
      let model = this.detectNode(node, opts);

      if (!model.tagName) {
        const tag = node.tagName || '';
        const ns = node.namespaceURI || '';
        model.tagName = tag && ns === 'http://www.w3.org/1999/xhtml' ? tag.toLowerCase() : tag;
      }

      model = this.parseNodeAttr(node, model);

      // Check for custom void elements (valid in XML)
      if (!nodesLen && `${node.outerHTML}`.slice(-2) === '/>') {
        model.void = true;
      }

      // Check for nested elements but avoid it if already provided
      if (nodesLen && !model.components && !opts.skipChildren) {
        // Avoid infinite nested text nodes
        const firstChild = nodes[0];

        // If there is only one child and it's a TEXTNODE
        // just make it content of the current node
        if (nodesLen === 1 && firstChild.nodeType === 3) {
          !model.type && (model.type = 'text');
          model.components = {
            type: 'textnode',
            content: firstChild.nodeValue,
          };
        } else {
          model.components = this.parseNodes(node, {
            ...opts,
            inSvg: opts.inSvg || model.type === 'svg',
          });
        }
      }

      // If all children are texts and there is any textnode inside, the parent should
      // be text too otherwise it won't be possible to edit texnodes.
      const comps = model.components;
      if (!model.type && comps?.length) {
        const { textTypes = [], textTags = [] } = config;
        let allTxt = true;
        let foundTextNode = false;

        for (let i = 0; i < comps.length; i++) {
          const comp = comps[i];
          const cType = comp.type;

          if (!textTypes.includes(cType) && !textTags.includes(comp.tagName)) {
            allTxt = false;
            break;
          }

          if (cType === 'textnode') {
            foundTextNode = true;
          }
        }

        if (allTxt && foundTextNode) {
          model.type = 'text';
        }
      }

      return model;
    },

    /**
     * Get data from the node element
     * @param  {HTMLElement} el DOM element to traverse
     * @return {Array<Object>}
     */
    parseNodes(el: HTMLElement, opts: ParseNodeOptions = {}) {
      const result: ComponentDefinitionDefined[] = [];
      const nodes = (el as HTMLTemplateElement).content?.childNodes || el.childNodes;
      const nodesLen = nodes.length;

      for (let i = 0; i < nodesLen; i++) {
        const node = nodes[i] as HTMLElement;
        const nodePrev = result[result.length - 1];
        const model = this.parseNode(node, opts);

        // Check if it's a text node and if it could be moved to the prevous one
        if (model.type === 'textnode') {
          if (nodePrev?.type === 'textnode') {
            nodePrev.content += model.content;
            continue;
          }

          // Try to keep meaningful whitespaces when possible (#5984)
          // Ref: https://github.com/GrapesJS/grapesjs/pull/5719#discussion_r1518531999
          if (!opts.keepEmptyTextNodes) {
            const content = node.nodeValue || '';
            const isFirstOrLast = i === 0 || i === nodesLen - 1;
            const hasNewLive = content.includes('\n');
            if (content != ' ' && !content.trim() && (isFirstOrLast || hasNewLive)) {
              continue;
            }
          }
        }

        // If the tagName is empty and it's not a textnode, skip it
        if (!model.tagName && isUndefined(model.content)) {
          continue;
        }

        result.push(model);
      }

      return result;
    },

    /**
     * Parse HTML string to a desired model object
     * @param  {string} str HTML string
     * @param  {ParserCss} parserCss In case there is style tags inside HTML
     * @return {Object}
     */
    parse(str: string, parserCss?: any, opts: HTMLParserOptions = {}) {
      const conf = em?.get('Config') || {};
      const res: HTMLParseResult = { html: [] };
      const cf = { ...config, ...opts };
      const preOptions = {
        ...config.optionsHtml,
        // @ts-ignore Support previous `configParser.htmlType` option
        htmlType: config.optionsHtml?.htmlType || config.htmlType,
        ...opts,
      };
      const options = {
        ...preOptions,
        asDocument: this.__checkAsDocument(str, preOptions),
      };
      const { preParser, asDocument } = options;
      const input = isFunction(preParser) ? preParser(str, { editor: em?.getEditor()! }) : str;
      const parseRes = isFunction(cf.parserHtml) ? cf.parserHtml(input, options) : BrowserParserHtml(input, options);
      let root = parseRes as HTMLElement;
      const docEl = parseRes as Document;

      if (asDocument) {
        root = docEl.documentElement;
        res.doctype = doctypeToString(docEl.doctype);
      }

      const scripts = root.querySelectorAll('script');
      let i = scripts.length;

      // Support previous `configMain.allowScripts` option
      const allowScripts = !isUndefined(conf.allowScripts) ? conf.allowScripts : options.allowScripts;

      // Remove script tags
      if (!allowScripts) {
        while (i--) scripts[i].parentNode?.removeChild(scripts[i]);
      }

      // Remove unsafe attributes
      if (!options.allowUnsafeAttr || !options.allowUnsafeAttrValue) {
        this.__sanitizeNode(root, options);
      }

      // Detach style tags and parse them
      if (parserCss) {
        const styles = root.querySelectorAll('style');
        let j = styles.length;
        let styleStr = '';

        while (j--) {
          styleStr = styles[j].innerHTML + styleStr;
          styles[j].parentNode?.removeChild(styles[j]);
        }

        if (styleStr) res.css = parserCss.parse(styleStr);
      }

      em?.trigger(`${event}:root`, { input, root: root });
      let resHtml: HTMLParseResult['html'] = [];

      if (asDocument) {
        res.head = this.parseNode(docEl.head, cf);
        res.root = this.parseNodeAttr(root);
        resHtml = this.parseNode(docEl.body, cf);
      } else {
        const result = this.parseNodes(root, cf);
        // I have to keep it otherwise it breaks the DomComponents.addComponent (returns always array)
        resHtml = result.length === 1 && !cf.returnArray ? result[0] : result;
      }

      res.html = resHtml;
      em?.trigger(event, { input, output: res, options });

      return res;
    },

    __sanitizeNode(node: HTMLElement, opts: HTMLParserOptions) {
      const attrs = node.attributes || [];
      const nodes = node.childNodes || [];
      const toRemove: string[] = [];
      each(attrs, (attr) => {
        const name = attr.nodeName || '';
        const value = attr.nodeValue || '';
        !opts.allowUnsafeAttr && name.startsWith('on') && toRemove.push(name);
        !opts.allowUnsafeAttrValue && value.startsWith('javascript:') && toRemove.push(name);
      });
      toRemove.map((name) => node.removeAttribute(name));
      each(nodes, (node) => this.__sanitizeNode(node as HTMLElement, opts));
    },

    __checkAsDocument(str: string, opts: HTMLParserOptions) {
      if (isDef(opts.asDocument)) {
        return opts.asDocument;
      } else if (isFunction(opts.detectDocument)) {
        return !!opts.detectDocument(str);
      } else if (opts.detectDocument) {
        return str.toLowerCase().trim().startsWith('<!doctype');
      }
    },
  };
};

export default ParserHtml;
