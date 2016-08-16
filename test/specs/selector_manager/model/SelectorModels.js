var path = 'SelectorManager/model/';
define([path + 'Selector',
        path + 'Selectors'],
	function(Selector, Selectors) {

    return {
      run : function(){
          describe('Selector', function() {

            beforeEach(function () {
              this.obj  = new Selector();
            });

            afterEach(function () {
              delete this.obj;
            });

            it('Has name property', function() {
              this.obj.has('name').should.equal(true);
            });

            it('Has label property', function() {
              this.obj.has('label').should.equal(true);
            });

            it('Has active property', function() {
              this.obj.has('active').should.equal(true);
            });

            it('escapeName test', function() {
              this.obj.escapeName('@Te sT*').should.equal('-te-st-');
            });

            it('Name is corrected at instantiation', function() {
              this.obj  = new Selector({ name: '@Te sT*'});
              this.obj.get('name').should.equal('-te-st-');
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