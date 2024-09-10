/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/GrapesJS/grapesjs/blob/master/src/device_manager/config/config.ts)
 * ```js
 * const editor = grapesjs.init({
 *  deviceManager: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const deviceManager = editor.Devices;
 * ```
 * ## Available Events
 * * `device:add` - Added new device. The [Device] is passed as an argument to the callback
 * * `device:remove` - Device removed. The [Device] is passed as an argument to the callback
 * * `device:select` - New device selected. The newly selected [Device] and the previous one, are passed as arguments to the callback
 * * `device:update` - Device updated. The updated [Device] and the object containing changes are passed as arguments to the callback
 * * `device` - Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback
 *
 * ## Methods
 * * [add](#add)
 * * [get](#get)
 * * [getDevices](#getdevices)
 * * [remove](#remove)
 * * [select](#select)
 * * [getSelected](#getselected)
 *
 * [Device]: device.html
 *
 * @module Devices
 */
import { isString } from 'underscore';
import { ItemManagerModule } from '../abstract/Module';
import EditorModel from '../editor/model/Editor';
import defaults, { DeviceManagerConfig } from './config/config';
import Device, { DeviceProperties } from './model/Device';
import Devices from './model/Devices';
import DevicesView from './view/DevicesView';

export const evAll = 'device';
export const evPfx = `${evAll}:`;
export const evSelect = `${evPfx}select`;
export const evSelectBefore = `${evSelect}:before`;
export const evUpdate = `${evPfx}update`;
export const evAdd = `${evPfx}add`;
export const evAddBefore = `${evAdd}:before`;
export const evRemove = `${evPfx}remove`;
export const evRemoveBefore = `${evRemove}:before`;
const chnSel = 'change:device';
const deviceEvents = {
  all: evAll,
  select: evSelect,
  update: evUpdate,
  add: evAdd,
  remove: evRemove,
  removeBefore: evRemoveBefore,
};

export default class DeviceManager extends ItemManagerModule<
  DeviceManagerConfig & { appendTo?: HTMLElement | string },
  Devices
> {
  devices: Devices;
  events!: typeof deviceEvents;
  view?: DevicesView;

  Device = Device;

  Devices = Devices;

  storageKey = '';

  constructor(em: EditorModel) {
    super(em, 'DeviceManager', new Devices(), deviceEvents, defaults);
    this.devices = this.all;
    this.config.devices?.forEach((device) => this.add(device, { silent: true }));
    this.select(this.config.default || this.devices.at(0));
    em.on(chnSel, this._onSelect, this);
    return this;
  }

  _onSelect(m: EditorModel, deviceId: string, opts: Record<string, any>) {
    const { em, events } = this;
    const prevId = m.previous('device');
    const newDevice = this.get(deviceId);
    const ev = events.select;
    em.trigger(ev, newDevice, this.get(prevId));
    this.__catchAllEvent(ev, newDevice, opts);
  }

  /**
   * Add new device
   * @param {Object} props Device properties
   * @returns {[Device]} Added device
   * @example
   * const device1 = deviceManager.add({
   *  // Without an explicit ID, the `name` will be taken. In case of missing `name`, a random ID will be created.
   *  id: 'tablet',
   *  name: 'Tablet',
   *  width: '900px', // This width will be applied on the canvas frame and for the CSS media
   * });
   * const device2 = deviceManager.add({
   *  id: 'tablet2',
   *  name: 'Tablet 2',
   *  width: '800px', // This width will be applied on the canvas frame
   *  widthMedia: '810px', // This width that will be used for the CSS media
   *  height: '600px', // Height will be applied on the canvas frame
   * });
   */
  add(props: DeviceProperties, options: Record<string, any> = {}) {
    let result;
    let opts = options;

    // Support old API
    if (isString(props)) {
      const width = options;
      opts = arguments[2] || {};
      result = {
        ...opts,
        id: props,
        name: opts.name || props,
        width,
      };
    } else {
      result = props;
    }

    if (!result.id) {
      result.id = result.name || this._createId();
    }

    return this.devices.add(result, opts);
  }

  /**
   * Return device by ID
   * @param  {String} id ID of the device
   * @returns {[Device]|null}
   * @example
   * const device = deviceManager.get('Tablet');
   * console.log(JSON.stringify(device));
   * // {name: 'Tablet', width: '900px'}
   */
  get(id: string): Device | undefined {
    // Support old API
    const byName = this.getAll().filter((d) => d.get('name') === id)[0];
    return byName || this.devices.get(id) || null;
  }

  /**
   * Remove device
   * @param {String|[Device]} device Device or device id
   * @returns {[Device]} Removed device
   * @example
   * const removed = deviceManager.remove('device-id');
   * // or by passing the Device
   * const device = deviceManager.get('device-id');
   * deviceManager.remove(device);
   */
  remove(device: string | Device, opts = {}) {
    return this.__remove(device, opts);
  }

  /**
   * Return all devices
   * @returns {Array<[Device]>}
   * @example
   * const devices = deviceManager.getDevices();
   * console.log(JSON.stringify(devices));
   * // [{name: 'Desktop', width: ''}, ...]
   */
  getDevices() {
    return this.devices.models;
  }

  /**
   * Change the selected device. This will update the frame in the canvas
   * @param {String|[Device]} device Device or device id
   * @example
   * deviceManager.select('some-id');
   * // or by passing the page
   * const device = deviceManager.get('some-id');
   * deviceManager.select(device);
   */
  select(device: string | Device, opts = {}) {
    const md = isString(device) ? this.get(device) : device;
    md && this.em.set('device', md.get('id'), opts);
    return this;
  }

  /**
   * Get the selected device
   * @returns {[Device]}
   * @example
   * const selected = deviceManager.getSelected();
   */
  getSelected() {
    return this.get(this.em.get('device'));
  }

  getAll() {
    return this.devices;
  }

  render() {
    const { em } = this;
    this.view?.remove();
    this.view = new DevicesView({
      collection: this.devices,
      config: { em, ...this.config },
    });
    return this.view.render().el;
  }

  destroy() {
    this.__destroy();
  }
}
