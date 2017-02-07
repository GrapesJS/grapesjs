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

          it('Extend composed properties', function() {
            obj = new Sector({
              buildProps: ['margin', 'float'],
              properties: [{
                property: 'margin',
                properties:[{
                  name: 'Top',
                  property: 'margin-top',
                },{
                  property: 'margin-right',
                }]
              }]
            });
            var sectProps = obj.get('properties');
            sectProps.length.should.equal(2);
            var prop0 = obj.get('properties').at(0);
            var propProps = prop0.get('properties');

            propProps.length.should.equal(2);
            var propTop = propProps.at(0);
            propTop.get('name').should.equal('Top');
            propTop.get('type').should.equal('integer');
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

          it('Build width and height family', function() {
            var res = {
              type: 'integer',
              units: ['px','%'],
              defaults: 'auto',
              fixedValues: ['initial', 'inherit', 'auto'],
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
                      fixedValues: ['initial', 'inherit', 'auto'],
                      property  : 'margin-top',
                      type    : 'integer',
                      units   : ['px','%'],
                      defaults  : 0
                    },{
                      fixedValues: ['initial', 'inherit', 'auto'],
                      property  : 'margin-right',
                      type    : 'integer',
                      units   : ['px','%'],
                      defaults  : 0,
                    },{
                      fixedValues: ['initial', 'inherit', 'auto'],
                      property  : 'margin-bottom',
                      type    : 'integer',
                      units   : ['px','%'],
                      defaults  : 0,
                    },{
                      fixedValues: ['initial', 'inherit', 'auto'],
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
                      fixedValues: ['initial', 'inherit', 'auto'],
                      type    : 'integer',
                      units   : ['px','%'],
                      defaults  : 0,
                    },{
                      property  : 'padding-right',
                      fixedValues: ['initial', 'inherit', 'auto'],
                      type    : 'integer',
                      units   : ['px','%'],
                      defaults  : 0,
                    },{
                      property  : 'padding-bottom',
                      fixedValues: ['initial', 'inherit', 'auto'],
                      type    : 'integer',
                      units   : ['px','%'],
                      defaults  : 0,
                    },{
                      property  : 'padding-left',
                      fixedValues: ['initial', 'inherit', 'auto'],
                      type    : 'integer',
                      units   : ['px','%'],
                      defaults  : 0,
                    },],
            };
            obj.build('padding').should.deep.equal([res]);
          });

          it('Build font-family', function() {
            var ss = ', sans-serif';
            var ms = ', monospace';
            var ff = 'font-family: ';
            var sty = '; font-size:15px';
            var res = {
              property: 'font-family',
              type: 'select',
              defaults: 'Arial, Helvetica' + ss,
              list:[
                {name: 'Arial', value: 'Arial, Helvetica' + ss, style: ff + 'Arial, Helvetica' + ss + sty},
                {name: 'Arial Black', value: 'Arial Black, Gadget' + ss,  style: ff + 'Arial Black, Gadget' + ss + sty},
                {name: 'Brush Script MT', value: 'Brush Script MT' + ss,  style: ff + 'Brush Script MT' + ss + sty},
                {name: 'Comic Sans MS', value: 'Comic Sans MS, cursive' + ss,  style: ff + 'Comic Sans MS, cursive' + ss + sty},
                {name: 'Courier New', value: 'Courier New, Courier' + ms,  style: ff + 'Courier New, Courier' + ms + sty},
                {name: 'Georgia', value: 'Georgia, serif',  style: ff + 'Georgia, serif' + sty},
                {name: 'Helvetica', value: 'Helvetica, serif',  style: ff + 'Helvetica, serif' + sty},
                {name: 'Impact', value: 'Impact, Charcoal' + ss,  style: ff + 'Impact, Charcoal' + ss + sty},
                {name: 'Lucida Sans Unicode', value: 'Lucida Sans Unicode, Lucida Grande' + ss,  style: ff + 'Lucida Sans Unicode, Lucida Grande' + ss + sty},
                {name: 'Tahoma', value: 'Tahoma, Geneva' + ss,  style: ff + 'Tahoma, Geneva' + ss + sty},
                {name: 'Times New Roman', value: 'Times New Roman, Times, serif',  style: ff + 'Times New Roman, Times, serif' + sty},
                {name: 'Trebuchet MS', value: 'Trebuchet MS, Helvetica' + ss,  style: ff + 'Trebuchet MS, Helvetica' + ss + sty},
                {name: 'Verdana', value: 'Verdana, Geneva' + ss,  style: ff + 'Verdana, Geneva' + ss + sty},
              ],
            };
            obj.build('font-family').should.deep.equal([res]);
          });

          it('Build font-size', function() {
            var res = {
              type: 'integer',
              units: ['px','em', 'rem', '%'],
              defaults: 'medium',
              min: 0,
            };
            res.property = 'font-size';
            obj.build('font-size').should.deep.equal([res]);
          });

          it('Build letter-spacing', function() {
            var res = {
              type: 'integer',
              units: ['px','em', 'rem', '%'],
              defaults: 'normal',
            };
            res.property = 'letter-spacing';
            obj.build('letter-spacing').should.deep.equal([res]);
          });

          it('Build font-weight', function() {
            var res = {
              type: 'select',
              defaults: '400',
              list:   [{ value : '100', name : 'Thin', },
                       { value : '200', name : 'Extra-Light', },
                       { value : '300', name : 'Light', },
                       { value : '400', name : 'Normal', },
                       { value : '500', name : 'Medium',},
                       { value : '600', name : 'Semi-Bold',},
                       { value : '700', name : 'Bold', },
                       { value : '800', name : 'Extra-Bold',},
                       { value : '900', name : 'Ultra-Bold', }],
            };
            res.property = 'font-weight';
            obj.build('font-weight').should.deep.equal([res]);
          });

          it('Build color', function() {
            var res = {
              property: 'color',
              type: 'color',
              defaults: 'black',
            };
            obj.build('color').should.deep.equal([res]);
          });

          it('Build line-height', function() {
            var res = {
              type: 'integer',
              units: ['px','em', 'rem', '%'],
              defaults: 'normal',
            };
            res.property = 'line-height';
            obj.build('line-height').should.deep.equal([res]);
          });

          it('Build text-align', function() {
            var res = {
              type: 'radio',
              defaults: 'left',
              list: [{ value : 'left'},
                     { value : 'center'},
                     { value : 'right'},
                     { value : 'justify'}],
            };
            res.property = 'text-align';
            obj.build('text-align').should.deep.equal([res]);
          });

          it('Build text-shadow', function() {
            var res = {
              type: 'stack',
              preview: true,
              properties  : [{
                      property: 'text-shadow-h',
                      type:     'integer',
                      units:    ['px','%'],
                      defaults :  0,
                    },{
                      property:   'text-shadow-v',
                      type:     'integer',
                      units:    ['px','%'],
                      defaults :  0,
                    },{
                      property:   'text-shadow-blur',
                      type:     'integer',
                      units:    ['px','%'],
                      defaults :  0,
                      min: 0,
                    },{
                      property: 'text-shadow-color',
                      type: 'color',
                      defaults: 'black',
                    },],
            };
            res.property = 'text-shadow';
            obj.build('text-shadow').should.deep.equal([res]);
          });

          it('Build border-radius-c', function() {
            var res = {
              type: 'integer',
              units: ['px', '%'],
              defaults: 0,
              min: 0,
            };
            res.property = 'border-radius';
            obj.build('border-radius-c').should.deep.equal([res]);
          });

          it('Build border-radius', function() {
            var res = {
              property: 'border-radius',
              type: 'composite',
              properties: [{
                      property : 'border-top-left-radius',
                      type: 'integer',
                      units: ['px','%'],
                      defaults: 0,
                      min: 0,
                    },{
                      property: 'border-top-right-radius',
                      type: 'integer',
                      units: ['px','%'],
                      min : 0,
                      defaults: 0,
                    },{
                      property: 'border-bottom-left-radius',
                      type: 'integer',
                      units: ['px','%'],
                      min: 0,
                      defaults: 0,
                    },{
                      property: 'border-bottom-right-radius',
                      type: 'integer',
                      units: ['px','%'],
                      min: 0,
                      defaults : 0,
                    },],
            };
            res.property = 'border-radius';
            obj.build('border-radius').should.deep.equal([res]);
          });

          it('Build background-color', function() {
            var res = {
              type : 'color',
              defaults: 'none'
            };
            res.property = 'background-color';
            obj.build('background-color').should.deep.equal([res]);
          });

          it('Build border', function() {
            var res = {
              property: 'border',
              type: 'composite',
              properties  : [{
                      property: 'border-width',
                      type: 'integer',
                      units: ['px','em'],
                      defaults: 'medium',
                      min: 0,
                    },{
                      property: 'border-style',
                      type : 'select',
                      defaults: 'solid',
                      list:   [{ value : 'none'},
                               { value : 'solid'},
                               { value : 'dotted'},
                               { value : 'dashed'},
                               { value : 'double'},
                               { value : 'groove'},
                               { value : 'ridge'},
                               { value : 'inset'},
                               { value : 'outset'},],
                    },{
                      property: 'border-color',
                      type: 'color',
                      defaults: 'black',
                    }],
            };
            obj.build('border').should.deep.equal([res]);
          });

          it('Build box-shadow', function() {
            var res = {
              property: 'box-shadow',
              type: 'stack',
              preview: true,
              properties: [{
                      property: 'box-shadow-h',
                      type: 'integer',
                      units: ['px','%'],
                      defaults: 0,
                    },{
                      property: 'box-shadow-v',
                      type: 'integer',
                      units: ['px','%'],
                      defaults: 0,
                    },{
                      property: 'box-shadow-blur',
                      type: 'integer',
                      units: ['px'],
                      defaults: 5,
                      min: 0,
                    },{
                      property: 'box-shadow-spread',
                      type: 'integer',
                      units: ['px'],
                      defaults: 0,
                    },{
                      property: 'box-shadow-color',
                      type: 'color',
                      defaults: 'black',
                    },{
                      property: 'box-shadow-type',
                      type: 'select',
                      defaults: '',
                      list:   [{value : '', name: 'Outside' },
                              {value : 'inset', name: 'Inside' }],
                    }],
            };
            obj.build('box-shadow').should.deep.equal([res]);
          });

          it('Build background', function() {
            var res = {
              property: 'background',
              type: 'stack',
              preview: true,
              detached: true,
              properties  : [{
                      property: 'background-image',
                      type: 'file',
                      defaults: 'none',
                    },{
                      property: 'background-repeat',
                      type: 'select',
                      defaults: 'repeat',
                      list:   [{ value : 'repeat'},
                               { value : 'repeat-x'},
                               { value : 'repeat-y'},
                               { value : 'no-repeat'}],
                    },{
                      property: 'background-position',
                      type: 'select',
                      defaults: 'left top',
                      list:   [ { value : 'left top',},
                                { value : 'left center',},
                                { value : 'left bottom',},
                                { value : 'right top',},
                                { value : 'right center'},
                                { value : 'right bottom'},
                                { value : 'center top'},
                                { value : 'center center'},
                                { value : 'center bottom'}
                              ]

                    },{
                      property: 'background-attachment',
                      type: 'select',
                      defaults: 'scroll',
                      list:   [{ value : 'scroll'},
                               { value : 'fixed'},
                               { value : 'local'}],
                    },{
                      property: 'background-size',
                      type: 'select',
                      defaults: 'auto',
                      list:   [{ value : 'auto'},
                               { value : 'cover'},
                               { value : 'contain'}],
                    }],
            };
            obj.build('background').should.deep.equal([res]);
          });

          it('Build transition', function() {
            var res = {
              property: 'transition',
              type: 'stack',
              properties:[{
                property: 'transition-property',
                type: 'select',
                defaults: 'width',
                list:   [{ value: 'all'},
                         { value: 'width'},
                         { value : 'height'},
                         { value : 'background-color'},
                         { value : 'transform'},
                         { value : 'box-shadow'},
                         { value : 'opacity'}],
                },{
                  property: 'transition-duration',
                  type: 'integer',
                  units: ['s'],
                  defaults: '2',
                  min: 0,
                },{
                  property: 'transition-timing-function',
                  type: 'select',
                  defaults: 'ease',
                  list:   [{ value : 'linear'},
                           { value : 'ease'},
                           { value : 'ease-in'},
                           { value : 'ease-out'},
                           { value : 'ease-in-out'}],
                }],
            };
            obj.build('transition').should.deep.equal([res]);
          });

          it('Build perspective', function() {
            var res = {
              property: 'perspective',
              type: 'integer',
              units: ['px'],
              defaults : 0,
              min: 0,
            };
            obj.build('perspective').should.deep.equal([res]);
          });

          it('Build transform', function() {
            var res = {
              property: 'transform',
              type: 'composite',
              properties:[{
                      property: 'transform-rotate-x',
                      type: 'integer',
                      units: ['deg'],
                      defaults : 0,
                      functionName: 'rotateX',
                    },{
                      property: 'transform-rotate-y',
                      type: 'integer',
                      units: ['deg'],
                      defaults : 0,
                      functionName: 'rotateY',
                    },{
                      property: 'transform-rotate-z',
                      type: 'integer',
                      units: ['deg'],
                      defaults : 0,
                      functionName: 'rotateZ',
                    },{
                      property: 'transform-scale-x',
                      type: 'integer',
                      defaults : 1,
                      functionName: 'scaleX',
                    },{
                      property: 'transform-scale-y',
                      type: 'integer',
                      defaults : 1,
                      functionName: 'scaleY',
                    },{
                      property: 'transform-scale-z',
                      type: 'integer',
                      defaults : 1,
                      functionName: 'scaleZ',
                    }],
            };
            obj.build('transform').should.deep.equal([res]);
          });

          it('Build cursor', function() {
            var res = {
              type: 'select',
              property: 'cursor',
              defaults: 'auto',
              list: [{ value : 'auto'},
                     { value : 'pointer'},
                     { value : 'copy'},
                     { value : 'crosshair'},
                     { value : 'grab'},
                     { value : 'grabbing'},
                     { value : 'help'},
                     { value : 'move'},
                     { value : 'text'}],
            };
            obj.build('cursor').should.deep.equal([res]);
          });

          it('Build overflow', function() {
            var res = {
              type: 'select',
              property: 'overflow',
              defaults: 'visible',
              list: [{ value : 'visible'},
                     { value : 'hidden'},
                     { value : 'scroll'},
                     { value : 'auto'}],
            };
            obj.build('overflow').should.deep.equal([res]);
          });

        });

      }
    };

});
