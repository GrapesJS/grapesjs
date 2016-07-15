/**
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var deviceManager = editor.DeviceManager;
 * ```
 *
 * @module Devices
 * @param {Object} config Configurations
 * @param {Array<Object>} [config.devices=[]] Default devices
 * @example
 * ...
 * deviceManager: {
 *    devices: [
 *      {name: 'Desktop', width: ''}
 *      {name: 'Tablet', width: '991px'}
 *    ],
 * }
 * ...
 */
define(function(require) {

  return function(config) {
    var c = config || {},
      defaults = require('./config/config'),
      Devices = require('./model/Devices');

    for (var name in defaults) {
      if (!(name in c))
        c[name] = defaults[name];
    }

    var devices = new Devices(c.devices);

    return {

        /**
         * Add new device to the collection. URLs are supposed to be unique
         * @param {string} name Device name
         * @param {string} width Width of the device
         * @param {Object} opts Custom options
         * @return {Device} Added device
         * @example
         * // In case of strings, would be interpreted as images
         * deviceManager.add('Tablet', '900px');
         */
        add: function(name, width, opts){
          var obj = opts || {};
          obj.name = name;
          obj.width = width;
          return devices.add(obj);
        },

        /**
         * Return device by name
         * @param  {string} name Name of the device
         * @example
         * var device = deviceManager.get('Tablet');
         * console.log(JSON.stringify(device));
         * // {name: 'Tablet', width: '900px'}
         */
        get: function(name){
          return devices.get(name);
        },

        /**
         * Return all devices
         * @return {Collection}
         * @example
         * var devices = deviceManager.getAll();
         * console.log(JSON.stringify(devices));
         * // [{name: 'Desktop', width: ''}, ...]
         */
        getAll: function(){
          return devices;
        },

    };

  };

});