import { ParsedNode, ParsedNodeNamespace, ParsedNodeType, SyntheticElementCtor } from '../types';

const getTagName = (node: ParsedNode) => {
  const tagName = node.tagName || '';
  return tagName && (!node.namespaceURI || node.namespaceURI === ParsedNodeNamespace.html)
    ? tagName.toUpperCase()
    : tagName;
};

const getNodeTextContent = (node: ParsedNode): string => {
  if (node.nodeType === ParsedNodeType.text || node.nodeType === ParsedNodeType.comment) {
    return node.textContent ?? '';
  }

  if (node.textContent && !node.childNodes?.length) {
    return node.textContent;
  }

  return (node.childNodes || []).map(getNodeTextContent).join('');
};

const getClassList = (node: ParsedNode) => {
  const value = node.attributes?.class || '';
  const items = value.split(/\s+/).filter(Boolean);

  return {
    value,
    length: items.length,
    contains(name: string) {
      return items.includes(name);
    },
    item(index: number) {
      return items[index] || null;
    },
    toString() {
      return value;
    },
  };
};

export class SyntheticElement {
  node: ParsedNode;
  parent?: SyntheticElement;

  constructor(node: ParsedNode, parent?: SyntheticElement) {
    this.node = node;
    this.parent = parent;
  }

  get nodeType() {
    return this.node.nodeType;
  }

  get tagName() {
    return getTagName(this.node);
  }

  get nodeName() {
    return this.tagName;
  }

  get namespaceURI() {
    return this.node.namespaceURI;
  }

  get parentNode() {
    return this.parent;
  }

  get childNodes() {
    return (this.node.childNodes || []).map((node) => new (this.constructor as SyntheticElementCtor)(node, this));
  }

  get children() {
    return this.childNodes.filter((node) => node.nodeType === 1);
  }

  get textContent() {
    return getNodeTextContent(this.node);
  }

  get nodeValue() {
    return this.nodeType === ParsedNodeType.text || this.nodeType === ParsedNodeType.comment ? this.textContent : null;
  }

  get className() {
    return this.getAttribute('class') || '';
  }

  get classList() {
    return getClassList(this.node);
  }

  getAttribute(key: string) {
    return this.node.attributes?.[key];
  }

  hasAttribute(key: string) {
    return Object.prototype.hasOwnProperty.call(this.node.attributes || {}, key);
  }
}

export const getSyntheticElementCtor = (
  customSyntheticElement?: ((SyntheticElement: SyntheticElementCtor) => SyntheticElementCtor) | null,
) => (customSyntheticElement ? customSyntheticElement(SyntheticElement as SyntheticElementCtor) : SyntheticElement);
