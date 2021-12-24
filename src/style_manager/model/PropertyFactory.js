import { isFunction, isString } from 'underscore';

const getOptions = items => items.map(item => ({ id: item }));

export default class PropertyFactory {
  constructor() {
    this.typeNumber = 'integer'; // TODO change
    this.typeColor = 'color';
    this.typeRadio = 'radio';
    this.typeSelect = 'select';
    this.typeFile = 'file';
    this.typeComposite = 'composite';
    this.typeStack = 'stack';
    this.unitsSize = ['px', '%', 'em', 'rem', 'vh', 'vw'];
    this.unitsSizeNoPerc = ['px', 'em', 'rem', 'vh', 'vw'];
    this.unitsTime = ['s', 'ms'];
    this.unitsAngle = ['deg', 'rad', 'grad'];
    this.fixedValues = ['initial', 'inherit', 'auto'];
    const ss = ', sans-serif';

    this.optsBgSize = getOptions(['auto', 'cover', 'contain']);
    this.optsBgAttach = getOptions(['scroll', 'fixed', 'local']);
    this.optsBgRepeat = getOptions(['repeat', 'repeat-x', 'repeat-y', 'no-repeat']);
    this.optsWrap = getOptions(['nowrap', 'wrap', 'wrap-reverse']);
    this.optsOverflow = getOptions(['visible', 'hidden', 'scroll', 'auto']);
    this.optsDir = getOptions(['row', 'row-reverse', 'column', 'column-reverse']);
    this.opstDisplay = getOptions(['block', 'inline', 'inline-block', 'flex', 'none']);
    this.optsTransitFn = getOptions(['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']);
    this.optsCursor = getOptions(['auto', 'pointer', 'copy', 'crosshair', 'grab', 'grabbing', 'help', 'move', 'text']);
    this.optsTransitProp = getOptions([
      'all',
      'width',
      'height',
      'background-color',
      'transform',
      'box-shadow',
      'opacity',
    ]);
    this.optsBorderStyle = getOptions([
      'none',
      'solid',
      'dotted',
      'dashed',
      'double',
      'groove',
      'ridge',
      'inset',
      'outset',
    ]);
    this.optsBgPos = getOptions([
      'left top',
      'left center',
      'left bottom',
      'right top',
      'right center',
      'right bottom',
      'center top',
      'center center',
      'center bottom',
    ]);
    this.optsWeight = [
      { id: '100', label: 'Thin' },
      { id: '200', label: 'Extra-Light' },
      { id: '300', label: 'Light' },
      { id: '400', label: 'Normal' },
      { id: '500', label: 'Medium' },
      { id: '600', label: 'Semi-Bold' },
      { id: '700', label: 'Bold' },
      { id: '800', label: 'Extra-Bold' },
      { id: '900', label: 'Ultra-Bold' },
    ];
    this.optsFonts = [
      'Arial, Helvetica' + ss,
      'Arial Black, Gadget' + ss,
      'Brush Script MT' + ss,
      'Comic Sans MS, cursive' + ss,
      'Courier New, Courier, monospace',
      'Georgia, serif',
      'Helvetica' + ss,
      'Impact, Charcoal' + ss,
      'Lucida Sans Unicode, Lucida Grande' + ss,
      'Tahoma, Geneva' + ss,
      'Times New Roman, Times, serif',
      'Trebuchet MS, Helvetica' + ss,
      'Verdana, Geneva' + ss,
    ].map(font => {
      return { id: font, label: font.split(',')[0] };
    });

    this.init();
  }

  __sub(items) {
    return () => items.map(p => this.get(p));
  }

  init() {
    this.props = {};
    const requireFlex = { display: ['flex'] };
    const optsFlex = [{ id: 'flex-start' }, { id: 'flex-end' }, { id: 'center' }];
    const optsFlexAlign = [...optsFlex, { id: 'baseline' }, { id: 'stretch' }];

    // Build default built-in properties (the order, in the array here below, matters)
    // [propertyName, propertyDefinition, extendFromProperty]
    [
      // Number types
      [
        'top',
        {
          type: this.typeNumber,
          default: 'auto',
          units: this.unitsSize,
          fixedValues: this.fixedValues,
        },
      ],
      ['right', {}, 'top'],
      ['bottom', {}, 'top'],
      ['left', {}, 'top'],
      ['margin-top', { default: '0' }, 'top'],
      ['margin-right', {}, 'margin-top'],
      ['margin-bottom', {}, 'margin-top'],
      ['margin-left', {}, 'margin-top'],
      ['padding-top', { min: 0 }, 'margin-top'],
      ['padding-right', {}, 'padding-top'],
      ['padding-bottom', {}, 'padding-top'],
      ['padding-left', {}, 'padding-top'],
      ['width', { min: 0 }, 'top'],
      ['min-width', {}, 'width'],
      ['max-width', {}, 'width'],
      ['height', {}, 'width'],
      ['min-height', {}, 'width'],
      ['max-height', {}, 'width'],
      ['flex-basis', { requiresParent: requireFlex }, 'width'],
      [
        'font-size',
        {
          defaults: 'medium',
          fixedValues: [
            'medium',
            'xx-small',
            'x-small',
            'small',
            'large',
            'x-large',
            'xx-large',
            'smaller',
            'larger',
            'length',
            'initial',
            'inherit',
          ],
        },
        'width',
      ],
      [
        'letter-spacing',
        {
          defaults: 'normal',
          fixedValues: ['normal', 'initial', 'inherit'],
        },
        'top',
      ],
      ['line-height', {}, 'letter-spacing'],
      [
        'float',
        {
          type: this.typeRadio,
          default: 'none',
          options: [{ id: 'none' }, { id: 'left' }, { id: 'right' }],
        },
      ],
      [
        'position',
        {
          default: 'static',
          options: [{ id: 'static' }, { id: 'relative' }, { id: 'absolute' }, { id: 'fixed' }], // TODO sticky
        },
        'float',
      ],
      [
        'text-align',
        {
          default: 'left',
          options: [{ id: 'left' }, { id: 'center' }, { id: 'right' }, { id: 'justify' }],
        },
        'float',
      ],
      ['text-shadow-h', { default: '0', units: this.unitsSizeNoPerc }, 'top'],
      ['text-shadow-v', {}, 'text-shadow-h'],
      ['text-shadow-blur', { min: 0 }, 'text-shadow-h'],
      ['border-radius-c', {}, 'padding-top'],
      ['border-top-left-radius', {}, 'padding-top'],
      ['border-top-right-radius', {}, 'padding-top'],
      ['border-bottom-left-radius', {}, 'padding-top'],
      ['border-bottom-right-radius', {}, 'padding-top'],
      ['border-width', { default: '0', units: this.unitsSizeNoPerc }, 'padding-top'],
      ['box-shadow-h', {}, 'text-shadow-h'],
      ['box-shadow-v', {}, 'text-shadow-h'],
      ['box-shadow-blur', { default: '5px' }, 'text-shadow-blur'],
      ['box-shadow-spread', {}, 'text-shadow-h'],
      ['transition-duration', { default: '2', units: this.unitsTime }, 'padding-top'],
      ['perspective', {}, 'padding-top'],
      ['transform-rotate-x', { functionName: 'rotateX', units: this.unitsAngle }, 'margin-top'],
      ['transform-rotate-y', { functionName: 'rotateY' }, 'transform-rotate-x'],
      ['transform-rotate-z', { functionName: 'rotateZ' }, 'transform-rotate-x'],
      ['transform-scale-x', { default: '1', functionName: 'scaleX', units: [] }, 'transform-rotate-x'],
      ['transform-scale-y', { functionName: 'scaleY' }, 'transform-scale-x'],
      ['transform-scale-z', { functionName: 'scaleZ' }, 'transform-scale-x'],
      ['order', { type: this.typeNumber, default: '0', requiresParent: requireFlex }],
      ['flex-grow', {}, 'order'],
      ['flex-shrink', { default: '1' }, 'order'],

      // Color types
      ['color', { type: this.typeColor, default: 'black' }],
      ['text-shadow-color', {}, 'color'],
      ['border-color', {}, 'color'],
      ['box-shadow-color', {}, 'color'],
      ['background-color', { default: 'none' }, 'color'],

      // File type
      ['background-image', { type: this.typeFile, functionName: 'url' }],

      // Select types
      [
        'display',
        {
          type: this.typeSelect,
          default: 'block',
          options: this.opstDisplay,
        },
      ],
      ['flex-direction', { default: 'row', options: this.optsDir, requires: requireFlex }, 'display'],
      ['flex-wrap', { default: 'nowrap', options: this.optsWrap }, 'flex-direction'],
      [
        'justify-content',
        {
          default: 'flex-start',
          options: [...optsFlex, { id: 'space-between' }, { id: 'space-around' }, { id: 'space-evenly' }],
        },
        'flex-wrap',
      ],
      ['align-items', { default: 'stretch', options: optsFlexAlign }, 'flex-wrap'],
      [
        'align-content',
        {
          options: [...optsFlex, { id: 'space-between' }, { id: 'space-around' }, { id: 'stretch' }],
        },
        'align-items',
      ],
      [
        'align-self',
        {
          default: 'auto',
          options: [{ id: 'auto' }, ...optsFlexAlign],
          requiresParent: requireFlex,
        },
        'align-items',
      ],
      ['font-family', { default: 'Arial, Helvetica, sans-serif', options: this.optsFonts }, 'display'],
      ['font-weight', { default: '400', options: this.optsWeight }, 'display'],
      ['border-style', { default: 'solid', options: this.optsBorderStyle }, 'display'],
      [
        'box-shadow-type',
        {
          default: '',
          options: [
            { id: '', label: 'Outside' },
            { id: 'inset', label: 'Inside' },
          ],
        },
        'display',
      ],
      ['background-repeat', { default: 'repeat', options: this.optsBgRepeat }, 'display'],
      ['background-position', { default: 'left top', options: this.optsBgPos }, 'display'],
      ['background-attachment', { default: 'scroll', options: this.optsBgAttach }, 'display'],
      ['background-size', { default: 'auto', options: this.optsBgSize }, 'display'],
      ['transition-property', { default: 'width', options: this.optsTransitProp }, 'display'],
      ['transition-timing-function', { default: 'ease', options: this.optsTransitFn }, 'display'],
      ['cursor', { default: 'auto', options: this.optsCursor }, 'display'],
      ['overflow', { default: 'visible', options: this.optsOverflow }, 'display'],
      ['overflow-x', {}, 'overflow'],
      ['overflow-y', {}, 'overflow'],

      // Composite types
      [
        'margin',
        {
          type: this.typeComposite,
          properties: this.__sub(['margin-top', 'margin-right', 'margin-bottom', 'margin-left']),
        },
      ],
      [
        'padding',
        {
          properties: this.__sub(['padding-top', 'padding-right', 'padding-bottom', 'padding-left']),
        },
        'margin',
      ],
      [
        'border',
        {
          properties: this.__sub(['border-width', 'border-style', 'border-color']),
        },
        'margin',
      ],
      [
        'border-radius',
        {
          properties: this.__sub([
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius',
          ]),
        },
        'margin',
      ],
      [
        'transform',
        {
          properties: this.__sub([
            'transform-rotate-x',
            'transform-rotate-y',
            'transform-rotate-z',
            'transform-scale-x',
            'transform-scale-y',
            'transform-scale-z',
          ]),
        },
        'margin',
      ],

      // Stack types
      [
        'transition',
        {
          type: this.typeStack,
          properties: this.__sub(['transition-property', 'transition-duration', 'transition-timing-function']),
        },
      ],
      [
        'box-shadow',
        {
          preview: true,
          properties: this.__sub([
            'box-shadow-h',
            'box-shadow-v',
            'box-shadow-blur',
            'box-shadow-spread',
            'box-shadow-color',
            'box-shadow-type',
          ]),
        },
        'transition',
      ],
      [
        'text-shadow',
        {
          default: 'none',
          properties: this.__sub(['text-shadow-h', 'text-shadow-v', 'text-shadow-blur', 'text-shadow-color']),
        },
        'box-shadow',
      ],
      [
        'background',
        {
          detached: true,
          properties: this.__sub([
            'background-image',
            'background-repeat',
            'background-position',
            'background-attachment',
            'background-size',
          ]),
        },
        'box-shadow',
      ],
    ].forEach(([prop, def, from]) => {
      this.add(prop, def || {}, { from });
    });

    return this;
  }

  add(property, def = {}, opts = {}) {
    const from = opts.from || '';
    const fromRes = this.props[from || property] || {};
    const result = { ...fromRes, property, ...def };
    if (result.properties && isFunction(result.properties)) {
      result.properties = result.properties();
    }
    this.props[property] = result;
  }

  get(prop) {
    return this.props[prop] || null;
  }

  /**
   * Build props object by their name
   * @param  {Array<string>|string} props Array of properties name
   * @return {Array<Object>}
   */
  build(props) {
    const result = [];
    const propsArr = isString(props) ? [props] : props;

    propsArr.forEach(prop => {
      result.push(this.get(prop) || { property: prop });
    });

    return result;

    for (var i = 0, len = props.length; i < len; i++) {
      var obj = {};
      var prop = props[i];
      obj.property = prop;

      // Property
      // switch (prop) {
      //   // case 'border-radius-c':
      //   //   obj.property = 'border-radius';
      //   //   break;
      // }

      // Fixed values
      // switch (prop) {
      //   // case 'top':
      //   // case 'right':
      //   // case 'bottom':
      //   // case 'left':
      //   // case 'margin-top':
      //   // case 'margin-right':
      //   // case 'margin-bottom':
      //   // case 'margin-left':
      //   // case 'padding-top':
      //   // case 'padding-right':
      //   // case 'padding-bottom':
      //   // case 'padding-left':
      //   // case 'width':
      //   // case 'max-width':
      //   // case 'min-width':
      //   // case 'height':
      //   // case 'max-height':
      //   // case 'min-height':
      //   // case 'flex-basis':
      //   case 'n':
      //     obj.fixedValues = ['initial', 'inherit', 'auto'];
      //     break;
      //   // case 'font-size':
      //   case 'n':
      //     obj.fixedValues = [
      //       'medium',
      //       'xx-small',
      //       'x-small',
      //       'small',
      //       'large',
      //       'x-large',
      //       'xx-large',
      //       'smaller',
      //       'larger',
      //       'length',
      //       'initial',
      //       'inherit'
      //     ];
      //     break;
      //   // case 'letter-spacing':
      //   // case 'line-height':
      //   case 'n':
      //     obj.fixedValues = ['normal', 'initial', 'inherit'];
      //     break;
      // }

      // Type
      switch (
        prop
        // case 'float':
        // case 'position':
        // case 'text-align':
        //   obj.type = 'radio';
        //   break;
        // case 'display':
        // case 'flex-direction':
        // case 'flex-wrap':
        // case 'justify-content':
        // case 'align-items':
        // case 'align-content':
        // case 'align-self':
        // case 'font-family':
        // case 'font-weight':
        // case 'border-style':
        // case 'box-shadow-type':
        // case 'background-repeat':
        // case 'background-position':
        // case 'background-attachment':
        // case 'background-size':
        // case 'transition-property':
        // case 'transition-timing-function':
        // case 'cursor':
        // case 'overflow':
        // case 'overflow-x':
        // case 'overflow-y':
        //   obj.type = 'select';
        //   break;
        // case 'top':
        // case 'right':
        // case 'bottom':
        // case 'left':
        // case 'margin-top':
        // case 'margin-right':
        // case 'margin-bottom':
        // case 'margin-left':
        // case 'padding-top':
        // case 'padding-right':
        // case 'padding-bottom':
        // case 'padding-left':
        // case 'min-height':
        // case 'min-width':
        // case 'max-height':
        // case 'max-width':
        // case 'width':
        // case 'height':
        // case 'font-size':
        // case 'letter-spacing':
        // case 'line-height':
        // case 'text-shadow-h':
        // case 'text-shadow-v':
        // case 'text-shadow-blur':
        // case 'border-radius-c':
        // case 'border-top-left-radius':
        // case 'border-top-right-radius':
        // case 'border-bottom-left-radius':
        // case 'border-bottom-right-radius':
        // case 'border-width':
        // case 'box-shadow-h':
        // case 'box-shadow-v':
        // case 'box-shadow-blur':
        // case 'box-shadow-spread':
        // case 'transition-duration':
        // case 'perspective':
        // case 'transform-rotate-x':
        // case 'transform-rotate-y':
        // case 'transform-rotate-z':
        // case 'transform-scale-x':
        // case 'transform-scale-y':
        // case 'transform-scale-z':
        // case 'order':
        // case 'flex-grow':
        // case 'flex-shrink':
        // case 'flex-basis':
        // obj.type = 'integer';
        // break;
        // case 'margin':
        // case 'padding':
        // case 'border-radius':
        // case 'border':
        // case 'transform':
        // obj.type = 'composite';
        // break;
        // case 'color':
        // case 'text-shadow-color':
        // case 'background-color':
        // case 'border-color':
        // case 'box-shadow-color':
        // obj.type = 'color';
        // break;
        // case 'text-shadow':
        // case 'box-shadow':
        // case 'background':
        // case 'transition':
        //   obj.type = 'stack';
        //   break;
        // case 'background-image':
        // obj.type = 'file';
        // break;
      ) {
      }

      // Defaults
      switch (
        prop
        // case 'float':
        // case 'background-color':
        // case 'text-shadow':
        //   obj.defaults = 'none';
        //   break;
        // // case 'display':
        //   obj.defaults = 'block';
        //   break;
        // // case 'flex-direction':
        //   obj.defaults = 'row';
        //   break;
        // // case 'flex-wrap':
        //   obj.defaults = 'nowrap';
        //   break;
        // // case 'justify-content':
        //   obj.defaults = 'flex-start';
        //   break;
        // // case 'align-items':
        //   obj.defaults = 'stretch';
        //   break;
        // // case 'align-content':
        //   obj.defaults = 'stretch';
        //   break;
        // // case 'align-self':
        //   obj.defaults = 'auto';
        //   break;
        // // case 'position':
        //   obj.defaults = 'static';
        //   break;
        // case 'margin-top':
        // case 'margin-right':
        // case 'margin-bottom':
        // case 'margin-left':
        // case 'padding-top':
        // case 'padding-right':
        // case 'padding-bottom':
        // case 'padding-left':
        // case 'text-shadow-h':
        // case 'text-shadow-v':
        // case 'text-shadow-blur':
        // case 'border-radius-c':
        // case 'box-shadow-h':
        // case 'box-shadow-v':
        // case 'box-shadow-spread':
        // case 'perspective':
        // case 'transform-rotate-x':
        // case 'transform-rotate-y':
        // case 'transform-rotate-z':
        // case 'order':
        // case 'flex-grow':
        // obj.defaults = 0;
        // break;
        // case 'border-top-left-radius':
        // case 'border-top-right-radius':
        // case 'border-bottom-left-radius':
        // case 'border-bottom-right-radius':
        // obj.defaults = '0px';
        // break;
        // case 'transform-scale-x':
        // case 'transform-scale-y':
        // case 'transform-scale-z':
        // case 'flex-shrink':
        // obj.defaults = 1;
        // break;
        // case 'box-shadow-blur':
        // obj.defaults = '5px';
        // break;
        // case 'top':
        // case 'right':
        // case 'bottom':
        // case 'left':
        // case 'min-height':
        // case 'min-width':
        // case 'max-height':
        // case 'max-width':
        // case 'width':
        // case 'height':
        // case 'background-size':
        // case 'cursor':
        // case 'flex-basis':
        //   obj.defaults = 'auto';
        //   break;
        // // case 'font-family':
        //   obj.defaults = 'Arial, Helvetica, sans-serif';
        //   break;
        // // case 'font-size':
        // // case 'border-width':
        //   obj.defaults = 'medium';
        //   break;
        // // case 'font-weight':
        //   obj.defaults = '400';
        //   break;
        // // case 'letter-spacing':
        // // case 'line-height':
        //   obj.defaults = 'normal';
        //   break;
        // case 'color':
        // case 'text-shadow-color':
        // case 'border-color':
        // case 'box-shadow-color':
        // obj.defaults = 'black';
        // break;
        // case 'text-align':
        //   obj.defaults = 'left';
        //   break;
        // case 'border-style':
        //   obj.defaults = 'solid';
        //   break;
        // // case 'box-shadow-type':
        //   obj.defaults = '';
        //   break;
        // // case 'background-repeat':
        //   obj.defaults = 'repeat';
        //   break;
        // // case 'background-position':
        //   obj.defaults = 'left top';
        //   break;
        // // case 'background-attachment':
        //   obj.defaults = 'scroll';
        //   break;
        // // case 'transition-property':
        //   obj.defaults = 'width';
        //   break;
        // // case 'transition-duration':
        //   obj.defaults = '2';
        //   break;
        // // case 'transition-timing-function':
        //   obj.defaults = 'ease';
        //   break;
        // // case 'overflow':
        // // case 'overflow-x':
        // // case 'overflow-y':
        //   obj.defaults = 'visible';
        //   break;
      ) {
      }

      /*
       * Add styleable dependency on other properties. Allows properties to be
       * dynamically hidden or shown based on values of other properties.
       *
       * Property will be styleable if all of the properties (keys) in the
       * requires object have any of the values specified in the array.
       */
      // switch (prop) {
      //   // case 'flex-direction':
      //   // case 'flex-wrap':
      //   // case 'justify-content':
      //   // case 'align-items':
      //   // case 'align-content':
      //   //   obj.requires = { display: ['flex'] };
      //   //   break;
      //   // case 'order':
      //   // case 'flex-basis':
      //   // case 'flex-grow':
      //   // case 'flex-shrink':
      //   // case 'align-self':
      //     // obj.requiresParent = { display: ['flex'] };
      //     // break;
      // }

      // Units
      // switch (prop) {
      // case 'top':
      // case 'bottom':
      // case 'margin-top':
      // case 'margin-bottom':
      // case 'padding-top':
      // case 'padding-bottom':
      // case 'min-height':
      // case 'max-height':
      // case 'height':
      //   obj.units = ['px', '%', 'vh'];
      //   break;
      // case 'right':
      // case 'left':
      // case 'margin-right':
      // case 'margin-left':
      // case 'padding-right':
      // case 'padding-left':
      // case 'min-width':
      // case 'max-width':
      // case 'width':
      //   obj.units = ['px', '%', 'vw'];
      //   break;
      // case 'flex-basis':
      //   obj.units = ['px', '%', 'vw', 'vh'];
      //   break;
      // case 'text-shadow-v':
      // case 'text-shadow-h':
      // case 'text-shadow-blur':
      // case 'border-radius-c':
      // case 'border-top-left-radius':
      // case 'border-top-right-radius':
      // case 'border-bottom-left-radius':
      // case 'border-bottom-right-radius':
      // case 'box-shadow-h':
      // case 'box-shadow-v':
      // obj.units = ['px', '%'];
      // break;
      // case 'font-size':
      // case 'letter-spacing':
      // case 'line-height':
      //   obj.units = ['px', 'em', 'rem', '%'];
      //   break;
      // case 'border-width':
      // obj.units = ['px', 'em'];
      // break;
      // case 'box-shadow-blur':
      // case 'box-shadow-spread':
      // case 'perspective':
      // obj.units = ['px'];
      // break;
      // case 'transition-duration':
      // obj.units = ['s'];
      // break;
      // case 'transform-rotate-x':
      // case 'transform-rotate-y':
      // case 'transform-rotate-z':
      // obj.units = ['deg'];
      // break;
      // }

      // Min/Max
      // switch (prop) {
      // case 'padding-top':
      // case 'padding-right':
      // case 'padding-bottom':
      // case 'padding-left':
      // case 'min-height':
      // case 'min-width':
      // case 'max-height':
      // case 'max-width':
      // case 'width':
      // case 'height':
      // case 'font-size':
      // case 'text-shadow-blur':
      // case 'border-radius-c':
      // case 'border-top-left-radius':
      // case 'border-top-right-radius':
      // case 'border-bottom-left-radius':
      // case 'border-bottom-right-radius':
      // case 'border-width':
      // case 'box-shadow-blur':
      // case 'transition-duration':
      // case 'perspective':
      // case 'flex-basis':
      // obj.min = 0;
      // break;
      // }

      // Preview
      // switch (prop) {
      //   case 'text-shadow':
      //   case 'box-shadow':
      //   case 'background':
      //     obj.preview = true;
      //     break;
      // }

      // Detached
      // switch (prop) {
      //   case 'background':
      //     obj.detached = true;
      //     break;
      // }

      // Functions
      // switch (prop) {
      //   // // case 'transform-rotate-x':
      //   //   obj.functionName = 'rotateX';
      //   //   break;
      //   // // case 'transform-rotate-y':
      //   //   obj.functionName = 'rotateY';
      //   //   break;
      //   // // case 'transform-rotate-z':
      //   //   obj.functionName = 'rotateZ';
      //   //   break;
      //   // // case 'transform-scale-x':
      //   //   obj.functionName = 'scaleX';
      //   //   break;
      //   // // case 'transform-scale-y':
      //   //   obj.functionName = 'scaleY';
      //   //   break;
      //   // // case 'transform-scale-z':
      //   //   obj.functionName = 'scaleZ';
      //   //   break;
      //   // case 'background-image':
      //     // obj.functionName = 'url';
      //     // break;
      // }

      // Options
      // switch (prop) {
      // case 'float':
      //   obj.list = [{ value: 'none' }, { value: 'left' }, { value: 'right' }];
      //   break;
      // case 'display':
      // obj.list = [
      //   { value: 'block' },
      //   { value: 'inline' },
      //   { value: 'inline-block' },
      //   { value: 'flex' },
      //   { value: 'none' }
      // ];
      // break;
      // case 'flex-direction':
      // obj.list = [
      //   { value: 'row' },
      //   { value: 'row-reverse' },
      //   { value: 'column' },
      //   { value: 'column-reverse' }
      // ];
      // break;
      // case 'flex-wrap':
      // obj.list = [
      //   { value: 'nowrap' },
      //   { value: 'wrap' },
      //   { value: 'wrap-reverse' }
      // ];
      // break;
      // case 'justify-content':
      // obj.list = [
      //   { value: 'flex-start' },
      //   { value: 'flex-end' },
      //   { value: 'center' },
      //   { value: 'space-between' },
      //   { value: 'space-around' },
      //   { value: 'space-evenly' }
      // ];
      // break;
      // case 'align-items':
      // obj.list = [
      //   { value: 'flex-start' },
      //   { value: 'flex-end' },
      //   { value: 'center' },
      //   { value: 'baseline' },
      //   { value: 'stretch' }
      // ];
      // break;
      // case 'align-content':
      // obj.list = [
      //   { value: 'flex-start' },
      //   { value: 'flex-end' },
      //   { value: 'center' },
      //   { value: 'space-between' },
      //   { value: 'space-around' },
      //   { value: 'stretch' }
      // ];
      // break;
      // case 'align-self':
      // obj.list = [
      //   { value: 'auto' },
      //   { value: 'flex-start' },
      //   { value: 'flex-end' },
      //   { value: 'center' },
      //   { value: 'baseline' },
      //   { value: 'stretch' }
      // ];
      // break;
      // case 'position':
      // obj.list = [
      //   { value: 'static' },
      //   { value: 'relative' },
      //   { value: 'absolute' },
      //   { value: 'fixed' }
      // ];
      // break;
      // case 'font-family':
      // var ss = ', sans-serif';
      // var fonts = [
      //   'Arial, Helvetica' + ss,
      //   'Arial Black, Gadget' + ss,
      //   'Brush Script MT' + ss,
      //   'Comic Sans MS, cursive' + ss,
      //   'Courier New, Courier, monospace',
      //   'Georgia, serif',
      //   'Helvetica' + ss,
      //   'Impact, Charcoal' + ss,
      //   'Lucida Sans Unicode, Lucida Grande' + ss,
      //   'Tahoma, Geneva' + ss,
      //   'Times New Roman, Times, serif',
      //   'Trebuchet MS, Helvetica' + ss,
      //   'Verdana, Geneva' + ss
      // ];
      // obj.list = [];
      // for (var j = 0, l = fonts.length; j < l; j++) {
      //   var font = {};
      //   font.value = fonts[j];
      //   font.name = fonts[j].split(',')[0];
      //   obj.list.push(font);
      // }
      // break;
      // case 'font-weight':
      // obj.list = [
      //   { value: '100', name: 'Thin' },
      //   { value: '200', name: 'Extra-Light' },
      //   { value: '300', name: 'Light' },
      //   { value: '400', name: 'Normal' },
      //   { value: '500', name: 'Medium' },
      //   { value: '600', name: 'Semi-Bold' },
      //   { value: '700', name: 'Bold' },
      //   { value: '800', name: 'Extra-Bold' },
      //   { value: '900', name: 'Ultra-Bold' }
      // ];
      // break;
      // case 'text-align':
      //  obj.list = [
      //   { value: 'left' },
      //   { value: 'center' },
      //   { value: 'right' },
      //   { value: 'justify' }
      // ];
      // break;
      // case 'border-style':
      // obj.list = [
      //   { value: 'none' },
      //   { value: 'solid' },
      //   { value: 'dotted' },
      //   { value: 'dashed' },
      //   { value: 'double' },
      //   { value: 'groove' },
      //   { value: 'ridge' },
      //   { value: 'inset' },
      //   { value: 'outset' }
      // ];
      // break;
      // case 'box-shadow-type':
      // obj.list = [
      //   { value: '', name: 'Outside' },
      //   { value: 'inset', name: 'Inside' }
      // ];
      // break;
      // case 'background-repeat':
      // obj.list = [
      //   { value: 'repeat' },
      //   { value: 'repeat-x' },
      //   { value: 'repeat-y' },
      //   { value: 'no-repeat' }
      // ];
      // break;
      // case 'background-position':
      // obj.list = [
      //   { value: 'left top' },
      //   { value: 'left center' },
      //   { value: 'left bottom' },
      //   { value: 'right top' },
      //   { value: 'right center' },
      //   { value: 'right bottom' },
      //   { value: 'center top' },
      //   { value: 'center center' },
      //   { value: 'center bottom' }
      // ];
      // break;
      // case 'background-attachment':
      // obj.list = [
      //   { value: 'scroll' },
      //   { value: 'fixed' },
      //   { value: 'local' }
      // ];
      // break;
      // case 'background-size':
      // obj.list = [
      //   { value: 'auto' },
      //   { value: 'cover' },
      //   { value: 'contain' }
      // ];
      // break;
      // case 'transition-property':
      // obj.list = [
      //   { value: 'all' },
      //   { value: 'width' },
      //   { value: 'height' },
      //   { value: 'background-color' },
      //   { value: 'transform' },
      //   { value: 'box-shadow' },
      //   { value: 'opacity' }
      // ];
      // break;
      // case 'transition-timing-function':
      // obj.list = [
      //   { value: 'linear' },
      //   { value: 'ease' },
      //   { value: 'ease-in' },
      //   { value: 'ease-out' },
      //   { value: 'ease-in-out' }
      // ];
      // break;
      // case 'cursor':
      // obj.list = [
      //   { value: 'auto' },
      //   { value: 'pointer' },
      //   { value: 'copy' },
      //   { value: 'crosshair' },
      //   { value: 'grab' },
      //   { value: 'grabbing' },
      //   { value: 'help' },
      //   { value: 'move' },
      //   { value: 'text' }
      // ];
      // break;
      // case 'overflow':
      // case 'overflow-x':
      // case 'overflow-y':
      // obj.list = [
      //   { value: 'visible' },
      //   { value: 'hidden' },
      //   { value: 'scroll' },
      //   { value: 'auto' }
      // ];
      // break;
      // }

      // Properties
      switch (
        prop
        // // case 'margin':
        //   obj.properties = this.build([
        //     'margin-top',
        //     'margin-right',
        //     'margin-bottom',
        //     'margin-left'
        //   ]);
        //   break;
        // // case 'padding':
        //   obj.properties = this.build([
        //     'padding-top',
        //     'padding-right',
        //     'padding-bottom',
        //     'padding-left'
        //   ]);
        //   break;
        // case 'text-shadow':
        //   obj.properties = this.build([
        //     'text-shadow-h',
        //     'text-shadow-v',
        //     'text-shadow-blur',
        //     'text-shadow-color'
        //   ]);
        //   break;
        // // case 'border':
        //   obj.properties = this.build([
        //     'border-width',
        //     'border-style',
        //     'border-color'
        //   ]);
        //   break;
        // // case 'border-radius':
        //   obj.properties = this.build([
        //     'border-top-left-radius',
        //     'border-top-right-radius',
        //     'border-bottom-right-radius',
        //     'border-bottom-left-radius'
        //   ]);
        //   break;
        // case 'box-shadow':
        //   obj.properties = this.build([
        //     'box-shadow-h',
        //     'box-shadow-v',
        //     'box-shadow-blur',
        //     'box-shadow-spread',
        //     'box-shadow-color',
        //     'box-shadow-type'
        //   ]);
        //   break;
        // case 'background':
        //   obj.properties = this.build([
        //     'background-image',
        //     'background-repeat',
        //     'background-position',
        //     'background-attachment',
        //     'background-size'
        //   ]);
        //   break;
        // case 'transition':
        //   obj.properties = this.build([
        //     'transition-property',
        //     'transition-duration',
        //     'transition-timing-function'
        //   ]);
        //   break;
        // case 'transform':
        // obj.properties = this.build([
        //   'transform-rotate-x',
        //   'transform-rotate-y',
        //   'transform-rotate-z',
        //   'transform-scale-x',
        //   'transform-scale-y',
        //   'transform-scale-z'
        // ]);
        // break;
      ) {
      }

      objs.push(obj);
    }

    return objs;
  }
}
