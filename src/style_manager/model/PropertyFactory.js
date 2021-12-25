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
    const optsFlex = ['flex-start', 'flex-end', 'center'];
    const optsFlexAlign = [...optsFlex, 'baseline', 'stretch'];

    this.optsBgSize = getOptions(['auto', 'cover', 'contain']);
    this.optsBgAttach = getOptions(['scroll', 'fixed', 'local']);
    this.optsBgRepeat = getOptions(['repeat', 'repeat-x', 'repeat-y', 'no-repeat']);
    this.optsWrap = getOptions(['nowrap', 'wrap', 'wrap-reverse']);
    this.optsOverflow = getOptions(['visible', 'hidden', 'scroll', 'auto']);
    this.optsDir = getOptions(['row', 'row-reverse', 'column', 'column-reverse']);
    this.opstDisplay = getOptions(['block', 'inline', 'inline-block', 'flex', 'none']);
    this.optsTransitFn = getOptions(['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']);
    this.optsCursor = getOptions(['auto', 'pointer', 'copy', 'crosshair', 'grab', 'grabbing', 'help', 'move', 'text']);
    this.optsFloat = getOptions(['none', 'left', 'right']);
    this.optsPos = getOptions(['static', 'relative', 'absolute', 'fixed']);
    this.optsTextAlign = getOptions(['left', 'center', 'right', 'justify']);
    this.optsFlexAlign = getOptions(optsFlexAlign);
    this.optsJustCont = getOptions([...optsFlex, 'space-between', 'space-around', 'space-evenly']);
    this.optsAlignCont = getOptions([...optsFlex, 'space-between', 'space-around', 'stretch']);
    this.optsAlignSelf = getOptions(['auto', ...optsFlexAlign]);
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
    this.optsShadowType = [
      { id: '', label: 'Outside' },
      { id: 'inset', label: 'Inside' },
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

    // Fixed values
    this.fixedFontSizes = [
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
    ];
    this.fixedLetSpace = ['normal', 'initial', 'inherit'];
    this.requireFlex = { display: ['flex'] };

    this.init();
  }

  __sub(items) {
    return () => items.map(p => this.get(p));
  }

  init() {
    const { fixedValues, requireFlex, typeNumber } = this;
    this.props = {};

    // Build default built-in properties (the order, in the array here below, matters)
    // [propertyName, propertyDefinition, extendFromProperty]
    [
      // Number types
      ['text-shadow-h', { type: typeNumber, default: '0', units: this.unitsSizeNoPerc }],
      ['top', { default: 'auto', units: this.unitsSize, fixedValues }, 'text-shadow-h'],
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
      ['font-size', { default: 'medium', fixedValues: this.fixedFontSizes }, 'width'],
      ['letter-spacing', { default: 'normal', fixedValues: this.fixedLetSpace }, 'top'],
      ['line-height', {}, 'letter-spacing'],
      ['text-shadow-v', {}, 'text-shadow-h'],
      ['text-shadow-blur', { min: 0 }, 'text-shadow-h'],
      ['border-radius-c', { property: 'border-radius', fixedValues: undefined }, 'padding-top'],
      ['border-top-left-radius', {}, 'border-radius-c'],
      ['border-top-right-radius', {}, 'border-radius-c'],
      ['border-bottom-left-radius', {}, 'border-radius-c'],
      ['border-bottom-right-radius', {}, 'border-radius-c'],
      ['border-width', { default: 'medium', units: this.unitsSizeNoPerc }, 'border-radius-c'],
      ['box-shadow-h', {}, 'text-shadow-h'],
      ['box-shadow-v', {}, 'text-shadow-h'],
      ['box-shadow-blur', { default: '5px' }, 'text-shadow-blur'],
      ['box-shadow-spread', {}, 'text-shadow-h'],
      ['transition-duration', { default: '2', units: this.unitsTime }, 'border-radius-c'],
      ['perspective', {}, 'border-radius-c'],
      ['transform-rotate-x', { functionName: 'rotateX', units: this.unitsAngle, default: '0', type: typeNumber }],
      ['transform-rotate-y', { functionName: 'rotateY' }, 'transform-rotate-x'],
      ['transform-rotate-z', { functionName: 'rotateZ' }, 'transform-rotate-x'],
      ['transform-scale-x', { default: '1', functionName: 'scaleX', units: undefined }, 'transform-rotate-x'],
      ['transform-scale-y', { functionName: 'scaleY' }, 'transform-scale-x'],
      ['transform-scale-z', { functionName: 'scaleZ' }, 'transform-scale-x'],
      ['order', { type: typeNumber, default: '0', requiresParent: requireFlex }],
      ['flex-grow', {}, 'order'],
      ['flex-shrink', { default: '1' }, 'order'],

      // Radio types
      ['float', { type: this.typeRadio, default: 'none', options: this.optsFloat }],
      ['position', { default: 'static', options: this.optsPos }, 'float'],
      ['text-align', { default: 'left', options: this.optsTextAlign }, 'float'],

      // Color types
      ['color', { type: this.typeColor, default: 'black' }],
      ['text-shadow-color', {}, 'color'],
      ['border-color', {}, 'color'],
      ['box-shadow-color', {}, 'color'],
      ['background-color', { default: 'none' }, 'color'],

      // File type
      ['background-image', { type: this.typeFile, functionName: 'url' }],

      // Select types
      ['display', { type: this.typeSelect, default: 'block', options: this.opstDisplay }],
      ['flex-direction', { default: 'row', options: this.optsDir, requires: requireFlex }, 'display'],
      ['flex-wrap', { default: 'nowrap', options: this.optsWrap }, 'flex-direction'],
      ['justify-content', { default: 'flex-start', options: this.optsJustCont }, 'flex-wrap'],
      ['align-items', { default: 'stretch', options: this.optsFlexAlign }, 'flex-wrap'],
      ['align-content', { options: this.optsAlignCont }, 'align-items'],
      ['align-self', { default: 'auto', options: this.optsAlignSelf, requiresParent: requireFlex }, 'display'],
      ['font-family', { default: 'Arial, Helvetica, sans-serif', options: this.optsFonts }, 'display'],
      ['font-weight', { default: '400', options: this.optsWeight }, 'display'],
      ['border-style', { default: 'solid', options: this.optsBorderStyle }, 'display'],
      ['box-shadow-type', { default: '', options: this.optsShadowType }, 'display'],
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
    return result;
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
  }
}
