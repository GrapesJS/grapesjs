const Selector = require('selector_manager/model/Selector');
const Selectors = require('selector_manager/model/Selectors');

module.exports = {
  run() {
      describe('Selector', () => {
        var obj;

        beforeEach(() => {
          obj  = new Selector();
        });

        afterEach(() => {
          obj = null;
        });

        it('Has name property', () => {
          expect(obj.has('name')).toEqual(true);
        });

        it('Has label property', () => {
          expect(obj.has('label')).toEqual(true);
        });

        it('Has active property', () => {
          expect(obj.has('active')).toEqual(true);
        });

        it('escapeName test', () => {
          expect(Selector.escapeName('@Te sT*')).toEqual('-Te-sT-');
        });

        it('Name is corrected at instantiation', () => {
          obj  = new Selector({ name: '@Te sT*'});
          expect(obj.get('name')).toEqual('-Te-sT-');
        });


    });

    describe('Selectors', () => {
        var obj;

        beforeEach(() => {
          obj = new Selectors();
        });

        it('Creates collection item correctly', () => {
          var c = new Selectors();
          var m = c.add({});
          expect(m instanceof Selector).toEqual(true);
        });

        it('getFullString with single class', () => {
          obj.add({name: 'test'});
          expect(obj.getFullString()).toEqual('.test');
        });

        it('getFullString with multiple classes', () => {
          obj.add([{name: 'test'}, {name: 'test2'}]);
          expect(obj.getFullString()).toEqual('.test.test2');
        });

        it('getFullString with mixed selectors', () => {
          obj.add([{name: 'test'}, {name: 'test2', type: Selector.TYPE_ID}]);
          expect(obj.getFullString()).toEqual('.test#test2');
        });

    });
  }
};
