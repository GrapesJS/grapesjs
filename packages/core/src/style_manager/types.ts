import StyleManager from '.';
import StyleableModel from '../domain_abstract/model/StyleableModel';
import { PropertyNumberProps } from './model/PropertyNumber';
import { PropertySelectProps } from './model/PropertySelect';
import { PropertyStackProps } from './model/PropertyStack';

export type PropertyTypes = PropertyStackProps | PropertySelectProps | PropertyNumberProps;

export type StyleTarget = StyleableModel;

export type StyleModuleParam<T extends keyof StyleManager, N extends number> = Parameters<StyleManager[T]>[N];

/**{START_EVENTS}*/
export enum StyleManagerEvents {
  /**
   * @event `style:sector:add` Sector added. The Sector is passed as an argument to the callback.
   * @example
   * editor.on('style:sector:add', (sector) => { ... });
   */
  sectorAdd = 'style:sector:add',

  /**
   * @event `style:sector:remove` Sector removed. The Sector is passed as an argument to the callback.
   * @example
   * editor.on('style:sector:remove', (sector) => { ... });
   */
  sectorRemove = 'style:sector:remove',

  /**
   * @event `style:sector:update` Sector updated. The Sector and the object containing changes are passed as arguments to the callback.
   * @example
   * editor.on('style:sector:update', (sector, changes) => { ... });
   */
  sectorUpdate = 'style:sector:update',

  /**
   * @event `style:property:add` Property added. The Property is passed as an argument to the callback.
   * @example
   * editor.on('style:property:add', (property) => { ... });
   */
  propertyAdd = 'style:property:add',

  /**
   * @event `style:property:remove` Property removed. The Property is passed as an argument to the callback.
   * @example
   * editor.on('style:property:remove', (property) => { ... });
   */
  propertyRemove = 'style:property:remove',

  /**
   * @event `style:property:update` Property updated. The Property and the object containing changes are passed as arguments to the callback.
   * @example
   * editor.on('style:property:update', (property, changes) => { ... });
   */
  propertyUpdate = 'style:property:update',

  /**
   * @event `style:target` Target selection changed. The target (or null in case the target is deselected) is passed as an argument to the callback.
   * @example
   * editor.on('style:target', (target) => { ... });
   */
  target = 'style:target',

  /**
   * @event `style:layer:select` Layer selected. Object containing layer data is passed as an argument.
   * @example
   * editor.on('style:layer:select', (data) => { ... });
   */
  layerSelect = 'style:layer:select',

  /**
   * @event `style:custom` Custom style event. Object containing all custom data is passed as an argument.
   * @example
   * editor.on('style:custom', ({ container }) => { ... });
   */
  custom = 'style:custom',

  /**
   * @event `style` Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback.
   * @example
   * editor.on('style', ({ event, sector, property, ... }) => { ... });
   */
  all = 'style',
}
/**{END_EVENTS}*/

// need this to avoid the TS documentation generator to break
export default StyleManagerEvents;
