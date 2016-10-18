var modulePath = './../../../test/specs/device_manager';

define([ 'DeviceManager',
        modulePath + '/view/DevicesView',
         ],
  function(DeviceManager, DevicesView) {

    describe('DeviceManager', function() {

      describe('Main', function() {

        var obj;
        var testNameDevice;
        var testWidthDevice;

        beforeEach(function () {
          testNameDevice = 'Tablet';
          testWidthDevice = '100px';
          obj = new DeviceManager().init();
        });

        afterEach(function () {
          delete obj;
        });

        it('Object exists', function() {
          obj.should.be.exist;
        });

        it('No device inside', function() {
          var coll = obj.getAll();
          coll.length.should.equal(0);
        });

        it('Add new device', function() {
          var model = obj.add(testNameDevice, testWidthDevice);
          obj.getAll().length.should.equal(1);
        });

        it('Added device has correct data', function() {
          var model = obj.add(testNameDevice, testWidthDevice);
          model.get('name').should.equal(testNameDevice);
          model.get('width').should.equal(testWidthDevice);
        });

        it('Add device width options', function() {
          var model = obj.add(testNameDevice, testWidthDevice, {opt: 'value'});
          model.get('opt').should.equal('value');
        });

        it('The name of the device is unique', function() {
          var model = obj.add(testNameDevice, testWidthDevice);
          var model2 = obj.add(testNameDevice, '2px');
          model.should.deep.equal(model2);
        });

        it('Get device by name', function() {
          var model = obj.add(testNameDevice, testWidthDevice);
          var model2 = obj.get(testNameDevice);
          model.should.deep.equal(model2);
        });

        it('Render devices', function() {
          obj.render().should.be.ok;
        });

      });

      DevicesView.run();

    });
});