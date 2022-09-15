import { forEach } from 'underscore';
import { toLowerCase } from 'utils/mixins';
import ComponentText from './ComponentText';

const type = 'link';

export default class ComponentLink extends ComponentText {
  get defaults() {
    return {
      ...super.defaults,
      type,
      tagName: 'a',
      traits: ['title', 'href', 'target'],
    };
  }
}

ComponentLink.isComponent = (el, opts = {}) => {
  let result;

  if (toLowerCase(el.tagName) === 'a') {
    const textTags = opts.textTags || [];
    result = { type, editable: false };

    // The link is editable only if, at least, one of its
    // children is a text node (not empty one)
    const children = el.childNodes;
    const len = children.length;
    if (!len) delete result.editable;

    forEach(children, child => {
      const { tagName } = child;
      if (
        (child.nodeType == 3 && child.textContent.trim() !== '') ||
        (tagName && textTags.indexOf(toLowerCase(tagName)) >= 0)
      ) {
        delete result.editable;
      }
    });
  }

  return result;
};
