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
      mediaCondition: 'max-width',
      deviceManager: {
        devices,
      },
    });
  });

  afterEach(() => {
    obj.remove();
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
      .map((dvc) => dvc.widthMedia)
      .sort((left, right) => {
        return (
          (Number(right?.replace('px', '')) || Number.MAX_VALUE) - (Number(left?.replace('px', '')) || Number.MAX_VALUE)
        );
      })
      .map((widthMedia) => parseFloat(widthMedia));

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
      .map((dvc) => dvc.widthMedia)
      .sort((left, right) => {
        const a = Number(left?.replace('px', '')) || Number.MIN_VALUE;
        const b = Number(right?.replace('px', '')) || Number.MIN_VALUE;
        return a - b;
      })
      .map((widthMedia) => parseFloat(widthMedia));

    foundStylesContainers.each((idx, $styleC) => {
      const width = sortedDevicesWidthMedia[idx];
      expect($styleC.id).toEqual(`${prefix}${width ? `-${width}` : ''}`);
    });
  });

  test('Add new rule', () => {
    const spy = jest.spyOn(obj, 'addToCollection');
    obj.collection.add({});
    expect(spy).toHaveBeenCalledTimes(1);
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

  test('Places rules without searching the growing rule tree', () => {
    const query = jest.spyOn(obj.el, 'querySelector');
    obj.collection.add([
      { selectorsAdd: '.first', style: { color: 'red' } },
      { selectorsAdd: '.second', style: { color: 'blue' }, mediaText: '(max-width: 480px)' },
    ]);
    expect(query).not.toHaveBeenCalled();
    expect(obj.el.querySelector(`#${prefix}`)!.textContent).toContain('.first{color:red;}');
    expect(obj.el.querySelector(`#${prefix}-480`)!.textContent).toContain('.second{color:blue;}');
  });

  test('Releases old rule views when rendering again', () => {
    const rule = obj.collection.add({ selectorsAdd: '.test', style: { color: 'red' } });
    const previousView = rule.views[0];
    obj.render();
    expect(rule.views).toHaveLength(1);
    expect(rule.views[0]).not.toBe(previousView);
    rule.setStyle({ color: 'blue' });
    expect(previousView.el.textContent).toBe('.test{color:red;}');
    expect(obj.el.textContent).toBe('.test{color:blue;}');
  });

  test('Releases rule views on collection reset and view removal', () => {
    const previous = obj.collection.add({ selectorsAdd: '.previous', style: { color: 'red' } });
    obj.collection.reset([{ selectorsAdd: '.next', style: { color: 'blue' } }]);
    expect(previous.views).toHaveLength(0);
    const next = obj.collection.at(0);
    expect(next.views).toHaveLength(1);
    obj.remove();
    expect(next.views).toHaveLength(0);
    obj.collection.add({ selectorsAdd: '.removed', style: { color: 'green' } });
    expect(obj.collection.at(1).views).toHaveLength(0);
  });

  test('Keeps other frames subscribed when a rules view is removed', () => {
    const rule = obj.collection.add({ selectorsAdd: '.test', style: { color: 'red' } });
    const other = new CssRulesView({ collection: obj.collection, config: obj.config }).render();
    expect(rule.views).toHaveLength(2);
    obj.remove();
    expect(rule.views).toHaveLength(1);
    rule.setStyle({ color: 'blue' });
    expect(other.el.textContent).toBe('.test{color:blue;}');
    other.remove();
    expect(rule.views).toHaveLength(0);
  });
});
