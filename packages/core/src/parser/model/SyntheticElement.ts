import { ParsedNode, SyntheticElementCtor } from '../types';

const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';

const getTagName = (node: ParsedNode) => {
  const tagName = node.tagName || '';
  return tagName && (!node.namespaceURI || node.namespaceURI === HTML_NAMESPACE) ? tagName.toUpperCase() : tagName;
};

const getNodeTextContent = (node: ParsedNode): string => {
  if (node.nodeType === 3 || node.nodeType === 8) {
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
    return this.nodeType === 3 || this.nodeType === 8 ? this.textContent : null;
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
