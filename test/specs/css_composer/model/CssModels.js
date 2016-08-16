var path = 'CssComposer/model/';
define([path + 'CssRule',
        path + 'CssRules',
        path + 'Selectors',
        'SelectorManager/model/Selector'],
	function(CssRule, CssRules, Selectors, Selector) {

    return {
      run : function(){
          describe('CssRule', function() {

            beforeEach(function () {
              this.obj  = new CssRule();
            });

            afterEach(function () {
              delete this.obj;
            });

            it('Has selectors property', function() {
              this.obj.has('selectors').should.equal(true);
            });

            it('Has style property', function() {
              this.obj.has('style').should.equal(true);
            });

            it('Has state property', function() {
              this.obj.has('state').should.equal(true);
            });

            it('No default selectors', function() {
              this.obj.get('selectors').length.should.equal(0);
            });

            it('Compare returns true with the same selectors', function() {
              var s1 = this.obj.get('selectors').add({ name: 'test1' });
              var s2 = this.obj.get('selectors').add({ name: 'test2' });
              this.obj.compare([s1, s2]).should.equal(true);
            });

            it('Compare with different state', function() {
              var s1 = this.obj.get('selectors').add({ name: 'test1' });
              var s2 = this.obj.get('selectors').add({ name: 'test2' });
              this.obj.set('state','hover');
              this.obj.compare([s1, s2]).should.equal(false);
              this.obj.compare([s1, s2], 'hover').should.equal(true);
            });

            it('Compare with different maxWidth', function() {
              var s1 = this.obj.get('selectors').add({ name: 'test1' });
              var s2 = this.obj.get('selectors').add({ name: 'test2' });
              this.obj.set('state','hover');
              this.obj.set('maxWidth','1000');
              this.obj.compare([s1, s2]).should.equal(false);
              this.obj.compare([s1, s2], 'hover').should.equal(false);
              this.obj.compare([s2, s1], 'hover', '1000').should.equal(true);
            });

        });

        describe('CssRules', function() {

            it('Creates collection item correctly', function() {
              var c = new CssRules();
              var m = c.add({});
              m.should.be.an.instanceOf(CssRule);
            });

        });

         describe('Selectors', function() {

            it('Creates collection item correctly', function() {
              var c = new Selectors();
              var m = c.add({});
              m.should.be.an.instanceOf(Selector);
            });

        });
      }
    };

});