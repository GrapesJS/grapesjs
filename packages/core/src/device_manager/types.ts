import {
  EventCallbackAdd,
  EventCallbackAll,
  EventCallbackRemove,
  EventCallbackRemoveBefore,
  SetOptions,
} from '../common';
import Device, { DeviceProperties } from './model/Device';

/**{START_EVENTS}*/
export enum DeviceEvents {
  /**
   * @event `device:add` New device added to the collection. The `Device` is passed as an argument.
   * @example
   * editor.on('device:add', (device) => { ... });
   */
  add = 'device:add',
  addBefore = 'device:add:before',

  /**
   * @event `device:remove` Device removed from the collection. The `Device` is passed as an argument.
   * @example
   * editor.on('device:remove', (device) => { ... });
   */
  remove = 'device:remove',
  removeBefore = 'device:remove:before',

  /**
   * @event `device:select` A new device is selected. Current and previous `Device` are passed as arguments.
   * @example
   * editor.on('device:select', (newDevice, prevDevice) => { ... });
   */
  select = 'device:select',
  selectBefore = 'device:select:before',

  /**
   * @event `device:update` Device updated. The `Device`, changed properties, and update options are passed as arguments.
   * @example
   * editor.on('device:update', (device, changes, options) => { ... });
   */
  update = 'device:update',

  /**
   * @event `device` Catch-all event for all the events mentioned above.
   * @example
   * editor.on('device', ({ event, model, ... }) => { ... });
   */
  all = 'device',
}
/**{END_EVENTS}*/

export type DeviceEvent = `${DeviceEvents}`;

export interface DevicesEventCallback {
  [DeviceEvents.add]: EventCallbackAdd<Device>;
  [DeviceEvents.remove]: EventCallbackRemove<Device>;
  [DeviceEvents.removeBefore]: EventCallbackRemoveBefore<Device>;
  [DeviceEvents.select]: [Device | null | undefined, Device | null | undefined];
  [DeviceEvents.update]: [Device, Partial<DeviceProperties>, SetOptions];
  [DeviceEvents.all]: EventCallbackAll<DeviceEvent, Device>;
}

// This is necessary to prevent the TS documentation generator from breaking.
export default DeviceEvents;
