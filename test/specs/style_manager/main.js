var modulePath = './../../../test/specs/style_manager';

define([
        'StyleManager',
        modulePath + '/model/Models',
        modulePath + '/view/SectorView',
        modulePath + '/view/SectorsView',
        modulePath + '/view/PropertyView',
        modulePath + '/view/PropertySelectView',
        modulePath + '/view/PropertyRadioView',
        modulePath + '/view/PropertyIntegerView',
        modulePath + '/view/PropertyColorView',
        modulePath + '/view/PropertyCompositeView',
        modulePath + '/view/PropertyStackView',
        modulePath + '/view/LayerView',
         ],
  function(
          StyleManager,
          Models,
          SectorView,
          SectorsView,
          PropertyView,
          PropertySelectView,
          PropertyRadioView,
          PropertyIntegerView,
          PropertyColorView,
          PropertyCompositeView,
          PropertyStackView,
          LayerView
          ) {

    describe('StyleManager', function() {

      describe('Main', function() {

        var obj;

        beforeEach(function () {
          obj = new StyleManager().init({
            sectors: []
          });
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

        it('Add property to inexistent sector', function() {
          (obj.addProperty('test', {}) == null).should.equal(true);
        });

        it('Add property', function() {
          obj.addSector('test', {});
          (obj.addProperty('test', {}) == null).should.equal(false);
          obj.getProperties('test').length.should.equal(1);
        });

        it('Check added property', function() {
          obj.addSector('test', {});
          var prop = obj.addProperty('test', {
            'name': 'test',
          });
          prop.get('name').should.equal('test');
        });

        it('Add properties', function() {
          obj.addSector('test', {});
          obj.addProperty('test', [{}, {}]);
          obj.getProperties('test').length.should.equal(2);
        });

        it('Get property from inexistent sector', function() {
          (obj.getProperty('test', 'test-prop') == null).should.equal(true);
        });

        it("Can't get properties without proper name", function() {
          obj.addSector('test', {});
          obj.addProperty('test', [{}, {}]);
          obj.getProperty('test', 'test-prop').should.be.empty;
        });

        it("Get property with proper name", function() {
          obj.addSector('test', {});
          var prop1 = obj.addProperty('test', {property: 'test-prop'});
          var prop2 = obj.getProperty('test', 'test-prop');
          prop1.should.deep.equal(prop2);
        });

        it("Get properties with proper name", function() {
          obj.addSector('test', {});
          var prop1 = obj.addProperty('test',[
            {property: 'test-prop'},
            {property: 'test-prop'}
          ]);
          obj.getProperty('test', 'test-prop').length.should.equal(2);
        });

        it('Get inexistent properties', function() {
          (obj.getProperties('test') == null).should.equal(true);
          (obj.getProperties() == null).should.equal(true);
        });

        it('Renders correctly', function() {
          obj.render().should.be.ok;
        });

        describe('Init with configuration', function() {

          beforeEach(function () {
            obj = new StyleManager().init({
              sectors: [{
                id: 'dim',
                name: 'Dimension',
                properties: [{
                  name: 'Width',
                  property: 'width',
                },{
                  name: 'Height',
                  property: 'height',
                }],
              },{
                id: 'pos',
                name: 'position',
                properties: [{
                  name: 'Width',
                  property: 'width',
                }],
              }],
            });
          });

          afterEach(function () {
            delete obj;
          });

          it('Sectors added', function() {
            obj.getSectors().length.should.equal(2);
            var sect1 = obj.getSector('dim');
            sect1.get('name').should.equal('Dimension');
          });

          it('Properties added', function() {
            var sect1 = obj.getSector('dim');
            var sect2 = obj.getSector('pos');
            sect1.get('properties').length.should.equal(2);
            sect2.get('properties').length.should.equal(1);
          });

          it('Property is correct', function() {
            var prop1 = obj.getProperty('dim', 'width');
            prop1.get('name').should.equal('Width');
          });

        });

        Models.run();
        SectorView.run();
        SectorsView.run();
        PropertyView.run();
        PropertySelectView.run();
        PropertyRadioView.run();
        PropertyIntegerView.run();
        PropertyColorView.run();
        PropertyCompositeView.run();
        PropertyStackView.run();
        LayerView.run();
      });

    });
});