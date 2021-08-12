import Editor from 'editor';

describe('DeviceManager', () => {
  describe('Main', () => {
    let obj;
    let testNameDevice;
    let testWidthDevice;
    let editor;
    let em;

    beforeEach(() => {
      testNameDevice = 'Tablet';
      testWidthDevice = '100px';
      editor = new Editor({
        deviceManager: {
          devices: []
        }
      }).init();
      em = editor.getModel();
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
      obj.add(testNameDevice, testWidthDevice);
      expect(obj.getAll().length).toEqual(1);
    });

    test('Add new device triggers proper events', () => {
      const eventFn = jest.fn();
      const eventFnAll = jest.fn();
      em.on(obj.events.add, eventFn);
      em.on(obj.events.all, eventFnAll);
      obj.add(testNameDevice, testWidthDevice);
      expect(eventFn).toBeCalledTimes(1);
      expect(eventFnAll).toBeCalled();
    });

    test('Added device has correct data', () => {
      var model = obj.add(testNameDevice, testWidthDevice);
      expect(model.get('id')).toEqual(testNameDevice);
      expect(model.get('name')).toEqual(testNameDevice);
      expect(model.get('width')).toEqual(testWidthDevice);
    });

    test('Add device width options', () => {
      var model = obj.add(testNameDevice, testWidthDevice, { opt: 'value' });
      expect(model.get('opt')).toEqual('value');
    });

    test('Add device with props', () => {
      const model = obj.add({
        name: testNameDevice,
        width: testWidthDevice
      });
      expect(model.get('id')).toEqual(testNameDevice);
      expect(model.get('name')).toEqual(testNameDevice);
      expect(model.get('width')).toEqual(testWidthDevice);
    });

    test('Add device without id and name', () => {
      const model = obj.add({
        width: testWidthDevice
      });
      expect(model.get('name')).toEqual('');
      expect(model.get('width')).toEqual(testWidthDevice);
      expect(model.get('id')).toBeTruthy();
    });

    test('The name of the device is unique', () => {
      const model = obj.add(testNameDevice, testWidthDevice);
      const model2 = obj.add(testNameDevice, '2px');
      const model3 = obj.add({ id: testNameDevice, width: '3px' });
      expect(model).toBe(model2);
      expect(model2).toBe(model3);
    });

    test('Get device by name', () => {
      const model = obj.add(testNameDevice, testWidthDevice);
      const model2 = obj.get(testNameDevice);
      expect(model).toEqual(model2);
    });

    test('Get device by name with different id', () => {
      const model = obj.add({
        id: 'device',
        name: testNameDevice
      });
      const model2 = obj.get(testNameDevice);
      expect(model).toBe(model2);
    });

    test('Remove device', () => {
      const id = 'device';
      const all = obj.getAll();
      const model = obj.add({ id });
      expect(all.length).toEqual(1);
      const eventFn = jest.fn();
      const eventFnAll = jest.fn();
      em.on(obj.events.remove, eventFn);
      em.on(obj.events.all, eventFnAll);

      const removed = obj.remove(id);
      expect(all.length).toEqual(0);
      expect(model).toBe(removed);
      // Check for events
      expect(eventFn).toBeCalledTimes(1);
      expect(eventFnAll).toBeCalled();
    });

    test('Update device', () => {
      const event = jest.fn();
      em.on(obj.events.update, event);
      const model = obj.add({});
      const up = { name: 'Test' };
      const opts = { myopts: 1 };
      model.set(up, opts);
      expect(event).toBeCalledTimes(1);
      expect(event).toBeCalledWith(model, up, opts);
    });

    test('Select device', () => {
      const event = jest.fn();
      const eventAll = jest.fn();
      const model = obj.add({ id: 'dev-1' });
      const model2 = obj.add({ id: 'dev-2' });

      em.on(obj.events.select, event);
      em.on(obj.events.all, eventAll);
      // Select from the manager
      obj.select(model);
      expect(em.get('device')).toBe('dev-1');
      expect(obj.getSelected()).toBe(model);
      expect(event).toBeCalledTimes(1);
      expect(eventAll).toBeCalled();

      // Select from the manager with id
      obj.select('dev-2');
      expect(em.get('device')).toBe('dev-2');
      expect(obj.getSelected()).toBe(model2);
      expect(event).toBeCalledTimes(2);

      // Select from the editor
      em.set('device', 'dev-1');
      expect(obj.getSelected()).toBe(model);
      expect(event).toBeCalledTimes(3);
    });

    test('Render devices', () => {
      expect(obj.render()).toBeTruthy();
    });
  });
});
