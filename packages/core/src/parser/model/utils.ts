import { each } from 'underscore';
import { doctypeToString } from '../../utils/dom';
import { HTMLParserOptions } from '../config/config';
import { ParsedNode, ParsedNodeMeta, ParsedNodeNamespace, ParsedNodeType } from '../types';

export const getNodeChildNodes = (node: ParsedNodeMeta) => node.childNodes || [];

export const getNodeTagName = (node: ParsedNodeMeta) => `${node.tagName || ''}`.toLowerCase();

export const getSourceNode = (node: ParsedNodeMeta) => node.__domNode || node;

export const getDomChildNodes = (node: Node) => {
  const template = node as HTMLTemplateElement;
  const childNodes = template.content?.childNodes || node.childNodes || [];
  return Array.from(childNodes);
};

export const createElementNode = (tagName: string, childNodes: ParsedNodeMeta[] = []): ParsedNodeMeta => ({
  nodeType: ParsedNodeType.element,
  tagName,
  namespaceURI: ParsedNodeNamespace.html,
  childNodes,
});

export const createFragmentRoot = (childNodes: ParsedNode[]): ParsedNodeMeta => ({
  nodeType: ParsedNodeType.fragment,
  childNodes,
});

export const appendChildElement = (node: ParsedNodeMeta, tagName: string) => {
  const child = createElementNode(tagName);
  node.childNodes = [...getNodeChildNodes(node), child];
  return child;
};

export const findChildElement = (node: ParsedNodeMeta, tagName: string) =>
  getNodeChildNodes(node).find((child) => getNodeTagName(child) === tagName);

export const getNodeTextContent = (node: ParsedNodeMeta): string => {
  if (node.nodeType === ParsedNodeType.text || node.nodeType === ParsedNodeType.comment) {
    return node.textContent ?? '';
  }

  if (node.textContent && !node.childNodes?.length) {
    return node.textContent;
  }

  return getNodeChildNodes(node)
    .map((child) => getNodeTextContent(child))
    .join('');
};

export const removeElementNodes = (root: ParsedNodeMeta, tagName: string) => {
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
};

export const sanitizeNode = (node: ParsedNodeMeta, opts: HTMLParserOptions) => {
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

  getNodeChildNodes(node).forEach((child) => sanitizeNode(child, opts));
};

export const domDocumentToParsedNode = (doc: Document): ParsedNodeMeta => ({
  nodeType: ParsedNodeType.document,
  __domNode: doc,
  __doctype: doctypeToString(doc.doctype),
  childNodes: doc.documentElement ? [domToParsedNode(doc.documentElement)] : [],
});

export const domToParsedNode = (node: Node): ParsedNodeMeta => {
  const { nodeType } = node;
  if (nodeType === ParsedNodeType.document) return domDocumentToParsedNode(node as Document);

  const el = node as HTMLElement;
  const parsedNode: ParsedNodeMeta = {
    nodeType,
    tagName: el.tagName || '',
    namespaceURI: el.namespaceURI || undefined,
    __domNode: node,
  };

  if (nodeType === ParsedNodeType.text || nodeType === ParsedNodeType.comment) {
    parsedNode.textContent = node.textContent ?? '';
  }

  if (nodeType === ParsedNodeType.element) {
    const el = node as HTMLElement;

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

    const childNodes = getDomChildNodes(el);
    childNodes.length && (parsedNode.childNodes = childNodes.map((child) => domToParsedNode(child)));
    parsedNode.__selfClosing = `${el.outerHTML || ''}`.slice(-2) === '/>';
  }

  return parsedNode;
};

export const domRootToFragmentParsedNode = (root: HTMLElement): ParsedNodeMeta => ({
  nodeType: ParsedNodeType.fragment,
  __domNode: root,
  childNodes: getDomChildNodes(root).map((node) => domToParsedNode(node)),
});

export const normalizeDocumentRoot = (nodes: ParsedNode[]) => {
  const flatNodes = nodes.flatMap((node) =>
    node.nodeType === ParsedNodeType.fragment ? getNodeChildNodes(node) : [node],
  );
  const documentNode = flatNodes.find((node) => node.nodeType === ParsedNodeType.document);
  if (documentNode) {
    return documentNode;
  }

  const htmlNode = flatNodes.find((node) => getNodeTagName(node) === 'html');
  const documentRoot: ParsedNodeMeta = {
    nodeType: ParsedNodeType.document,
    childNodes: [],
  };

  if (htmlNode) {
    const extraNodes = flatNodes.filter((node) => node !== htmlNode);
    if (extraNodes.length) {
      const bodyNode = findChildElement(htmlNode, 'body') || appendChildElement(htmlNode, 'body');
      bodyNode.childNodes = [...getNodeChildNodes(bodyNode), ...extraNodes];
    }

    documentRoot.childNodes = [htmlNode];
    return documentRoot;
  }

  const remaining = [...flatNodes];
  const headIndex = remaining.findIndex((node) => getNodeTagName(node) === 'head');
  const bodyIndex = remaining.findIndex((node) => getNodeTagName(node) === 'body');
  const headNode = headIndex >= 0 ? remaining.splice(headIndex, 1)[0] : undefined;
  const bodyNode =
    bodyIndex >= 0
      ? remaining.splice(bodyIndex > headIndex && headIndex >= 0 ? bodyIndex - 1 : bodyIndex, 1)[0]
      : undefined;
  const htmlRoot = createElementNode('html');
  const htmlChildren: ParsedNodeMeta[] = [];

  headNode && htmlChildren.push(headNode);
  const normalizedBody = bodyNode || createElementNode('body');
  normalizedBody.childNodes = [...getNodeChildNodes(normalizedBody), ...remaining];
  htmlChildren.push(normalizedBody);

  htmlRoot.childNodes = htmlChildren;
  documentRoot.childNodes = [htmlRoot];
  return documentRoot;
};
