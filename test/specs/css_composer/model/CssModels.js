var path = 'CssComposer/model/';
define([path + 'CssRule',
        path + 'CssRules',
        path + 'Selectors',
        'ClassManager/model/ClassTag'],
	function(CssRule, CssRules, Selectors, ClassTag) {

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
              m.should.be.an.instanceOf(ClassTag);
            });

        });
      }
    };

});