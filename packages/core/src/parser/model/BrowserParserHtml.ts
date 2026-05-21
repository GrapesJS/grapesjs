import { each } from 'underscore';
import { HTMLParserOptions } from '../config/config';

const htmlType = 'text/html';
const defaultType = htmlType; // 'application/xml';

export default (str: string, config: HTMLParserOptions = {}) => {
  const parser = new DOMParser();
  const mimeType = config.htmlType || defaultType;
  const toHTML = mimeType === htmlType;
  const strF = toHTML ? str : `<div>${str}</div>`;
  const doc = parser.parseFromString(strF, mimeType);
  let res: HTMLElement;

  if (toHTML) {
    if (config.asDocument) return doc;

    // Replicate the old parser in order to avoid breaking changes
    const { head, body } = doc;
    // Move all scripts at the bottom of the page
    const scripts = head.querySelectorAll('script');
    each(scripts, (node) => body.appendChild(node));
    // Move inside body all head children
    const hEls: Element[] = [];
    each(head.children, (n) => hEls.push(n));
    each(hEls, (node, i) => body.insertBefore(node, body.children[i]));
    res = body;
  } else {
    res = doc.firstChild as HTMLElement;
  }

  return res;
};
