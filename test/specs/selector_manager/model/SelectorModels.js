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
          expect(obj.escapeName('@Te sT*')).toEqual('-Te-sT-');
        });

        it('Name is corrected at instantiation', () => {
          obj  = new Selector({ name: '@Te sT*'});
          expect(obj.get('name')).toEqual('-Te-sT-');
        });


    });
    describe('Selectors', () => {

        it('Creates collection item correctly', () => {
          var c = new Selectors();
          var m = c.add({});
          expect(m instanceof Selector).toEqual(true);
        });

    });
  }
};
