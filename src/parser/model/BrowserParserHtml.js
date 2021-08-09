import { each } from 'underscore';

const htmlType = 'text/html';
const defaultType = 'application/xml';

export default (str, config = {}) => {
  const parser = new DOMParser();
  const mimeType = config.htmlType || defaultType;
  const toHTML = mimeType === htmlType;
  const strF = toHTML ? str : `<div>${str}</div>`;
  const doc = parser.parseFromString(strF, mimeType);
  let res;

  if (toHTML) {
    // Replicate the old parser in order to avoid breaking changes
    const { head, body } = doc;
    // Move all scripts at the bottom of the page
    const scripts = head.querySelectorAll('script');
    each(scripts, node => body.appendChild(node));
    // Move inside body all head children
    const hEls = [];
    each(head.children, n => hEls.push(n));
    each(hEls, (node, i) => body.insertBefore(node, body.children[i]));
    res = body;
  } else {
    res = doc.firstChild;
  }

  return res;
};

/**
 * POC, custom html parser specs
 * Parse an HTML string to an array of nodes
 * example
 * parse(`<div class="mycls" data-test>Hello</div><span>World <b>example</b></span>`)
 * // result
 * [
 *  {
 *      tagName: 'div',
 *      attributes: { class: 'mycls', 'data-test': '' },
 *      childNodes: ['Hello'],
 *  },{
 *      tagName: 'span',
 *      childNodes: [
 *          'World ',
 *          {
 *              tagName: 'b',
 *              childNodes: ['example'],
 *          }
 *       ],
 *  }
 * ]
 *

export const parseNodes = nodes => {
  const result = [];

  for (let i = 0; i < nodes.length; i++) {
    result.push(parseNode(nodes[i]));
  }

  return result;
};

export const parseAttributes = attrs => {
  const result = {};

  for (let j = 0; j < attrs.length; j++) {
    const attr = attrs[j];
    const nodeName = attr.nodeName;
    const nodeValue = attr.nodeValue;
    result[nodeName] = nodeValue;
  }

  return result;
};

export const parseNode = el => {
  // Return the string of the textnode element
  if (el.nodeType === 3) {
    return el.nodeValue;
  }

  const tagName = node.tagName ? node.tagName.toLowerCase() : '';
  const attrs = el.attributes || [];
  const nodes = el.childNodes || [];

  return {
    ...(tagName && { tagName }),
    ...(attrs.length && {
      attributes: parseAttributes(attrs)
    }),
    ...(nodes.length && {
      childNodes: parseNodes(nodes)
    })
  };
};

export default (str, config = {}) => {
  const result = [];
  const el = document.createElement('div');
  el.innerHTML = str;
  const nodes = el.childNodes;
  const len = nodes.length;

  for (let i = 0; i < len; i++) {
    result.push(parseNode(nodes[i]));
  }

  return result;
};
 */
