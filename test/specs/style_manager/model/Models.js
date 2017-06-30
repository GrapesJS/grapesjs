const Sector = require('style_manager/model/Sector');
const Sectors = require('style_manager/model/Sectors');
const Property = require('style_manager/model/Property');
const Properties = require('style_manager/model/Properties');
const Layer = require('style_manager/model/Layer');
const Layers = require('style_manager/model/Layers');
const PropertyFactory = require('style_manager/model/PropertyFactory');

module.exports = {
  run() {

    describe('Sector', () => {

      var obj;
      var confToExt;

      beforeEach(() => {
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

      afterEach(() => {
        obj = null;
      });

      it('Has id property', () => {
        expect(obj.has('id')).toEqual(true);
      });

      it('Has no properties', () => {
        expect(obj.get('properties').length).toEqual(0);
      });

      it('Init with properties', () => {
        obj = new Sector({
          properties: [{}, {}]
        });
        expect(obj.get('properties').length).toEqual(2);
      });

      it('Build properties', () => {
        var res = obj.buildProperties(['display', 'float']);
        expect(res.length).toEqual(2);
        expect(res[0]).toEqual({
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

      it('Extend properties', () => {
        obj = new Sector(confToExt);
        expect(obj.get('properties').length).toEqual(3);
        var prop0 = obj.get('properties').at(0);
        expect(prop0.get('type')).toEqual('radio');
        expect(prop0.get('defaults')).toEqual('block');
      });

      it('Do not extend properties', () => {
        confToExt.extendBuilded = 0;
        obj = new Sector(confToExt);
        expect(obj.get('properties').length).toEqual(3);
        var prop0 = obj.get('properties').at(0);
        expect(prop0.get('type')).toEqual('radio');
        expect(prop0.get('defaults')).toEqual('');
      });

      it('Extend composed properties', () => {
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
        expect(sectProps.length).toEqual(2);
        var prop0 = obj.get('properties').at(0);
        var propProps = prop0.get('properties');

        expect(propProps.length).toEqual(2);
        var propTop = propProps.at(0);
        expect(propTop.get('name')).toEqual('Top');
        expect(propTop.get('type')).toEqual('integer');
      });

    });

    describe('Sectors', () => {

      var obj;

      beforeEach(() => {
        obj = new Sectors();
      });

      afterEach(() => {
        obj = null;
      });

      it('Object exists', () => {
        expect(obj).toExist();
      });

    });

    describe('Property', () => {

      var obj;

      beforeEach(() => {
        obj = new Property();
      });

      afterEach(() => {
        obj = null;
      });

      it('Has property field', () => {
        expect(obj.has('property')).toEqual(true);
      });

      it('Has no properties', () => {
        expect(obj.get('properties').length).toEqual(0);
      });

      it('Has no layers', () => {
        expect(obj.get('layers').length).toEqual(0);
      });

    });

    describe('Properties', () => {

      var obj;

      beforeEach(() => {
        obj = new Properties();
      });

      afterEach(() => {
        obj = null;
      });

      it('Object exists', () => {
        expect(obj).toExist();
      });

    });

    describe('Layer', () => {

      var obj;

      beforeEach(() => {
        obj = new Layer();
      });

      afterEach(() => {
        obj = null;
      });

      it('Has index property', () => {
        expect(obj.has('index')).toEqual(true);
      });

      it('Is active', () => {
        expect(obj.get('active')).toEqual(true);
      });

    });

    describe('Layers', () => {

      var obj;

      beforeEach(() => {
        obj = new Layers();
      });

      afterEach(() => {
        obj = null;
      });

      it('Object exists', () => {
        expect(obj).toExist();
      });

      it('Init index on add', () => {
        var model = obj.add({});
        expect(model.get('index')).toEqual(1);
      });

      it('Increment index', () => {
        var model = obj.add({});
        var model2 = obj.add({});
        expect(model2.get('index')).toEqual(2);
      });

      it('Cache index', () => {
        var model = obj.add({});
        var model2 = obj.add({});
        obj.remove(model2);
        var model3 = obj.add({});
        expect(model3.get('index')).toEqual(3);
      });

      it('Reset index on reset', () => {
        var model = obj.add({});
        var model2 = obj.add({});
        obj.reset();
        expect(obj.idx).toEqual(1);
      });

    });

    describe('PropertyFactory', () => {

      var obj;

      beforeEach(() => {
        obj = new PropertyFactory();
      });

      afterEach(() => {
        obj = null;
      });

      it('Object exists', () => {
        expect(obj).toExist();
      });

      it('Build single prop', () => {
        expect(obj.build('float')).toEqual([{
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

      it('Build display', () => {
        expect(obj.build('display')).toEqual([{
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

      it('Build position', () => {
        expect(obj.build('position')).toEqual([{
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

      it('Build top, left, right, bottom', () => {
        var res = {
          type: 'integer',
          units: ['px','%'],
          defaults : 0,
        }
        res.property = 'top';
        expect(obj.build('top')).toEqual([res]);
        res.property = 'right';
        expect(obj.build('right')).toEqual([res]);
        res.property = 'bottom';
        expect(obj.build('bottom')).toEqual([res]);
        res.property = 'left';
        expect(obj.build('left')).toEqual([res]);
      });

      it('Build width and height family', () => {
        var res = {
          type: 'integer',
          units: ['px','%'],
          defaults: 'auto',
          fixedValues: ['initial', 'inherit', 'auto'],
          min: 0,
        }
        res.property = 'width';
        expect(obj.build('width')).toEqual([res]);
        res.property = 'height';
        expect(obj.build('height')).toEqual([res]);
        res.property = 'min-height';
        expect(obj.build('min-height')).toEqual([res]);
        res.property = 'max-height';
        expect(obj.build('max-height')).toEqual([res]);
        res.property = 'min-width';
        expect(obj.build('min-width')).toEqual([res]);
        res.property = 'max-width';
        expect(obj.build('max-width')).toEqual([res]);
      });

      it('Build margin', () => {
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
        expect(obj.build('margin')).toEqual([res]);
      });

      it('Build padding', () => {
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
        expect(obj.build('padding')).toEqual([res]);
      });

      it('Build font-family', () => {
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
        expect(obj.build('font-family')).toEqual([res]);
      });

      it('Build font-size', () => {
        var res = {
          type: 'integer',
          units: ['px','em', 'rem', '%'],
          defaults: 'medium',
          min: 0,
          fixedValues: [
            "medium",
            "xx-small",
            "x-small",
            "small",
            "large",
            "x-large",
            "xx-large",
            "smaller",
            "larger",
            "length",
            "initial",
            "inherit"
          ]
        };
        res.property = 'font-size';
        expect(obj.build('font-size')).toEqual([res]);
      });

      it('Build letter-spacing', () => {
        var res = {
          type: 'integer',
          units: ['px','em', 'rem', '%'],
          defaults: 'normal',
          fixedValues: [
            "normal",
            "initial",
            "inherit"
          ]
        };
        res.property = 'letter-spacing';
        expect(obj.build('letter-spacing')).toEqual([res]);
      });

      it('Build font-weight', () => {
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
        expect(obj.build('font-weight')).toEqual([res]);
      });

      it('Build color', () => {
        var res = {
          property: 'color',
          type: 'color',
          defaults: 'black',
        };
        expect(obj.build('color')).toEqual([res]);
      });

      it('Build line-height', () => {
        var res = {
          type: 'integer',
          units: ['px','em', 'rem', '%'],
          defaults: 'normal',
          fixedValues: [
            "normal",
            "initial",
            "inherit"
          ]
        };
        res.property = 'line-height';
        expect(obj.build('line-height')).toEqual([res]);
      });

      it('Build text-align', () => {
        var res = {
          type: 'radio',
          defaults: 'left',
          list: [{ value : 'left'},
                 { value : 'center'},
                 { value : 'right'},
                 { value : 'justify'}],
        };
        res.property = 'text-align';
        expect(obj.build('text-align')).toEqual([res]);
      });

      it('Build text-shadow', () => {
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
        expect(obj.build('text-shadow')).toEqual([res]);
      });

      it('Build border-radius-c', () => {
        var res = {
          type: 'integer',
          units: ['px', '%'],
          defaults: 0,
          min: 0,
        };
        res.property = 'border-radius';
        expect(obj.build('border-radius-c')).toEqual([res]);
      });

      it('Build border-radius', () => {
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
        expect(obj.build('border-radius')).toEqual([res]);
      });

      it('Build background-color', () => {
        var res = {
          type : 'color',
          defaults: 'none'
        };
        res.property = 'background-color';
        expect(obj.build('background-color')).toEqual([res]);
      });

      it('Build border', () => {
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
        expect(obj.build('border')).toEqual([res]);
      });

      it('Build box-shadow', () => {
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
        expect(obj.build('box-shadow')).toEqual([res]);
      });

      it('Build background', () => {
        var res = {
          property: 'background',
          type: 'stack',
          preview: true,
          detached: true,
          properties  : [{
                  property: 'background-image',
                  type: 'file',
                  functionName: 'url',
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
        expect(obj.build('background')).toEqual([res]);
      });

      it('Build transition', () => {
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
        expect(obj.build('transition')).toEqual([res]);
      });

      it('Build perspective', () => {
        var res = {
          property: 'perspective',
          type: 'integer',
          units: ['px'],
          defaults : 0,
          min: 0,
        };
        expect(obj.build('perspective')).toEqual([res]);
      });

      it('Build transform', () => {
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
        expect(obj.build('transform')).toEqual([res]);
      });

      it('Build cursor', () => {
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
        expect(obj.build('cursor')).toEqual([res]);
      });

      it('Build overflow', () => {
        var res = {
          type: 'select',
          property: 'overflow',
          defaults: 'visible',
          list: [{ value : 'visible'},
                 { value : 'hidden'},
                 { value : 'scroll'},
                 { value : 'auto'}],
        };
        expect(obj.build('overflow')).toEqual([res]);
      });

    });

  }
};
