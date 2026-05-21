import { each, isArray, isFunction, isUndefined, result } from 'underscore';
import { ObjectAny, ObjectStrings } from '../../common';
import { ComponentDefinitionDefined, ComponentStackItem } from '../../dom_components/model/types';
import EditorModel from '../../editor/model/Editor';
import { doctypeToString, processDataGjsAttributeHyphen } from '../../utils/dom';
import { isDef } from '../../utils/mixins';
import { HTMLParserOptions, ParseNodeOptions, ParserConfig } from '../config/config';
import {
  HTMLParseResult,
  ParsedElementNode,
  ParsedNode,
  ParsedNodeMeta,
  ParsedNodeNamespace,
  ParsedNodeType,
  ParserEvents,
  SyntheticElementCtor,
} from '../types';
import BrowserParserHtml from './BrowserParserHtml';
import { getSyntheticElementCtor } from './SyntheticElement';

const modelAttrStart = 'data-gjs-';

interface ParserHtmlInternalOptions extends ParseNodeOptions {
  __parsedMode?: boolean;
  __syntheticElementCtor?: SyntheticElementCtor;
}

const hasOwn = (obj: object, key: string) => Object.prototype.hasOwnProperty.call(obj, key);

const getNodeChildNodes = (node: ParsedNodeMeta) => node.childNodes || [];
const getNodeTagName = (node: ParsedNodeMeta) => `${node.tagName || ''}`.toLowerCase();
const getSourceNode = (node: ParsedNodeMeta) => node.__domNode || node;

const ParserHtml = (em?: EditorModel, config: ParserConfig & { returnArray?: boolean } = {}) => {
  return {
    compTypes: [] as ComponentStackItem[],

    modelAttrStart,

    parseAttributeValue(attrValue?: string | boolean) {
      if (typeof attrValue !== 'string') {
        return attrValue;
      }

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

      return value;
    },

    getPropAttribute(attrName: string, attrValue?: string) {
      const name = attrName.replace(this.modelAttrStart, '');
      const value = this.parseAttributeValue(attrValue);

      return {
        name,
        value,
      };
    },

    shouldConvertAttributeValue(
      attribute: string,
      value: string | boolean,
      node: HTMLElement | ParsedElementNode,
      convertAttributeValues: HTMLParserOptions['convertAttributeValues'],
    ) {
      if (!convertAttributeValues) {
        return false;
      } else if (convertAttributeValues === true) {
        return true;
      } else if (isArray(convertAttributeValues)) {
        return convertAttributeValues.includes(attribute);
      } else if (isFunction(convertAttributeValues)) {
        return !!convertAttributeValues({ attribute, value, node });
      }

      return false;
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
        const end = str.indexOf('*/');
        const endIndex = end > -1 ? end + 2 : undefined;
        str = str.replace(str.slice(start, endIndex), '');
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

    parseNodeAttr(
      node: ParsedNodeMeta,
      modelResult?: ComponentDefinitionDefined,
      opts: HTMLParserOptions = config.optionsHtml || {},
    ) {
      const model = modelResult || {};
      const attrs = node.attributes || {};
      const convertHyphens = !!opts.convertDataGjsAttributesHyphens;
      const { convertAttributeValues } = opts;
      const defaults =
        (convertHyphens && !!model.type && result(em?.Components.getType(model.type)?.model.prototype, 'defaults')) ||
        {};
      const sourceNode = getSourceNode(node) as HTMLElement | ParsedElementNode;

      each(attrs, (attrValue, attrName) => {
        let nodeValue: any = attrValue;

        if (attrName == 'style') {
          model.style = this.parseStyle(`${nodeValue}`);
        } else if (attrName == 'class') {
          model.classes = this.parseClass(`${nodeValue}`);
        } else if (attrName == 'contenteditable') {
          return;
        } else if (attrName.indexOf(this.modelAttrStart) === 0) {
          const propsResult = this.getPropAttribute(attrName, `${nodeValue}`);
          let resolvedName = propsResult.name;
          if (convertHyphens && !(resolvedName in defaults)) {
            const transformed = processDataGjsAttributeHyphen(resolvedName);
            resolvedName = transformed in defaults ? transformed : resolvedName;
          }

          model[resolvedName] = propsResult.value;
        } else {
          if (
            nodeValue === '' &&
            ((node.__domNode as any)?.[attrName] === true || node.__boolAttributes?.includes(attrName))
          ) {
            nodeValue = true;
          }

          if (this.shouldConvertAttributeValue(attrName, nodeValue, sourceNode, convertAttributeValues)) {
            nodeValue = this.parseAttributeValue(nodeValue);
          }

          if (!model.attributes) {
            model.attributes = {};
          }

          model.attributes[attrName] = nodeValue;
        }
      });

      return model;
    },

    detectNode(node: ParsedNodeMeta, opts: ParserHtmlInternalOptions = {}) {
      const { compTypes } = this;
      let result: ComponentDefinitionDefined = {};

      if (compTypes) {
        const type = node.attributes?.[`${this.modelAttrStart}type`];

        // If the type is already defined, use it
        if (type) {
          result = { type };
        } else {
          // Find the component type
          for (let i = 0; i < compTypes.length; i++) {
            const compType = compTypes[i];
            const { model } = compType;
            let obj;

            if (opts.__parsedMode) {
              obj = model.isParsedNode
                ? model.isParsedNode(node, opts)
                : model.isComponent(this.__getSyntheticNode(node, opts) as any, opts);
            } else {
              obj = model.isComponent(getSourceNode(node), opts);
            }

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

    parseNode(node: ParsedNodeMeta, opts: ParserHtmlInternalOptions = {}) {
      const nodes = getNodeChildNodes(node);
      const nodesLen = nodes.length;
      let model = this.detectNode(node, opts);

      if (!model.tagName && model.tagName !== '') {
        const tag = node.tagName || '';
        const ns = node.namespaceURI || '';
        model.tagName = tag && ns === ParsedNodeNamespace.html ? tag.toLowerCase() : tag;
      }

      model = this.parseNodeAttr(node, model, opts);

      // Check for custom void elements (valid in XML)
      if (!nodesLen && node.__selfClosing) {
        model.void = true;
      }

      // Check for nested elements but avoid it if already provided
      if (nodesLen && !model.components && !opts.skipChildren) {
        // Avoid infinite nested text nodes
        const firstChild = nodes[0];

        // If there is only one child and it's a TEXTNODE
        // just make it content of the current node
        if (nodesLen === 1 && firstChild.nodeType === ParsedNodeType.text) {
          !model.type && (model.type = 'text');
          model.components = {
            type: 'textnode',
            content: firstChild.textContent,
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
    parseNodes(el: ParsedNodeMeta, opts: ParserHtmlInternalOptions = {}) {
      const result: ComponentDefinitionDefined[] = [];
      const nodes = getNodeChildNodes(el);
      const nodesLen = nodes.length;

      for (let i = 0; i < nodesLen; i++) {
        const node = nodes[i];
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
            const content = node.textContent || '';
            const isFirstOrLast = i === 0 || i === nodesLen - 1;
            const hasNewLine = content.includes('\n');
            if (content != ' ' && !content.trim() && (isFirstOrLast || hasNewLine)) {
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
      const Parser = em?.Parser;
      const res: HTMLParseResult = { html: [] };
      const parserCode = this.__getParserCodeId(opts);
      const preOptions = {
        ...config.optionsHtml,
        htmlType: config.optionsHtml?.htmlType || (config as any).htmlType,
        ...opts,
      };
      const options = {
        ...preOptions,
        parserCode,
        asDocument: this.__checkAsDocument(str, preOptions),
      };
      const cf = { ...config, ...options };
      const { preParser, asDocument } = options;
      const inputOptions = { input: isFunction(preParser) ? preParser(str, { editor: em?.getEditor()! }) : str };
      Parser?.__emitEvent(ParserEvents.htmlBefore, inputOptions);
      const { input } = inputOptions;
      const parseRes = this.__parseInput(input, options, cf, parserCode);
      const root = parseRes.root;
      const parserConfig = Parser?.getConfig() || config;
      const parseOptions: ParserHtmlInternalOptions = {
        ...cf,
        __parsedMode: parseRes.isParsedMode,
        __syntheticElementCtor: getSyntheticElementCtor(parserConfig.customSyntheticElement),
      };

      const allowScripts = !isUndefined(conf.allowScripts) ? conf.allowScripts : options.allowScripts;

      if (!allowScripts) {
        this.__removeElementNodes(root, 'script');
      }

      if (!options.allowUnsafeAttr || !options.allowUnsafeAttrValue) {
        this.__sanitizeNode(root, options);
      }

      if (parserCss) {
        const styleNodes = this.__removeElementNodes(root, 'style');
        const styleStr = styleNodes.map((node) => this.__getNodeTextContent(node)).join('');
        if (styleStr) res.css = parserCss.parse(styleStr);
      }

      Parser?.__emitEvent(ParserEvents.htmlRoot, { input, root });
      let resHtml: HTMLParseResult['html'] = [];

      if (asDocument) {
        const docNode: ParsedNodeMeta =
          root.nodeType === ParsedNodeType.document ? root : this.__normalizeDocumentRoot(getNodeChildNodes(root));
        const htmlNode = this.__findChildElement(docNode, 'html');
        const headNode = htmlNode && this.__findChildElement(htmlNode, 'head');
        const bodyNode = (htmlNode && this.__findChildElement(htmlNode, 'body')) || this.__createElementNode('body');

        res.doctype = docNode.__doctype;
        headNode && (res.head = this.parseNode(headNode, parseOptions));
        htmlNode && (res.root = this.parseNodeAttr(htmlNode, undefined, parseOptions));
        resHtml = this.parseNode(bodyNode, parseOptions);
      } else {
        const result = this.parseNodes(root, parseOptions);
        // Need this otherwise it breaks the DomComponents.addComponent (returns always array)
        resHtml = result.length === 1 && !cf.returnArray ? result[0] : result;
      }

      res.html = resHtml;
      Parser?.__emitEvent(ParserEvents.html, { input, output: res, options });

      return res;
    },

    __getSyntheticNode(node: ParsedNodeMeta, opts: ParserHtmlInternalOptions) {
      const parserConfig = em?.Parser?.getConfig() || config;
      const SyntheticElement =
        opts.__syntheticElementCtor || getSyntheticElementCtor(parserConfig.customSyntheticElement);
      return new SyntheticElement(node);
    },

    __parseInput(input: string, options: HTMLParserOptions, cf: ParserConfig, parserCode: string) {
      const codeParser = parserCode ? em?.Parser?.getParserCode(parserCode) : undefined;
      const { asDocument } = options;

      if (parserCode) {
        if (!codeParser) throw new Error(`Parser code "${parserCode}" not found`);

        const parsedNode = codeParser.parse(input, { editor: em?.getEditor()!, options });
        const parsedNodes = isArray(parsedNode) ? parsedNode : [parsedNode];

        return {
          root: asDocument ? this.__normalizeDocumentRoot(parsedNodes) : this.__createFragmentRoot(parsedNodes),
          isParsedMode: true,
        };
      }

      const parseRes = isFunction(cf.parserHtml) ? cf.parserHtml(input, options) : BrowserParserHtml(input, options);

      return {
        root: asDocument
          ? this.__domDocumentToParsedNode(parseRes as Document)
          : this.__domRootToFragment(parseRes as HTMLElement),
        isParsedMode: false,
      };
    },

    __getParserCodeId(options: HTMLParserOptions) {
      if (hasOwn(options, 'parserCode')) return options.parserCode || '';
      return em?.Parser?.parserCode || config.parserCode || '';
    },

    __cloneParsedNode(node: ParsedNode): ParsedNodeMeta {
      const cloned: ParsedNodeMeta = {
        nodeType: node.nodeType,
      };

      node.tagName && (cloned.tagName = node.tagName);
      node.namespaceURI && (cloned.namespaceURI = node.namespaceURI);
      node.textContent !== undefined && (cloned.textContent = node.textContent);
      node.attributes && (cloned.attributes = { ...node.attributes });
      node.childNodes && (cloned.childNodes = node.childNodes.map((child) => this.__cloneParsedNode(child)));

      const meta = node as ParsedNodeMeta & { doctype?: string; selfClosing?: boolean };
      meta.__doctype && (cloned.__doctype = meta.__doctype);
      meta.doctype && (cloned.__doctype = meta.doctype);
      meta.__selfClosing && (cloned.__selfClosing = meta.__selfClosing);
      meta.selfClosing && (cloned.__selfClosing = meta.selfClosing);
      meta.__boolAttributes && (cloned.__boolAttributes = [...meta.__boolAttributes]);

      return cloned;
    },

    __domRootToFragment(root: HTMLElement) {
      return {
        nodeType: ParsedNodeType.fragment,
        __domNode: root,
        childNodes: this.__getDomChildNodes(root).map((node) => this.__domToParsedNode(node)),
      } as ParsedNodeMeta;
    },

    __domDocumentToParsedNode(doc: Document): ParsedNodeMeta {
      return {
        nodeType: ParsedNodeType.document,
        __domNode: doc,
        __doctype: doctypeToString(doc.doctype),
        childNodes: doc.documentElement ? [this.__domToParsedNode(doc.documentElement)] : [],
      };
    },

    __domToParsedNode(node: Node): ParsedNodeMeta {
      if (node.nodeType === ParsedNodeType.document) {
        return this.__domDocumentToParsedNode(node as Document);
      }

      const parsedNode: ParsedNodeMeta = {
        nodeType: node.nodeType,
        __domNode: node,
      };

      if (node.nodeType === ParsedNodeType.text || node.nodeType === ParsedNodeType.comment) {
        parsedNode.textContent = node.textContent ?? '';
      }

      if (node.nodeType === ParsedNodeType.element) {
        const el = node as HTMLElement;
        parsedNode.tagName = el.tagName || '';
        parsedNode.namespaceURI = el.namespaceURI || undefined;

        const attrs = el.attributes || [];
        if (attrs.length) {
          parsedNode.attributes = {};
        }

        const boolAttributes: string[] = [];
        for (let i = 0; i < attrs.length; i++) {
          const attr = attrs[i];
          parsedNode.attributes![attr.nodeName] = attr.nodeValue || '';
          if (attr.nodeValue === '' && (el as any)[attr.nodeName] === true) {
            boolAttributes.push(attr.nodeName);
          }
        }

        boolAttributes.length && (parsedNode.__boolAttributes = boolAttributes);

        const childNodes = this.__getDomChildNodes(el);
        childNodes.length && (parsedNode.childNodes = childNodes.map((child) => this.__domToParsedNode(child)));
        parsedNode.__selfClosing = `${el.outerHTML || ''}`.slice(-2) === '/>';
      }

      return parsedNode;
    },

    __getDomChildNodes(node: Node) {
      const template = node as HTMLTemplateElement;
      const childNodes = template.content?.childNodes || node.childNodes || [];
      return Array.from(childNodes);
    },

    __createElementNode(tagName: string, childNodes: ParsedNodeMeta[] = []) {
      return {
        nodeType: ParsedNodeType.element,
        tagName,
        namespaceURI: ParsedNodeNamespace.html,
        childNodes,
      } as ParsedNodeMeta;
    },

    __createFragmentRoot(nodes: ParsedNode[]) {
      return {
        nodeType: ParsedNodeType.fragment,
        childNodes: nodes.map((node) => this.__cloneParsedNode(node)),
      } as ParsedNodeMeta;
    },

    __normalizeDocumentRoot(nodes: ParsedNode[]) {
      const flatNodes = nodes
        .map((node) => this.__cloneParsedNode(node))
        .flatMap((node) => (node.nodeType === ParsedNodeType.fragment ? getNodeChildNodes(node) : [node]));
      const documentNode = flatNodes.find((node) => node.nodeType === ParsedNodeType.document);
      if (documentNode) {
        return documentNode;
      }

      const htmlNode = flatNodes.find(
        (node) => node.nodeType === ParsedNodeType.element && getNodeTagName(node) === 'html',
      );
      const documentRoot: ParsedNodeMeta = {
        nodeType: ParsedNodeType.document,
        childNodes: [],
      };

      if (htmlNode) {
        const extraNodes = flatNodes.filter((node) => node !== htmlNode);
        if (extraNodes.length) {
          const bodyNode = this.__findChildElement(htmlNode, 'body') || this.__appendChildElement(htmlNode, 'body');
          bodyNode.childNodes = [...getNodeChildNodes(bodyNode), ...extraNodes];
        }

        documentRoot.childNodes = [htmlNode];
        return documentRoot;
      }

      const remaining = [...flatNodes];
      const headIndex = remaining.findIndex(
        (node) => node.nodeType === ParsedNodeType.element && getNodeTagName(node) === 'head',
      );
      const bodyIndex = remaining.findIndex(
        (node) => node.nodeType === ParsedNodeType.element && getNodeTagName(node) === 'body',
      );
      const headNode = headIndex >= 0 ? remaining.splice(headIndex, 1)[0] : undefined;
      const bodyNode =
        bodyIndex >= 0
          ? remaining.splice(bodyIndex > headIndex && headIndex >= 0 ? bodyIndex - 1 : bodyIndex, 1)[0]
          : undefined;
      const htmlRoot = this.__createElementNode('html');
      const htmlChildren: ParsedNodeMeta[] = [];

      headNode && htmlChildren.push(headNode);
      const normalizedBody = bodyNode || this.__createElementNode('body');
      normalizedBody.childNodes = [...getNodeChildNodes(normalizedBody), ...remaining];
      htmlChildren.push(normalizedBody);

      htmlRoot.childNodes = htmlChildren;
      documentRoot.childNodes = [htmlRoot];
      return documentRoot;
    },

    __appendChildElement(node: ParsedNodeMeta, tagName: string) {
      const child = this.__createElementNode(tagName);
      node.childNodes = [...getNodeChildNodes(node), child];
      return child;
    },

    __findChildElement(node: ParsedNodeMeta, tagName: string) {
      return getNodeChildNodes(node).find((child) => getNodeTagName(child) === tagName);
    },

    __removeElementNodes(root: ParsedNodeMeta, tagName: string) {
      const removed: ParsedNodeMeta[] = [];
      const remove = (node: ParsedNodeMeta) => {
        if (!node.childNodes?.length) return;
        const nextNodes: ParsedNodeMeta[] = [];

        node.childNodes.forEach((child) => {
          if (getNodeTagName(child) === tagName) {
            removed.push(child);
            return;
          }

          remove(child);
          nextNodes.push(child);
        });

        node.childNodes = nextNodes;
      };

      remove(root);
      return removed;
    },

    __getNodeTextContent(node: ParsedNodeMeta): string {
      if (node.nodeType === ParsedNodeType.text || node.nodeType === ParsedNodeType.comment) {
        return node.textContent ?? '';
      }

      if (node.textContent && !node.childNodes?.length) {
        return node.textContent;
      }

      return getNodeChildNodes(node)
        .map((child) => this.__getNodeTextContent(child))
        .join('');
    },

    __sanitizeNode(node: ParsedNodeMeta, opts: HTMLParserOptions) {
      const attrs = node.attributes || {};
      const cleanAttrs: Record<string, string> = {};

      each(attrs, (value, name) => {
        const attrValue = `${value}`;
        const isUnsafeAttr = !opts.allowUnsafeAttr && name.startsWith('on');
        const isUnsafeValue = !opts.allowUnsafeAttrValue && attrValue.startsWith('javascript:');

        if (!isUnsafeAttr && !isUnsafeValue) {
          cleanAttrs[name] = attrValue;
        }
      });

      if (Object.keys(cleanAttrs).length) {
        node.attributes = cleanAttrs;
      } else {
        delete node.attributes;
      }

      each(getNodeChildNodes(node), (child) => this.__sanitizeNode(child, opts));
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
