var path = 'StyleManager/model/';
define([path + 'Sector',
        path + 'Sectors',
        path + 'PropertyFactory',
        path + 'Property',
        path + 'Properties',
        path + 'Layer',
        path + 'Layers'],
  function(Sector,
          Sectors,
          PropertyFactory,
          Property,
          Properties,
          Layer,
          Layers) {

    return {
      run : function(){

        describe('Sector', function() {

          var obj;
          var confToExt;

          beforeEach(function () {
            confToExt = {
              buildProps: ['display', 'float'],
              properties: [{
                property: 'display',
                type: 'radio',
              },{
                property: 'color',
                type: 'color',
              }]
            };
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

          it('Build properties', function() {
            var res = obj.buildProperties(['display', 'float']);
            res.length.should.equal(2);
            res[0].should.deep.equal({
              property: 'display',
              type: 'select',
              defaults: 'block',
              list: [
                {value: 'block'},
                {value: 'inline'},
                {value: 'inline-block'},
                {value: 'none'},
              ],
            });
          });

          it('Extend properties', function() {
            obj = new Sector(confToExt);
            obj.get('properties').length.should.equal(3);
            var prop0 = obj.get('properties').at(0);
            prop0.get('type').should.equal('radio');
            prop0.get('defaults').should.equal('block');
          });

          it('Do not extend properties', function() {
            confToExt.extendBuilded = 0;
            obj = new Sector(confToExt);
            obj.get('properties').length.should.equal(3);
            var prop0 = obj.get('properties').at(0);
            prop0.get('type').should.equal('radio');
            prop0.get('defaults').should.equal('');
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

          it('Has index property', function() {
            obj.has('index').should.equal(true);
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

          it('Init index on add', function() {
            var model = obj.add({});
            model.get('index').should.equal(1);
          });

          it('Increment index', function() {
            var model = obj.add({});
            var model2 = obj.add({});
            model2.get('index').should.equal(2);
          });

          it('Cache index', function() {
            var model = obj.add({});
            var model2 = obj.add({});
            obj.remove(model2);
            var model3 = obj.add({});
            model3.get('index').should.equal(3);
          });

          it('Reset index on reset', function() {
            var model = obj.add({});
            var model2 = obj.add({});
            obj.reset();
            obj.idx.should.equal(1);
          });

        });

        describe('PropertyFactory', function() {

          var obj;

          beforeEach(function () {
            obj = new PropertyFactory();
          });

          afterEach(function () {
            delete obj;
          });

          it('Object exists', function() {
            obj.should.be.ok;
          });

          it('Build single prop', function() {
            obj.build('float').should.deep.equal([{
              property: 'float',
              type: 'radio',
              defaults: 'none',
              list: [
                {value: 'none'},
                {value: 'left'},
                {value: 'right'},
              ],
            }]);
          });

          it('Build display', function() {
            obj.build('display').should.deep.equal([{
              property: 'display',
              type: 'select',
              defaults: 'block',
              list: [
                {value: 'block'},
                {value: 'inline'},
                {value: 'inline-block'},
                {value: 'none'},
              ],
            }]);
          });

          it('Build position', function() {
            obj.build('position').should.deep.equal([{
              property: 'position',
              type: 'radio',
              defaults: 'static',
              list: [
                {value: 'static'},
                {value: 'relative'},
                {value: 'absolute'},
                {value: 'fixed'},
              ],
            }]);
          });

          it('Build top, left, right, bottom', function() {
            var res = {
              type: 'integer',
              units: ['px','%'],
              defaults : 0,
            }
            res.property = 'top';
            obj.build('top').should.deep.equal([res]);
            res.property = 'right';
            obj.build('right').should.deep.equal([res]);
            res.property = 'bottom';
            obj.build('bottom').should.deep.equal([res]);
            res.property = 'left';
            obj.build('left').should.deep.equal([res]);
          });

          it('Build width e height family', function() {
            var res = {
              type: 'integer',
              units: ['px','%'],
              defaults: 'auto',
              min: 0,
            }
            res.property = 'width';
            obj.build('width').should.deep.equal([res]);
            res.property = 'height';
            obj.build('height').should.deep.equal([res]);
            res.property = 'min-height';
            obj.build('min-height').should.deep.equal([res]);
            res.property = 'max-height';
            obj.build('max-height').should.deep.equal([res]);
            res.property = 'min-width';
            obj.build('min-width').should.deep.equal([res]);
            res.property = 'max-width';
            obj.build('max-width').should.deep.equal([res]);
          });

          it('Build margin', function() {
            var res = {
              property: 'margin',
              type: 'composite',
              properties:[{
                      property  : 'margin-top',
                      type    : 'integer',
                      units   : ['px','%'],
                      defaults  : 0,
                    },{
                      property  : 'margin-right',
                      type    : 'integer',
                      units   : ['px','%'],
                      defaults  : 0,
                    },{
                      property  : 'margin-bottom',
                      type    : 'integer',
                      units   : ['px','%'],
                      defaults  : 0,
                    },{
                      property  : 'margin-left',
                      type    : 'integer',
                      units   : ['px','%'],
                      defaults  : 0,
                    },],
            };
            obj.build('margin').should.deep.equal([res]);
          });

          it('Build padding', function() {
            var res = {
              property: 'padding',
              type: 'composite',
              properties:[{
                      property  : 'padding-top',
                      type    : 'integer',
                      units   : ['px','%'],
                      defaults  : 0,
                    },{
                      property  : 'padding-right',
                      type    : 'integer',
                      units   : ['px','%'],
                      defaults  : 0,
                    },{
                      property  : 'padding-bottom',
                      type    : 'integer',
                      units   : ['px','%'],
                      defaults  : 0,
                    },{
                      property  : 'padding-left',
                      type    : 'integer',
                      units   : ['px','%'],
                      defaults  : 0,
                    },],
            };
            obj.build('padding').should.deep.equal([res]);
          });

        });

      }
    };

});