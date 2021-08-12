import Editor from 'editor';

describe('DeviceManager', () => {
  describe('Main', () => {
    let obj;
    let testNameDevice;
    let testWidthDevice;
    let editor;

    beforeEach(() => {
      testNameDevice = 'Tablet';
      testWidthDevice = '100px';
      editor = new Editor({
        deviceManager: {
          devices: []
        }
      }).init();
      obj = editor.Devices;
    });

    afterEach(() => {
      editor.destroy();
      obj = null;
    });

    test('Object exists', () => {
      expect(obj).toBeTruthy();
    });

    test('No device inside', () => {
      var coll = obj.getAll();
      expect(coll.length).toEqual(0);
    });

    test('Add new device', () => {
      var model = obj.add(testNameDevice, testWidthDevice);
      expect(obj.getAll().length).toEqual(1);
    });

    test('Added device has correct data', () => {
      var model = obj.add(testNameDevice, testWidthDevice);
      expect(model.get('name')).toEqual(testNameDevice);
      expect(model.get('width')).toEqual(testWidthDevice);
    });

    test('Add device width options', () => {
      var model = obj.add(testNameDevice, testWidthDevice, { opt: 'value' });
      expect(model.get('opt')).toEqual('value');
    });

    test('The name of the device is unique', () => {
      var model = obj.add(testNameDevice, testWidthDevice);
      var model2 = obj.add(testNameDevice, '2px');
      expect(model).toEqual(model2);
    });

    test('Get device by name', () => {
      var model = obj.add(testNameDevice, testWidthDevice);
      var model2 = obj.get(testNameDevice);
      expect(model).toEqual(model2);
    });

    test('Render devices', () => {
      expect(obj.render()).toBeTruthy();
    });
  });
});
