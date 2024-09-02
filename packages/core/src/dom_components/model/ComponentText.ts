import { isFunction } from 'underscore';
import Component from './Component';
import { ComponentOptions, ComponentProperties } from './types';

export default class ComponentText extends Component {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      type: 'text',
      droppable: false,
      editable: true,
    };
  }

  constructor(props: ComponentProperties = {}, opt: ComponentOptions) {
    super(props, opt);
    this.__checkInnerChilds();
  }

  __checkInnerChilds() {
    const { disableTextInnerChilds } = this.em.Components.config;
    if (disableTextInnerChilds) {
      const disableChild = (child: Component) => {
        if (!child.isInstanceOf('textnode')) {
          child.set({
            locked: true,
            layerable: false,
          });
        }
      };

      if (isFunction(disableTextInnerChilds)) {
        this.forEachChild((child) => {
          disableTextInnerChilds(child) && disableChild(child);
        });
      } else {
        this.forEachChild(disableChild);
      }
    }
  }
}
