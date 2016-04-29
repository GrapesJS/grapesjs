var path = 'StyleManager/model/';
define([path + 'Sector',
        path + 'Sectors',
        path + 'Property',
        path + 'Properties',
        path + 'Layer',
        path + 'Layers'],
  function(Sector,
          Sectors,
          Property,
          Properties,
          Layer,
          Layers) {

    return {
      run : function(){

        describe('Sector', function() {

          var obj;

          beforeEach(function () {
            obj = new Sector();
          });

          afterEach(function () {
            delete obj;
          });

          it('Has id property', function() {
            obj.has('id').should.equal(true);
          });

          it('Has no properties', function() {
            obj.get('properties').length.should.equal(0);
          });

          it('Init with properties', function() {
            obj = new Sector({
              properties: [{}, {}]
            });
            obj.get('properties').length.should.equal(2);
          });

        });

        describe('Sectors', function() {

          var obj;

          beforeEach(function () {
            obj = new Sectors();
          });

          afterEach(function () {
            delete obj;
          });

          it('Object exists', function() {
            obj.should.be.ok;
          });

        });

        describe('Property', function() {

          var obj;

          beforeEach(function () {
            obj = new Property();
          });

          afterEach(function () {
            delete obj;
          });

          it('Has property field', function() {
            obj.has('property').should.equal(true);
          });

          it('Has no properties', function() {
            obj.get('properties').length.should.equal(0);
          });

          it('Has no layers', function() {
            obj.get('layers').length.should.equal(0);
          });

        });

        describe('Properties', function() {

          var obj;

          beforeEach(function () {
            obj = new Properties();
          });

          afterEach(function () {
            delete obj;
          });

          it('Object exists', function() {
            obj.should.be.ok;
          });

        });

        describe('Layer', function() {

          var obj;

          beforeEach(function () {
            obj = new Layer();
          });

          afterEach(function () {
            delete obj;
          });

          it('Has name property', function() {
            obj.has('name').should.equal(true);
          });

          it('Is active', function() {
            obj.get('active').should.equal(true);
          });

        });

        describe('Layers', function() {

          var obj;

          beforeEach(function () {
            obj = new Layers();
          });

          afterEach(function () {
            delete obj;
          });

          it('Object exists', function() {
            obj.should.be.ok;
          });

        });

      }
    };

});