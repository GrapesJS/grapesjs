var modulePath = './../../../test/specs/style_manager';

define([
        'StyleManager'
         ],
  function(
          StyleManager
          ) {

    describe('StyleManager', function() {

      describe('Main', function() {

        var obj;

        beforeEach(function () {
          obj = new StyleManager();
        });

        afterEach(function () {
          delete obj;
        });

        it('Object exists', function() {
          obj.should.be.ok;
        });

        it('No sectors', function() {
          obj.getSectors().length.should.equal(0);
        });

        it('Add sector', function() {
          obj.addSector('test', {
            name: 'Test name'
          });
          obj.getSectors().length.should.equal(1);
          var sector = obj.getSectors().at(0);
          sector.get('id').should.equal('test');
          sector.get('name').should.equal('Test name');
        });

         it('Add sectors', function() {
          obj.addSector('test', {});
          obj.addSector('test2', {});
          obj.getSectors().length.should.equal(2);
         });

        it("Can't create more than one sector with the same id", function() {
          var sect1 = obj.addSector('test', {});
          var sect2 = obj.addSector('test', {});
          obj.getSectors().length.should.equal(1);
          sect1.should.deep.equal(sect2);
        });

        it('Get inexistent sector', function() {
          (obj.getSector('test') == null).should.equal(true);
        });

        it('Get sector', function() {
          var sect1 = obj.addSector('test', { name: 'Test' });
          var sect2 = obj.getSector('test');
          sect1.should.deep.equal(sect2);
        });

      });

    });
});