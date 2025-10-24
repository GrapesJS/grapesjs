import Component from '../dom_components/model/Component';

export interface LayerData {
  name: string;
  open: boolean;
  selected: boolean;
  hovered: boolean;
  visible: boolean;
  locked: boolean;
  components: Component[];
}

/**{START_EVENTS}*/
export enum LayerEvents {
  /**
   * @event `layer:root` Root layer changed. The new root component is passed as an argument to the callback.
   * @example
   * editor.on('layer:root', (component) => { ... });
   */
  root = 'layer:root',

  /**
   * @event `layer:component` Component layer is updated. The updated component is passed as an argument to the callback.
   * @example
   * editor.on('layer:component', (component, opts) => { ... });
   */
  component = 'layer:component',

  /**
   * @event `layer:custom` Custom layer event. Object with container and root is passed as an argument to the callback.
   * @example
   * editor.on('layer:custom', ({ container, root }) => { ... });
   */
  custom = 'layer:custom',
}
/**{END_EVENTS}*/

// need this to avoid the TS documentation generator to break
export default LayerEvents;
