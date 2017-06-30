const DeviceManager = require('device_manager');
const DevicesView = require('./view/DevicesView');

describe('DeviceManager', () => {

  describe('Main', () => {

    var obj;
    var testNameDevice;
    var testWidthDevice;

    beforeEach(() => {
      testNameDevice = 'Tablet';
      testWidthDevice = '100px';
      obj = new DeviceManager().init();
    });

    afterEach(() => {
      obj = null;
    });

    it('Object exists', () => {
      expect(obj).toExist();
    });

    it('No device inside', () => {
      var coll = obj.getAll();
      expect(coll.length).toEqual(0);
    });

    it('Add new device', () => {
      var model = obj.add(testNameDevice, testWidthDevice);
      expect(obj.getAll().length).toEqual(1);
    });

    it('Added device has correct data', () => {
      var model = obj.add(testNameDevice, testWidthDevice);
      expect(model.get('name')).toEqual(testNameDevice);
      expect(model.get('width')).toEqual(testWidthDevice);
    });

    it('Add device width options', () => {
      var model = obj.add(testNameDevice, testWidthDevice, {opt: 'value'});
      expect(model.get('opt')).toEqual('value');
    });

    it('The name of the device is unique', () => {
      var model = obj.add(testNameDevice, testWidthDevice);
      var model2 = obj.add(testNameDevice, '2px');
      expect(model).toEqual(model2);
    });

    it('Get device by name', () => {
      var model = obj.add(testNameDevice, testWidthDevice);
      var model2 = obj.get(testNameDevice);
      expect(model).toEqual(model2);
    });

    it('Render devices', () => {
      expect(obj.render()).toExist();
    });

  });

  DevicesView.run();

});
