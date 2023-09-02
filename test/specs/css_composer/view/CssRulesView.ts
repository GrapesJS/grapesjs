import CssRulesView from '../../../../src/css_composer/view/CssRulesView';
import CssRules from '../../../../src/css_composer/model/CssRules';
import EditorModel from '../../../../src/editor/model/Editor';
import { EditorConfig } from '../../../../src/editor/config/config';

describe('CssRulesView', () => {
  let obj: CssRulesView;
  const prefix = 'rules';
  const devices = [
    {
      name: 'Desktop',
      width: '',
      widthMedia: '',
    },
    {
      name: 'Tablet',
      width: '768px',
      widthMedia: '992px',
    },
    {
      name: 'Mobile portrait',
      width: '320px',
      widthMedia: '480px',
    },
  ];
  const mobileFirstDevices = [
    {
      name: 'Mobile portrait',
      width: '',
      widthMedia: '',
    },
    {
      name: 'Tablet',
      width: '768px',
      widthMedia: '992px',
    },
    {
      name: 'Desktop',
      width: '1024px',
      widthMedia: '1280px',
    },
  ];

  function buildEditor(editorOptions: EditorConfig) {
    const col = new CssRules([], {});
    const obj = new CssRulesView({
      collection: col,
      config: {
        em: new EditorModel(editorOptions),
      },
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    document.body.querySelector('#fixtures')!.appendChild(obj.render().el);

    return obj;
  }

  beforeEach(() => {
    obj = buildEditor({
      deviceManager: {
        devices,
      },
    });
  });

  afterEach(() => {
    obj.collection.reset();
  });

  test('Object exists', () => {
    expect(CssRulesView).toBeTruthy();
  });

  test('Collection is empty. Styles structure bootstraped', () => {
    expect(obj.$el.html()).toBeTruthy();
    const foundStylesContainers = obj.$el.find('div');
    expect(foundStylesContainers.length).toEqual(devices.length);

    const sortedDevicesWidthMedia = devices
      .map(dvc => dvc.widthMedia)
      .sort((left, right) => {
        return (
          (Number(right?.replace('px', '')) || Number.MAX_VALUE) - (Number(left?.replace('px', '')) || Number.MAX_VALUE)
        );
      })
      .map(widthMedia => parseFloat(widthMedia));

    foundStylesContainers.each((idx, $styleC) => {
      const width = sortedDevicesWidthMedia[idx];
      expect($styleC.id).toEqual(`${prefix}${width ? `-${width}` : ''}`);
    });
  });

  test('Collection is empty. Styles structure with mobile first bootstraped', () => {
    obj = buildEditor({
      mediaCondition: 'min-width',
      deviceManager: {
        devices: mobileFirstDevices,
      },
    });

    expect(obj.$el.html()).toBeTruthy();
    const foundStylesContainers = obj.$el.find('div');
    expect(foundStylesContainers.length).toEqual(mobileFirstDevices.length);

    const sortedDevicesWidthMedia = mobileFirstDevices
      .map(dvc => dvc.widthMedia)
      .sort((left, right) => {
        const a = Number(left?.replace('px', '')) || Number.MIN_VALUE;
        const b = Number(right?.replace('px', '')) || Number.MIN_VALUE;
        return a - b;
      })
      .map(widthMedia => parseFloat(widthMedia));

    foundStylesContainers.each((idx, $styleC) => {
      const width = sortedDevicesWidthMedia[idx];
      expect($styleC.id).toEqual(`${prefix}${width ? `-${width}` : ''}`);
    });
  });

  test('Add new rule', () => {
    const spy = jest.spyOn(obj, 'addToCollection');
    obj.collection.add({});
    expect(spy).toBeCalledTimes(1);
  });

  test('Add correctly rules with different media queries', () => {
    const rules = [
      {
        selectorsAdd: '#testid',
      },
      {
        selectorsAdd: '#testid2',
        mediaText: '(max-width: 1000px)',
      },
      {
        selectorsAdd: '#testid3',
        mediaText: '(min-width: 900px)',
      },
      {
        selectorsAdd: '#testid4',
        mediaText: 'screen and (max-width: 900px) and (min-width: 600px)',
      },
    ];
    obj.collection.add(rules);
    const stylesCont = obj.el.querySelector(`#${obj.className}`)!;
    expect(stylesCont.children.length).toEqual(rules.length);
  });

  test('Render new rule', () => {
    obj.collection.add({});
    expect(obj.$el.find(`#${prefix}`).html()).toBeTruthy();
  });
});
