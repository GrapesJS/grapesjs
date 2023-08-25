import Component from '../../../src/dom_components/model/Component';
import ComponentTextView from '../../../src/dom_components/view/ComponentTextView';
import Sorter from '../../../src/utils/Sorter';

describe('Sorter', () => {
  let fixture: HTMLElement;
  let obj: Sorter;
  let parent: HTMLElement;
  let plh: HTMLElement;
  let html = '';
  const cmpViewOpts: any = { config: {} };

  beforeAll(function () {
    fixture = document.createElement('div');
    fixture.setAttribute('class', 'sorter-fixture');
  });

  beforeEach(() => {
    parent = document.createElement('div');
    parent.setAttribute('class', 'parent1');
    plh = document.createElement('div');
    document.body.appendChild(parent);
    obj = new Sorter({ container: '.parent1' } as any);
    document.body.appendChild(fixture);
    fixture.appendChild(parent);
    html = `
      <div id="el1" style="overflow: hidden;">
        <div id="el2">ba
            <p id="baa">baa</p>
            <span id="elspan">bab</span>
            <span id="bac" style="display:block;">bac</span>
            <div id="eldiv">eldiv</div>
        </div>
      </div>
      <div id="a">
        <div id="aa">aa
          <p id="aaa">aaa</p>
          <span id="aab">aab</span>
          <span id="aac" style="display:block;">aac</span>
        </div>
        <div id="ab" style="float: left;">ab</div>
        <div id="ac" style="position: absolute;">ac
          <div id="aca" style="float: left;">aca</div>
          <div id="acb">acb</div>
        </div>
        <div id="ad" style="overflow: hidden;">ad
          <p id="ada">ada</p>
          <span id="adb">adb</span>
          <span id="adc" style="display:block;">adc</span>
        </div>
      </div>`;
  });

  afterEach(() => {
    document.body.removeChild(fixture);
  });

  test('matches class', () => {
    var el = document.createElement('div');
    el.setAttribute('class', 'test test2');
    parent.appendChild(el);
    expect(obj.matches(el, '.test')).toEqual(true);
    expect(obj.matches(el, '.test2')).toEqual(true);
    expect(obj.matches(el, '.test3')).toEqual(false);
  });

  test('matches id', () => {
    var el = document.createElement('div');
    el.setAttribute('id', 'test2');
    parent.appendChild(el);
    expect(obj.matches(el, '#test2')).toEqual(true);
    expect(obj.matches(el, '.test2')).toEqual(false);
    expect(obj.matches(el, '#test')).toEqual(false);
  });

  test('matches tag', () => {
    var el = document.createElement('span');
    parent.appendChild(el);
    expect(obj.matches(el, 'span')).toEqual(true);
    expect(obj.matches(el, 'div')).toEqual(false);
    expect(obj.matches(el, '*')).toEqual(true);
  });

  test('Creates placeholder', () => {
    expect(obj.createPlaceholder().className).toEqual('placeholder');
  });

  test('isInFlow to overflow hidden', () => {
    parent.innerHTML = html;
    var el = parent.querySelector('#el1') as HTMLElement;
    expect(obj.isInFlow(el)).toEqual(false);
  });

  test('isInFlow inner to overflow', () => {
    parent.innerHTML = html;
    var el = parent.querySelector('#el2') as HTMLElement;
    if (!el) {
      console.log('phantom issue');
      return;
    }
    expect(obj.isInFlow(el)).toEqual(true);
  });

  test('isInFlow for span', () => {
    parent.innerHTML = html;
    var el = parent.querySelector('#elspan') as HTMLElement;
    expect(obj.isInFlow(el)).toEqual(false);
  });

  test('isInFlow for div #a', () => {
    parent.innerHTML = html;
    var el = parent.querySelector('#a') as HTMLElement;
    if (!el) {
      console.log('phantom issue');
      return;
    }
    expect(obj.isInFlow(el)).toEqual(true);
  });

  test('isInFlow for div #aa', () => {
    parent.innerHTML = html;
    var el = parent.querySelector('#aa') as HTMLElement;
    if (!el) {
      console.log('phantom issue');
      return;
    }
    expect(obj.isInFlow(el)).toEqual(true);
  });

  test('isInFlow for p #aaa', () => {
    parent.innerHTML = html;
    var el = parent.querySelector('#aaa') as HTMLElement;
    if (!el) {
      console.log('phantom issue');
      return;
    }
    expect(obj.isInFlow(el)).toEqual(true);
  });

  test('isInFlow for span #aab', () => {
    parent.innerHTML = html;
    var el = parent.querySelector('#aab') as HTMLElement;
    expect(obj.isInFlow(el)).toEqual(false);
  });

  test('isInFlow for span #aac with display block', () => {
    parent.innerHTML = html;
    var el = parent.querySelector('#aac') as HTMLElement;
    if (!el)
      // in phantom doesnt work
      return;
    expect(obj.isInFlow(el)).toEqual(true);
  });

  test('isInFlow for div #ab with float left', () => {
    parent.innerHTML = html;
    var el = parent.querySelector('#ab') as HTMLElement;
    expect(obj.isInFlow(el)).toEqual(false);
  });

  test('isInFlow for div #ac in absolute', () => {
    parent.innerHTML = html;
    var el = parent.querySelector('#ac') as HTMLElement;
    expect(obj.isInFlow(el)).toEqual(false);
  });

  test('isInFlow for div #acb inside absolute', () => {
    parent.innerHTML = html;
    var el = parent.querySelector('#acb') as HTMLElement;
    if (!el) {
      console.log('phantom issue');
      return;
    }
    expect(obj.isInFlow(el)).toEqual(true);
  });

  test('isInFlow for div #ad overflow hidden', () => {
    parent.innerHTML = html;
    var el = parent.querySelector('#ad') as HTMLElement;
    expect(obj.isInFlow(el)).toEqual(false);
  });

  describe('Closest method', () => {
    let parent2: HTMLElement;
    let parent3: HTMLElement;

    beforeEach(() => {
      parent2 = document.createElement('span');
      parent2.setAttribute('class', 'parent2');
      parent3 = document.createElement('div');
      parent3.setAttribute('class', 'parent3');
      parent.appendChild(parent2);
      parent2.appendChild(parent3);
    });

    test('Closest by class', () => {
      var el = document.createElement('div');
      parent3.appendChild(el);
      expect(obj.closest(el, '.parent2')).toEqual(parent2);
      expect(obj.closest(el, '.parent3')).toEqual(parent3);
      expect(obj.closest(el, '.parent1')).toEqual(parent);
    });

    test('Closest by tag', () => {
      var el = document.createElement('div');
      el.setAttribute('class', 'el');
      parent3.appendChild(el);
      expect(obj.closest(el, 'span')).toEqual(parent2);
      expect(obj.closest(el, 'div')).toEqual(parent3);
      expect(obj.closest(el, '*')).toEqual(parent3);
    });
  });

  describe.skip('With elements', () => {
    let vertDims: any[];
    let parent2: HTMLElement;
    let parent3: HTMLElement;
    let sib1: HTMLElement;
    let sib2: HTMLElement;
    let sib3: HTMLElement;
    let sib4: HTMLElement;
    let el: HTMLElement;

    beforeEach(() => {
      parent2 = document.createElement('span');
      parent2.setAttribute('class', 'parent2');
      parent3 = document.createElement('div');
      parent3.setAttribute('class', 'parent3');
      parent.appendChild(parent2);
      parent2.appendChild(parent3);
      el = document.createElement('div');
      el.setAttribute('class', 'el');
      parent3.appendChild(el);

      sib1 = document.createElement('div');
      sib2 = document.createElement('div');
      sib3 = document.createElement('div');
      sib4 = document.createElement('div');
      sib1.style.width = '100px';
      sib1.style.height = '50px';
      sib2.style.width = '100px';
      sib2.style.height = '50px';
      sib3.style.width = '100px';
      sib3.style.height = '50px';
      sib3.style.float = 'left';
      sib4.style.width = '70px';
      sib4.style.height = '50px';
      sib4.style.float = 'left';
      el.appendChild(sib1);
      el.appendChild(sib2);
      el.appendChild(sib3);
      el.appendChild(sib4);

      vertDims = [
        [0, 0, 50, 100, true],
        [50, 0, 50, 100, true],
        [100, 0, 50, 100, true],
        [150, 0, 50, 70, true],
      ];
    });

    test('startSort inits correctly inits', () => {
      obj.startSort(el);
      expect(obj.moved).toEqual(0);
      expect(obj.plh!.style.display).toEqual('none');
    });

    test('onMove', () => {
      var target = document.createElement('div');
      obj.startSort(el);
      obj.onMove({
        pageX: 0,
        pageY: 0,
        target: target,
      } as any);
      expect(obj.moved).toEqual(1);
    });

    test('getDim from element', () => {
      var subPos = obj.offset(sib1);
      var top = subPos.top;
      var left = subPos.left;
      var result = [top, left, 50, 100];
      expect(obj.getDim(sib1)).toEqual(result);
    });

    test('getChildrenDim from element', () => {
      el.style.position = 'absolute';
      el.style.top = '0';
      var ch = obj.getChildrenDim(el);
      ch = ch.map(v => {
        // @ts-ignore
        return v.slice(0, 5);
      });
      var subPos = obj.offset(sib1);
      var top = subPos.top;
      var left = subPos.left;
      var result = [
        [top, left, 50, 100, true],
        [top + 50, left + 0, 50, 100, true],
        [top + 100, left + 0, 50, 100, true],
        [top + 100, left + 100, 50, 70, true],
      ];
      expect(ch).toEqual(result);
    });

    test('nearBorders', () => {
      obj.borderOffset = 10;
      var dim = [0, 0, 100, 200] as any;
      expect(obj.nearBorders(dim, 20, 15)).toEqual(false);
      expect(obj.nearBorders(dim, 3, 4)).toEqual(true);
      expect(obj.nearBorders(dim, 500, 500)).toEqual(true);
    });

    test('dimsFromTarget', () => {
      var child1 = document.createElement('div');
      var child2 = document.createElement('div');
      child1.style.width = '30px';
      child1.style.height = '30px';
      child2.style.width = '30px';
      child2.style.height = '20px';
      sib3.appendChild(child1);
      sib3.appendChild(child2);

      var subPos = obj.offset(sib1);
      var top = subPos.top;
      var left = subPos.left;
      var topSib3 = top + 100;
      var leftSib3 = left + 0;
      var resultParent = [
        [top, left, 50, 100, true],
        [top + 50, left + 0, 50, 100, true],
        [topSib3, leftSib3, 50, 100, true],
        [top + 100, left + 100, 50, 70, true],
      ];
      var resultChildren = [
        [topSib3, leftSib3, 30, 30, true],
        [topSib3 + 30, left + 0, 20, 30, true],
      ];

      var dims = obj.dimsFromTarget(sib3);
      dims = dims.map(v => {
        // @ts-ignore
        return v.slice(0, 5);
      });

      expect(dims).toEqual(resultParent);

      // Inside target
      var dims = obj.dimsFromTarget(sib3, leftSib3 + 15, topSib3 + 15);
      dims = dims.map(function (v) {
        // @ts-ignore
        return v.slice(0, 5);
      });
      expect(dims).toEqual(resultChildren);

      // Exactly on border
      var bOffset = obj.borderOffset;
      var dims = obj.dimsFromTarget(sib3, leftSib3 + bOffset, topSib3 + bOffset);
      dims = dims.map(function (v) {
        // @ts-ignore
        return v.slice(0, 5);
      });
      expect(dims).toEqual(resultChildren);

      // Slightly near border
      var dims = obj.dimsFromTarget(sib3, leftSib3 + bOffset - 3, topSib3 + bOffset);
      dims = dims.map(function (v) {
        // @ts-ignore
        return v.slice(0, 5);
      });
      expect(dims).toEqual(resultParent);
    });

    describe('findPosition', () => {
      beforeEach(() => {});

      test('Vertical dimensions', () => {
        var result = { index: 0, method: 'before' };
        expect(obj.findPosition(vertDims, -10, -10)).toEqual(result);
        expect(obj.findPosition(vertDims, 0, 0)).toEqual(result);
        expect(obj.findPosition(vertDims, 10, 10)).toEqual(result);

        var result = { index: 1, method: 'before' };
        expect(obj.findPosition(vertDims, 10, 30)).toEqual(result);
        expect(obj.findPosition(vertDims, 10, 70)).toEqual(result);

        var result = { index: 2, method: 'before' };
        expect(obj.findPosition(vertDims, 10, 76)).toEqual(result);

        var result = { index: 3, method: 'before' };
        expect(obj.findPosition(vertDims, 100, 140)).toEqual(result);
        expect(obj.findPosition(vertDims, 100, 160)).toEqual(result);

        var result = { index: 3, method: 'after' };
        expect(obj.findPosition(vertDims, 1000, 1000)).toEqual(result);
      });
    });

    describe('movePlaceholder', () => {
      beforeEach(() => {
        vertDims = [
          [0, 10, 50, 100, true],
          [50, 20, 50, 70, true],
          [100, 30, 50, 100, true],
          [150, 40, 50, 70, true],
        ];
      });

      test('Vertical dimensions with before position', () => {
        var pos = { index: 2, method: 'before', indexEl: 0 };
        obj.movePlaceholder(plh, vertDims, pos);
        var style = plh.style;
        expect(style.top).toEqual('100px');
        expect(style.left).toEqual('30px');
        expect(style.width).toEqual('100px');
      });

      test('Vertical dimensions with after position', () => {
        var pos = { index: 1, method: 'after', indexEl: 0 };
        obj.movePlaceholder(plh, vertDims, pos);
        var style = plh.style;
        expect(style.top).toEqual('100px');
        expect(style.left).toEqual('20px');
        expect(style.width).toEqual('70px');
      });
    });
  });

  describe('Valid Target with components', () => {
    describe('Droppable', () => {
      let parentModel;
      let parentView: ComponentTextView;

      beforeEach(() => {
        parentModel = new Component({
          droppable: (srcModel, trgModel) => {
            return srcModel.getEl()!.className === 'canDrop';
          },
        });
        parentView = new ComponentTextView({
          ...cmpViewOpts,
          model: parentModel,
        });
      });

      afterEach(() => {
        parentView.remove();
      });

      test('Droppable function', () => {
        var srcModel = new Component({
          tagName: 'div',
          draggable: true,
          content: 'Content text',
          attributes: { class: 'canDrop' },
        });
        var srcView = new ComponentTextView({
          ...cmpViewOpts,
          model: srcModel,
        });

        expect(obj.validTarget(parentView.el, srcView.el).valid).toEqual(true);
      });

      test('Not droppable function', () => {
        var srcModel = new Component({
          tagName: 'div',
          draggable: true,
          content: 'Content text',
          attributes: { class: 'cannotDrop' },
        });
        var srcView = new ComponentTextView({
          ...cmpViewOpts,
          model: srcModel,
        });

        expect(obj.validTarget(parentView.el, srcView.el).valid).toEqual(false);
      });
    });

    describe('Draggable', () => {
      var srcModel;
      var srcView: ComponentTextView;

      beforeEach(() => {
        srcModel = new Component({
          draggable: (srcModel, trgModel) => {
            return trgModel.getEl()!.className === 'canDrag';
          },
        });
        srcView = new ComponentTextView({
          ...cmpViewOpts,
          model: srcModel,
        });
      });

      afterEach(() => {
        srcView.remove();
      });

      test('Draggable function', () => {
        var parentModel = new Component({
          tagName: 'div',
          droppable: true,
          content: 'Content text',
          attributes: { class: 'canDrag' },
        });
        var parentView = new ComponentTextView({
          ...cmpViewOpts,
          model: parentModel,
        });

        expect(obj.validTarget(parentView.el, srcView.el).valid).toEqual(true);
      });

      test('Not draggable function', () => {
        var parentModel = new Component({
          tagName: 'div',
          droppable: true,
          content: 'Content text',
          attributes: { class: 'cannotDrag' },
        });
        var parentView = new ComponentTextView({
          ...cmpViewOpts,
          model: parentModel,
        });

        expect(obj.validTarget(parentView.el, srcView.el).valid).toEqual(false);
      });
    });
  });
  describe('Parents', () => {
    let child00: Component;
    let child01: Component;
    let child0: Component;
    let child10: Component;
    let child1: Component;
    let child2: Component;
    let root: Component;

    beforeAll(() => {
      child00 = new Component({
        tagName: 'div',
        name: 'child00',
      });
      child01 = new Component({
        tagName: 'div',
        name: 'child01',
      });
      child0 = new Component({
        tagName: 'div',
        name: 'child0',
        // @ts-ignore
        components: [child00, child01],
      });
      child10 = new Component({
        tagName: 'div',
        name: 'child10',
      });
      child1 = new Component({
        tagName: 'div',
        name: 'child1',
        // @ts-ignore
        components: [child10],
      });
      child2 = new Component({
        tagName: 'div',
        name: 'child2',
      });
      root = new Component({
        tagName: 'div',
        name: 'root',
        // @ts-ignore
        components: [child0, child1, child2],
      });
    });
    test('Parents', () => {
      expect(obj.parents(root)).toEqual([root]);
      expect(obj.parents(child0)).toEqual([child0, root]);
      expect(obj.parents(child00)).toEqual([child00, child0, root]);
    });
    test('Sort', () => {
      const withParents = (model: Component) => ({ model, parents: obj.parents(model) });
      expect(obj.sort(withParents(child00), withParents(child1))).toEqual(1);
      expect(obj.sort(withParents(child00), withParents(child01))).toEqual(1);
      expect(obj.sort(withParents(child00), withParents(child10))).toEqual(1);
      expect(obj.sort(withParents(child1), withParents(child2))).toEqual(1);
      expect(obj.sort(withParents(child10), withParents(child2))).toEqual(1);

      expect(obj.sort(withParents(child1), withParents(child00))).toEqual(-1);
      expect(obj.sort(withParents(child01), withParents(child00))).toEqual(-1);
      expect(obj.sort(withParents(child10), withParents(child00))).toEqual(-1);
      expect(obj.sort(withParents(child2), withParents(child1))).toEqual(-1);
      expect(obj.sort(withParents(child2), withParents(child10))).toEqual(-1);
    });
  });
});
