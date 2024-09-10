import PropertyFactory from '../../../../src/style_manager/model/PropertyFactory';

describe('PropertyFactory', () => {
  let obj: PropertyFactory;

  beforeEach(() => {
    obj = new PropertyFactory();
  });

  test('Object exists', () => {
    expect(obj).toBeTruthy();
  });

  test('Build single prop', () => {
    expect(obj.build('float')).toEqual([
      {
        property: 'float',
        type: 'radio',
        default: 'none',
        options: [{ id: 'none' }, { id: 'left' }, { id: 'right' }],
      },
    ]);
  });

  test('Build display', () => {
    expect(obj.build('display')).toEqual([
      {
        property: 'display',
        type: 'select',
        default: 'block',
        options: [{ id: 'block' }, { id: 'inline' }, { id: 'inline-block' }, { id: 'flex' }, { id: 'none' }],
      },
    ]);
  });

  test('Build flex-direction', () => {
    expect(obj.build('flex-direction')).toEqual([
      {
        property: 'flex-direction',
        type: 'select',
        default: 'row',
        options: [{ id: 'row' }, { id: 'row-reverse' }, { id: 'column' }, { id: 'column-reverse' }],
        requires: { display: ['flex'] },
      },
    ]);
  });

  test('Build flex-wrap', () => {
    expect(obj.build('flex-wrap')).toEqual([
      {
        property: 'flex-wrap',
        type: 'select',
        default: 'nowrap',
        options: [{ id: 'nowrap' }, { id: 'wrap' }, { id: 'wrap-reverse' }],
        requires: { display: ['flex'] },
      },
    ]);
  });

  test('Build justify-content', () => {
    expect(obj.build('justify-content')).toEqual([
      {
        property: 'justify-content',
        type: 'select',
        default: 'flex-start',
        options: [
          { id: 'flex-start' },
          { id: 'flex-end' },
          { id: 'center' },
          { id: 'space-between' },
          { id: 'space-around' },
          { id: 'space-evenly' },
        ],
        requires: { display: ['flex'] },
      },
    ]);
  });

  test('Build align-items', () => {
    expect(obj.build('align-items')).toEqual([
      {
        property: 'align-items',
        type: 'select',
        default: 'stretch',
        options: [{ id: 'flex-start' }, { id: 'flex-end' }, { id: 'center' }, { id: 'baseline' }, { id: 'stretch' }],
        requires: { display: ['flex'] },
      },
    ]);
  });

  test('Build align-content', () => {
    expect(obj.build('align-content')).toEqual([
      {
        property: 'align-content',
        type: 'select',
        default: 'stretch',
        options: [
          { id: 'flex-start' },
          { id: 'flex-end' },
          { id: 'center' },
          { id: 'space-between' },
          { id: 'space-around' },
          { id: 'stretch' },
        ],
        requires: { display: ['flex'] },
      },
    ]);
  });

  test('Build align-self', () => {
    expect(obj.build('align-self')).toEqual([
      {
        property: 'align-self',
        type: 'select',
        default: 'auto',
        options: [
          { id: 'auto' },
          { id: 'flex-start' },
          { id: 'flex-end' },
          { id: 'center' },
          { id: 'baseline' },
          { id: 'stretch' },
        ],
        requiresParent: { display: ['flex'] },
      },
    ]);
  });

  test('Build position', () => {
    expect(obj.build('position')).toEqual([
      {
        property: 'position',
        type: 'radio',
        default: 'static',
        options: [{ id: 'static' }, { id: 'relative' }, { id: 'absolute' }, { id: 'fixed' }],
      },
    ]);
  });

  test('Build left, right', () => {
    const res = {
      type: 'number',
      units: obj.unitsSize,
      default: 'auto',
      property: 'right',
      fixedValues: ['initial', 'inherit', 'auto'],
    };
    expect(obj.build('right')).toEqual([res]);
    res.property = 'left';
    expect(obj.build('left')).toEqual([res]);
  });

  test('Build top, bottom', () => {
    const res = {
      type: 'number',
      units: obj.unitsSize,
      default: 'auto',
      property: 'top',
      fixedValues: ['initial', 'inherit', 'auto'],
    };
    expect(obj.build('top')).toEqual([res]);
    res.property = 'bottom';
    expect(obj.build('bottom')).toEqual([res]);
  });

  test('Build width family', () => {
    const res = {
      type: 'number',
      units: obj.unitsSize,
      default: 'auto',
      property: 'width',
      fixedValues: ['initial', 'inherit', 'auto'],
      min: 0,
    };
    expect(obj.build('width')).toEqual([res]);
    res.property = 'min-width';
    expect(obj.build('min-width')).toEqual([res]);
    res.property = 'max-width';
    expect(obj.build('max-width')).toEqual([res]);
  });

  test('Build flex-basis', () => {
    const res = {
      type: 'number',
      units: obj.unitsSize,
      default: 'auto',
      fixedValues: ['initial', 'inherit', 'auto'],
      requiresParent: { display: ['flex'] },
      min: 0,
      property: 'flex-basis',
    };
    expect(obj.build('flex-basis')).toEqual([res]);
  });

  test('Build height family', () => {
    const res = {
      type: 'number',
      units: obj.unitsSize,
      default: 'auto',
      fixedValues: ['initial', 'inherit', 'auto'],
      min: 0,
      property: 'height',
    };
    expect(obj.build('height')).toEqual([res]);
    res.property = 'min-height';
    expect(obj.build('min-height')).toEqual([res]);
    res.property = 'max-height';
    expect(obj.build('max-height')).toEqual([res]);
  });

  test('Build margin', () => {
    const res = {
      property: 'margin',
      type: 'composite',
      properties: [
        {
          fixedValues: ['initial', 'inherit', 'auto'],
          property: 'margin-top',
          id: 'margin-top-sub',
          type: 'number',
          units: obj.unitsSize,
          default: '0',
        },
        {
          fixedValues: ['initial', 'inherit', 'auto'],
          property: 'margin-right',
          id: 'margin-right-sub',
          type: 'number',
          units: obj.unitsSize,
          default: '0',
        },
        {
          fixedValues: ['initial', 'inherit', 'auto'],
          property: 'margin-bottom',
          id: 'margin-bottom-sub',
          type: 'number',
          units: obj.unitsSize,
          default: '0',
        },
        {
          fixedValues: ['initial', 'inherit', 'auto'],
          property: 'margin-left',
          id: 'margin-left-sub',
          type: 'number',
          units: obj.unitsSize,
          default: '0',
        },
      ],
    };
    expect(obj.build('margin')).toEqual([res]);
  });

  test('Build padding', () => {
    const res = {
      property: 'padding',
      type: 'composite',
      properties: [
        {
          property: 'padding-top',
          id: 'padding-top-sub',
          fixedValues: ['initial', 'inherit', 'auto'],
          type: 'number',
          units: obj.unitsSize,
          default: '0',
          min: 0,
        },
        {
          property: 'padding-right',
          id: 'padding-right-sub',
          fixedValues: ['initial', 'inherit', 'auto'],
          type: 'number',
          units: obj.unitsSize,
          default: '0',
          min: 0,
        },
        {
          property: 'padding-bottom',
          id: 'padding-bottom-sub',
          fixedValues: ['initial', 'inherit', 'auto'],
          type: 'number',
          units: obj.unitsSize,
          default: '0',
          min: 0,
        },
        {
          property: 'padding-left',
          id: 'padding-left-sub',
          fixedValues: ['initial', 'inherit', 'auto'],
          type: 'number',
          units: obj.unitsSize,
          default: '0',
          min: 0,
        },
      ],
    };
    expect(obj.build('padding')).toEqual([res]);
  });

  test('Build font-family', () => {
    var ss = ', sans-serif';
    var ms = ', monospace';
    const res = {
      property: 'font-family',
      type: 'select',
      default: 'Arial, Helvetica' + ss,
      options: [
        { label: 'Arial', id: 'Arial, Helvetica' + ss },
        { label: 'Arial Black', id: 'Arial Black, Gadget' + ss },
        { label: 'Brush Script MT', id: 'Brush Script MT' + ss },
        { label: 'Comic Sans MS', id: 'Comic Sans MS, cursive' + ss },
        { label: 'Courier New', id: 'Courier New, Courier' + ms },
        { label: 'Georgia', id: 'Georgia, serif' },
        { label: 'Helvetica', id: 'Helvetica' + ss },
        { label: 'Impact', id: 'Impact, Charcoal' + ss },
        {
          label: 'Lucida Sans Unicode',
          id: 'Lucida Sans Unicode, Lucida Grande' + ss,
        },
        { label: 'Tahoma', id: 'Tahoma, Geneva' + ss },
        { label: 'Times New Roman', id: 'Times New Roman, Times, serif' },
        { label: 'Trebuchet MS', id: 'Trebuchet MS, Helvetica' + ss },
        { label: 'Verdana', id: 'Verdana, Geneva' + ss },
      ],
    };
    expect(obj.build('font-family')).toEqual([res]);
  });

  test('Build font-size', () => {
    const res = {
      type: 'number',
      units: obj.unitsSize,
      default: 'medium',
      min: 0,
      property: 'font-size',
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
    };
    expect(obj.build('font-size')).toEqual([res]);
  });

  test('Build letter-spacing', () => {
    const res = {
      type: 'number',
      units: obj.unitsSize,
      default: 'normal',
      property: 'letter-spacing',
      fixedValues: ['normal', 'initial', 'inherit'],
    };
    expect(obj.build('letter-spacing')).toEqual([res]);
  });

  test('Build font-weight', () => {
    const res = {
      type: 'select',
      default: '400',
      property: 'font-weight',
      options: [
        { id: '100', label: 'Thin' },
        { id: '200', label: 'Extra-Light' },
        { id: '300', label: 'Light' },
        { id: '400', label: 'Normal' },
        { id: '500', label: 'Medium' },
        { id: '600', label: 'Semi-Bold' },
        { id: '700', label: 'Bold' },
        { id: '800', label: 'Extra-Bold' },
        { id: '900', label: 'Ultra-Bold' },
      ],
    };
    expect(obj.build('font-weight')).toEqual([res]);
  });

  test('Build color', () => {
    const res = {
      property: 'color',
      type: 'color',
      default: 'black',
      full: true,
    };
    expect(obj.build('color')).toEqual([res]);
  });

  test('Build line-height', () => {
    const res = {
      type: 'number',
      units: obj.unitsSize,
      default: 'normal',
      property: 'line-height',
      fixedValues: ['normal', 'initial', 'inherit'],
    };
    expect(obj.build('line-height')).toEqual([res]);
  });

  test('Build text-align', () => {
    const res = {
      type: 'radio',
      default: 'left',
      property: 'text-align',
      options: [{ id: 'left' }, { id: 'center' }, { id: 'right' }, { id: 'justify' }],
    };
    expect(obj.build('text-align')).toEqual([res]);
  });

  test('Build text-shadow', () => {
    const res = {
      type: 'stack',
      preview: true,
      default: 'none',
      property: 'text-shadow',
      properties: [
        {
          property: 'text-shadow-h',
          type: 'number',
          units: obj.unitsSizeNoPerc,
          default: '0',
        },
        {
          property: 'text-shadow-v',
          type: 'number',
          units: obj.unitsSizeNoPerc,
          default: '0',
        },
        {
          property: 'text-shadow-blur',
          type: 'number',
          units: obj.unitsSizeNoPerc,
          default: '0',
          min: 0,
        },
        {
          property: 'text-shadow-color',
          full: true,
          type: 'color',
          default: 'black',
        },
      ],
    };
    const result = obj.build('text-shadow');
    // @ts-ignore
    delete result[0].layerLabel;
    expect(result).toEqual([res]);
  });

  test('Build border-radius-c', () => {
    const res = {
      type: 'number',
      units: obj.unitsSize,
      property: 'border-radius',
      default: '0',
      min: 0,
    };
    expect(obj.build('border-radius-c')).toEqual([res]);
  });

  test('Build border-radius', () => {
    const res = {
      property: 'border-radius',
      type: 'composite',
      properties: [
        {
          property: 'border-top-left-radius',
          id: 'border-top-left-radius-sub',
          type: 'number',
          units: obj.unitsSize,
          default: '0',
          min: 0,
        },
        {
          property: 'border-top-right-radius',
          id: 'border-top-right-radius-sub',
          type: 'number',
          units: obj.unitsSize,
          min: 0,
          default: '0',
        },
        {
          property: 'border-bottom-right-radius',
          id: 'border-bottom-right-radius-sub',
          type: 'number',
          units: obj.unitsSize,
          min: 0,
          default: '0',
        },
        {
          property: 'border-bottom-left-radius',
          id: 'border-bottom-left-radius-sub',
          type: 'number',
          units: obj.unitsSize,
          min: 0,
          default: '0',
        },
      ],
    };
    expect(obj.build('border-radius')).toEqual([res]);
  });

  test('Build background-color', () => {
    const res = {
      type: 'color',
      default: 'none',
      full: true,
      property: 'background-color',
    };
    expect(obj.build('background-color')).toEqual([res]);
  });

  test('Build border', () => {
    const res = {
      property: 'border',
      type: 'composite',
      properties: [
        {
          property: 'border-width',
          id: 'border-width-sub',
          type: 'number',
          units: obj.unitsSizeNoPerc,
          default: '0',
          min: 0,
        },
        {
          property: 'border-style',
          id: 'border-style-sub',
          type: 'select',
          default: 'solid',
          options: [
            { id: 'none' },
            { id: 'solid' },
            { id: 'dotted' },
            { id: 'dashed' },
            { id: 'double' },
            { id: 'groove' },
            { id: 'ridge' },
            { id: 'inset' },
            { id: 'outset' },
          ],
        },
        {
          property: 'border-color',
          id: 'border-color-sub',
          full: true,
          type: 'color',
          default: 'black',
        },
      ],
    };
    expect(obj.build('border')).toEqual([res]);
  });

  test('Build box-shadow', () => {
    const res = {
      property: 'box-shadow',
      type: 'stack',
      preview: true,
      properties: [
        {
          property: 'box-shadow-h',
          type: 'number',
          units: obj.unitsSizeNoPerc,
          default: '0',
        },
        {
          property: 'box-shadow-v',
          type: 'number',
          units: obj.unitsSizeNoPerc,
          default: '0',
        },
        {
          property: 'box-shadow-blur',
          type: 'number',
          units: obj.unitsSizeNoPerc,
          default: '5px',
          min: 0,
        },
        {
          property: 'box-shadow-spread',
          type: 'number',
          units: obj.unitsSizeNoPerc,
          default: '0',
        },
        {
          property: 'box-shadow-color',
          type: 'color',
          default: 'black',
          full: true,
        },
        {
          property: 'box-shadow-type',
          type: 'select',
          default: '',
          options: [
            { id: '', label: 'Outside' },
            { id: 'inset', label: 'Inside' },
          ],
        },
      ],
    };
    const result = obj.build('box-shadow');
    // @ts-ignore
    delete result[0].layerLabel;
    expect(result).toEqual([res]);
  });

  test('Build background', () => {
    const res = {
      property: 'background',
      type: 'stack',
      preview: true,
      detached: true,
      properties: [
        {
          property: 'background-image',
          id: 'background-image-sub',
          default: 'none',
          type: 'file',
          functionName: 'url',
          full: true,
        },
        {
          property: 'background-repeat',
          id: 'background-repeat-sub',
          type: 'select',
          default: 'repeat',
          options: [{ id: 'repeat' }, { id: 'repeat-x' }, { id: 'repeat-y' }, { id: 'no-repeat' }],
        },
        {
          property: 'background-position',
          id: 'background-position-sub',
          type: 'select',
          default: 'left top',
          options: [
            { id: 'left top' },
            { id: 'left center' },
            { id: 'left bottom' },
            { id: 'right top' },
            { id: 'right center' },
            { id: 'right bottom' },
            { id: 'center top' },
            { id: 'center center' },
            { id: 'center bottom' },
          ],
        },
        {
          property: 'background-attachment',
          id: 'background-attachment-sub',
          type: 'select',
          default: 'scroll',
          options: [{ id: 'scroll' }, { id: 'fixed' }, { id: 'local' }],
        },
        {
          property: 'background-size',
          id: 'background-size-sub',
          type: 'select',
          default: 'auto',
          options: [{ id: 'auto' }, { id: 'cover' }, { id: 'contain' }],
        },
      ],
    };
    const result = obj.build('background');
    // @ts-ignore
    delete result[0].layerLabel;
    expect(result).toEqual([res]);
  });

  test('Build transition', () => {
    const res = {
      property: 'transition',
      type: 'stack',
      properties: [
        {
          property: 'transition-property',
          id: 'transition-property-sub',
          type: 'select',
          default: 'width',
          options: [
            { id: 'all' },
            { id: 'width' },
            { id: 'height' },
            { id: 'background-color' },
            { id: 'transform' },
            { id: 'box-shadow' },
            { id: 'opacity' },
          ],
        },
        {
          property: 'transition-duration',
          id: 'transition-duration-sub',
          type: 'number',
          units: obj.unitsTime,
          default: '2s',
          min: 0,
        },
        {
          property: 'transition-timing-function',
          id: 'transition-timing-function-sub',
          type: 'select',
          default: 'ease',
          options: [{ id: 'linear' }, { id: 'ease' }, { id: 'ease-in' }, { id: 'ease-out' }, { id: 'ease-in-out' }],
        },
      ],
    };
    expect(obj.build('transition')).toEqual([res]);
  });

  test('Build perspective', () => {
    const res = {
      property: 'perspective',
      type: 'number',
      units: obj.unitsSize,
      default: '0',
      min: 0,
    };
    expect(obj.build('perspective')).toEqual([res]);
  });

  test('Build transform', () => {
    expect(obj.build('transform')[0].type).toEqual('stack');
  });

  test('Build cursor', () => {
    const res = {
      type: 'select',
      property: 'cursor',
      default: 'auto',
      options: [
        { id: 'auto' },
        { id: 'pointer' },
        { id: 'copy' },
        { id: 'crosshair' },
        { id: 'grab' },
        { id: 'grabbing' },
        { id: 'help' },
        { id: 'move' },
        { id: 'text' },
      ],
    };
    expect(obj.build('cursor')).toEqual([res]);
  });

  test('Build overflow', () => {
    const res = {
      type: 'select',
      property: 'overflow',
      default: 'visible',
      options: [{ id: 'visible' }, { id: 'hidden' }, { id: 'scroll' }, { id: 'auto' }],
    };
    expect(obj.build('overflow')).toEqual([res]);
  });

  test('Build overflow-x', () => {
    const res = {
      type: 'select',
      property: 'overflow-x',
      default: 'visible',
      options: [{ id: 'visible' }, { id: 'hidden' }, { id: 'scroll' }, { id: 'auto' }],
    };
    expect(obj.build('overflow-x')).toEqual([res]);
  });

  test('Build overflow-y', () => {
    const res = {
      type: 'select',
      property: 'overflow-y',
      default: 'visible',
      options: [{ id: 'visible' }, { id: 'hidden' }, { id: 'scroll' }, { id: 'auto' }],
    };
    expect(obj.build('overflow-y')).toEqual([res]);
  });
});
