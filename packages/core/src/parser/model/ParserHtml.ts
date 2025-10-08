import { each, isArray, isFunction, isUndefined, result } from 'underscore';
import { ObjectAny, ObjectStrings } from '../../common';
import { ComponentDefinitionDefined, ComponentStackItem } from '../../dom_components/model/types';
import EditorModel from '../../editor/model/Editor';
import { HTMLParseResult, HTMLParserOptions, ParseNodeOptions, ParserConfig } from '../config/config';
import BrowserParserHtml from './BrowserParserHtml';
import { doctypeToString, processDataGjsAttributeHyphen } from '../../utils/dom';
import { isDef } from '../../utils/mixins';
import { ParserEvents } from '../types';

const modelAttrStart = 'data-gjs-';

const ParserHtml = (em?: EditorModel, config: ParserConfig & { returnArray?: boolean } = {}) => {
  return {
    compTypes: [] as ComponentStackItem[],

    modelAttrStart,

    getPropAttribute(attrName: string, attrValue?: string) {
      const name = attrName.slice(this.modelAttrStart.length);
      let value: any = attrValue;

      if (value === 'true') return { name, value: true };
      if (value === 'false') return { name, value: false };

      const first = value?.[0];
      const last = value?.[value.length - 1];

      if (first === '{' || first === '[') {
        if (last === '}' || last === ']') {
          try {
            value = JSON.parse(value!);
          } catch {}
        }
      }

      return { name, value };
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
      if (!str) return result;

      // ⚡ Remove comments in one pass
      str = str.replace(/\/\*[\s\S]*?\*\//g, '');

      const decls = str.split(';');
      for (let i = 0; i < decls.length; i++) {
        const decl = decls[i].trim();
        if (!decl) continue;

        const colonIdx = decl.indexOf(':');
        if (colonIdx === -1) continue;

        const key = decl.slice(0, colonIdx).trim();
        const value = decl.slice(colonIdx + 1).trim();

        if (result[key]) {
          const prev = result[key];
          if (Array.isArray(prev)) prev.push(value);
          else result[key] = [prev, value];
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
      return str.trim().split(/\s+/);
    },

    parseNodeAttr(node: HTMLElement, modelResult?: ComponentDefinitionDefined) {
      const model = modelResult || {};
      if (!node || !(node as HTMLElement).attributes) return model;

      const attrs = node.attributes;
      const convertHyphens = !!config?.optionsHtml?.convertDataGjsAttributesHyphens;
      const type = model.type;
      const defaults =
        (convertHyphens && type && result(em?.Components.getType(type)?.model.prototype, 'defaults')) || {};

      for (let i = 0, l = attrs.length; i < l; i++) {
        const attr = attrs[i];
        const nodeName = attr.name;
        let nodeValue: any = attr.value;

        switch (nodeName) {
          case 'style':
            model.style = this.parseStyle(nodeValue);
            continue;
          case 'class':
            model.classes = this.parseClass(nodeValue);
            continue;
          case 'contenteditable':
            continue;
        }

        if (nodeName.startsWith(this.modelAttrStart)) {
          const { name, value } = this.getPropAttribute(nodeName, nodeValue);
          let resolvedName = name;

          if (convertHyphens && !(resolvedName in defaults)) {
            const transformed = processDataGjsAttributeHyphen(resolvedName);
            if (transformed in defaults) resolvedName = transformed;
          }

          model[resolvedName] = value;
        } else {
          if (nodeValue === '' && (node as any)[nodeName] === true) {
            nodeValue = true;
          }

          (model.attributes ||= {})[nodeName] = nodeValue;
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
      const len = nodes.length;

      for (let i = 0; i < len; i++) {
        const node = nodes[i] as HTMLElement;
        const model = this.parseNode(node, opts);

        // Skip empty models early
        if (!model) continue;

        if (model.type === 'textnode') {
          const prev = result[result.length - 1];
          if (prev?.type === 'textnode') {
            prev.content += model.content;
            continue;
          }

          if (!opts.keepEmptyTextNodes) {
            const content = node.nodeValue || '';
            const isFirstOrLast = i === 0 || i === len - 1;
            if (content !== ' ' && !content.trim() && (isFirstOrLast || content.includes('\n'))) {
              continue;
            }
          }
        }

        if (!model.tagName && model.content === undefined) continue;
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
      const Parser = em?.Parser;
      const res: HTMLParseResult = { html: [] };
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
      const cf = { ...config, ...options };
      const { preParser, asDocument } = options;
      const inputOptions = { input: isFunction(preParser) ? preParser(str, { editor: em?.getEditor()! }) : str };
      Parser?.__emitEvent(ParserEvents.htmlBefore, inputOptions);
      const { input } = inputOptions;

      const parseRes = isFunction(cf.parserHtml) ? cf.parserHtml(input, options) : BrowserParserHtml(input, options);
      let root = parseRes as HTMLElement;
      const docEl = parseRes as Document;

      if (asDocument) {
        root = docEl.documentElement;
        res.doctype = doctypeToString(docEl.doctype);
      }

      const allowScripts = !isUndefined(conf.allowScripts) ? conf.allowScripts : options.allowScripts;

      if (!allowScripts) {
        //@ts-ignore
        for (const script of root.querySelectorAll('script')) {
          script.remove();
        }
      }

      if (!options.allowUnsafeAttr || !options.allowUnsafeAttrValue) {
        this.__sanitizeNode(root, options);
      }

      if (parserCss) {
        const styleNodes = root.querySelectorAll('style');
        const styleParts: string[] = [];

        //@ts-ignore
        for (const styleNode of styleNodes) {
          styleParts.push(styleNode.innerHTML);
          styleNode.remove(); // .remove() is a direct and optimized way to detach nodes.
        }

        if (styleParts.length) {
          res.css = parserCss.parse(styleParts.join('\n'));
        }
      }

      Parser?.__emitEvent(ParserEvents.htmlRoot, { input, root });
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
      Parser?.__emitEvent(ParserEvents.html, { input, output: res, options });

      return res;
    },

    __sanitizeNode(root: HTMLElement, opts: HTMLParserOptions) {
      const stack = [root];
      const removeAttrs: string[] = [];

      while (stack.length) {
        const node = stack.pop()!;
        const attrs = node.attributes;
        for (let i = 0, l = attrs.length; i < l; i++) {
          const name = attrs[i].name;
          const value = attrs[i].value;
          if (!opts.allowUnsafeAttr && name.startsWith('on')) node.removeAttribute(name);
          else if (!opts.allowUnsafeAttrValue && value.startsWith('javascript:')) node.removeAttribute(name);
        }

        const children = node.childNodes;
        for (let i = 0, l = children.length; i < l; i++) {
          const child = children[i];
          if (child.nodeType === 1) stack.push(child as HTMLElement);
        }
      }
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
