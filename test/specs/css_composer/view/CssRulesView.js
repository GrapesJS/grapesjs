import CssRulesView from 'css_composer/view/CssRulesView';
import CssRules from 'css_composer/model/CssRules';
import Editor from 'editor/model/Editor';

describe('CssRulesView', () => {
  let obj;
  const prefix = 'rules';
  const devices = [
    {
      name: 'Mobile portrait',
      width: '320px',
      widthMedia: '480px',
    },
    {
      name: 'Tablet',
      width: '768px',
      widthMedia: '992px',
    },
    {
      name: 'Desktop',
      width: '',
      widthMedia: '',
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

  function buildEditor(editorOptions) {
    const col = new CssRules([]);
    const obj = new CssRulesView({
      collection: col,
      config: {
        em: new Editor(editorOptions),
      },
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    document.body.querySelector('#fixtures').appendChild(obj.render().el);

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
          ((right && right.replace('px', '')) || Number.MAX_VALUE) -
          ((left && left.replace('px', '')) || Number.MAX_VALUE)
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

    foundStylesContainers.each((idx, e) => console.log(e.id));

    const sortedDevicesWidthMedia = mobileFirstDevices
      .map(dvc => dvc.widthMedia)
      .sort((left, right) => {
        const a = (left && left.replace('px', '')) || Number.MIN_VALUE;
        const b = (right && right.replace('px', '')) || Number.MIN_VALUE;
        return a - b;
      })
      .map(widthMedia => parseFloat(widthMedia));

    foundStylesContainers.each((idx, $styleC) => {
      const width = sortedDevicesWidthMedia[idx];
      expect($styleC.id).toEqual(`${prefix}${width ? `-${width}` : ''}`);
    });
  });

  test('Add new rule', () => {
    sinon.stub(obj, 'addToCollection');
    obj.collection.add({});
    expect(obj.addToCollection.calledOnce).toBeTruthy();
  });

  test('Add correctly rules with different media queries', () => {
    const foundStylesContainers = obj.$el.find('div');
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
    const stylesCont = obj.el.querySelector(`#${obj.className}`);
    expect(stylesCont.children.length).toEqual(rules.length);
  });

  test('Render new rule', () => {
    obj.collection.add({});
    expect(obj.$el.find(`#${prefix}`).html()).toBeTruthy();
  });
});
