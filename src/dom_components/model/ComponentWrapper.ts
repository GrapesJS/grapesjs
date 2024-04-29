import { isUndefined } from 'underscore';
import { attrToString } from '../../utils/dom';
import Component from './Component';
import ComponentHead, { type as typeHead } from './ComponentHead';
import { ToHTMLOptions } from './types';

export default class ComponentWrapper extends Component {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      tagName: 'body',
      removable: false,
      copyable: false,
      draggable: false,
      components: [],
      traits: [],
      doctype: '',
      head: null,
      docEl: null,
      stylable: [
        'background',
        'background-color',
        'background-image',
        'background-repeat',
        'background-attachment',
        'background-position',
        'background-size',
      ],
    };
  }

  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args);
    const opts = args[1];
    const cmp = opts?.em?.Components;
    const CmpHead = cmp?.getType(typeHead)?.model;
    const CmpDef = cmp?.getType('default').model;
    if (CmpHead) {
      this.set({
        head: new CmpHead({}, opts),
        docEl: new CmpDef({ tagName: 'html' }, opts),
      });
    }
  }

  get head(): ComponentHead {
    return this.get('head');
  }

  get docEl(): Component {
    return this.get('docEl');
  }

  toHTML(opts: ToHTMLOptions = {}) {
    const { doctype = '' } = this.attributes;
    const asDoc = !isUndefined(opts.asDocument) ? opts.asDocument : !!doctype;
    const { head, docEl } = this;
    const body = super.toHTML(opts);
    const headStr = (asDoc && head?.toHTML(opts)) || '';
    const docElAttr = (asDoc && attrToString(docEl?.getAttrToHTML())) || '';
    const docElAttrStr = docElAttr ? ` ${docElAttr}` : '';
    return asDoc ? `${doctype}<html${docElAttrStr}>${headStr}${body}</html>` : body;
  }

  __postAdd() {
    const um = this.em?.UndoManager;
    !this.__hasUm && um?.add(this);
    return super.__postAdd();
  }

  __postRemove() {
    const um = this.em?.UndoManager;
    um?.remove(this);
    return super.__postRemove();
  }

  static isComponent() {
    return false;
  }
}
