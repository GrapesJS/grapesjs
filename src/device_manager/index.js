/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/device_manager/config/config.js)
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
 * * [getAll](#getAll)
 *
 * [Device]: device.html
 *
 * @module Devices
 */
import { isString } from 'underscore';
import Module from 'common/module';
import defaults from './config/config';
import Device from './model/Device';
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

export default () => {
  let c = {};
  let devices;
  let view;

  return {
    ...Module,

    name: 'DeviceManager',

    Device,

    Devices,

    events: {
      all: evAll,
      select: evSelect,
      // selectBefore: evSelectBefore,
      update: evUpdate,
      add: evAdd,
      // addBefore: evAddBefore,
      remove: evRemove,
      removeBefore: evRemoveBefore
    },

    init(config = {}) {
      c = { ...defaults, ...config };
      const { em } = c;
      this.em = em;

      devices = new Devices();
      (c.devices || []).forEach(dv => this.add(dv.id || dv.name, dv.width, dv));
      this.all = devices;
      devices
        .on('add', (m, c, o) => em.trigger(evAdd, m, o))
        .on('remove', (m, c, o) => em.trigger(evRemove, m, o))
        .on('all', this.__catchAllEvent, this);

      return this;
    },

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
    add(props, options = {}) {
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
          width
        };
      } else {
        result = props;
      }

      if (!result.id) {
        result.id = result.name || this._createId();
      }

      return devices.add(result, opts);
    },

    /**
     * Return device by ID
     * @param  {String} id ID of the device
     * @returns {[Device]|null}
     * @example
     * const device = deviceManager.get('Tablet');
     * console.log(JSON.stringify(device));
     * // {name: 'Tablet', width: '900px'}
     */
    get(id) {
      // Support old API
      const byName = this.getAll().filter(d => d.get('name') === id)[0];
      return byName || devices.get(id) || null;
    },

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
    remove(device, opts = {}) {
      return this.__remove(device, opts);
    },

    /**
     * Return all devices
     * @returns {Array<[Device]>}
     * @example
     * const devices = deviceManager.getDevices();
     * console.log(JSON.stringify(devices));
     * // [{name: 'Desktop', width: ''}, ...]
     */
    getDevices() {
      return devices.models;
    },

    getAll() {
      return devices;
    },

    render() {
      view && view.remove();
      view = new DevicesView({
        collection: devices,
        config: c
      });
      return view.render().el;
    },

    destroy() {
      devices.stopListening();
      devices.reset();
      view && view.remove();
      [devices, view].forEach(i => (i = null));
      c = {};
    }
  };
};
