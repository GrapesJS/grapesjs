var path = 'CodeManager/model/';
define([path + 'HtmlGenerator',
  path + 'CssGenerator',
  'DomComponents/model/Component',
  'CssComposer'],
  function(HtmlGenerator, CssGenerator, Component, CssComposer) {

    return {
      run : function(){
          describe('HtmlGenerator', function() {
            beforeEach(function () {
              this.obj  = new HtmlGenerator();
            });

            afterEach(function () {
              delete this.obj;
            });

            it('Build correctly one component', function() {
              var comp = new Component();
              this.obj.build(comp).should.equal('');
            });

            it('Build correctly empty component inside', function() {
              var comp = new Component();
              var m1 = comp.get('components').add({});
              this.obj.build(comp).should.equal('<div></div>');
            });

            it('Build correctly not empty component inside', function() {
              var comp = new Component();
              var m1 = comp.get('components').add({
                tagName: 'article',
                attributes: {
                  'data-test1': 'value1',
                  'data-test2': 'value2'
                }
              });
              this.obj.build(comp).should.equal('<article data-test1="value1" data-test2="value2"></article>');
            });

            it('Build correctly component with classes', function() {
              var comp = new Component();
              var m1 = comp.get('components').add({
                tagName: 'article',
                attributes: {
                  'data-test1': 'value1',
                  'data-test2': 'value2'
                }
              });
              ['class1', 'class2'].forEach(function(item){
                m1.get('classes').add({name: item});
              });
              this.obj.build(comp).should.equal('<article class="class1 class2" data-test1="value1" data-test2="value2"></article>');
            });
        });

        describe('CssGenerator', function() {
          beforeEach(function () {
              this.obj  = new CssGenerator();
            });

            afterEach(function () {
              delete this.obj;
            });

            it('Build correctly one component', function() {
              var comp = new Component();
              this.obj.build(comp).should.equal('');
            });

            it('Build correctly empty component inside', function() {
              var comp = new Component();
              var m1 = comp.get('components').add({tagName: 'article'});
              this.obj.build(comp).should.equal('');
            });

            it('Build correctly component with style inside', function() {
              var comp = new Component();
              var m1 = comp.get('components').add({
                tagName: 'article',
                style: {
                  'prop1': 'value1',
                  'prop2': 'value2'
                }
              });
              this.obj.build(comp).should.equal('#' + m1.cid +'{prop1:value1;prop2:value2;}');
            });

            it('Build correctly component with class styled', function() {
              var comp = new Component();
              var m1 = comp.get('components').add({tagName: 'article'});
              var cls1 = m1.get('classes').add({name: 'class1'});

              var cssc = new CssComposer();
              var rule = cssc.newRule(cls1);
              rule.set('style',{'prop1':'value1', 'prop2':'value2'});
              cssc.addRule(rule);

              this.obj.build(comp, cssc).should.equal('.class1{prop1:value1;prop2:value2;}');
            });

            it('Build correctly component with class styled', function() {
              var comp = new Component();
              var m1 = comp.get('components').add({tagName: 'article'});
              var cls1 = m1.get('classes').add({name: 'class1'});

              var cssc = new CssComposer();
              var rule = cssc.newRule(cls1);
              rule.set('style',{'prop1':'value1', 'prop2':'value2'});
              rule.set('state', 'hover');
              cssc.addRule(rule);

              this.obj.build(comp, cssc).should.equal('.class1:hover{prop1:value1;prop2:value2;}');
            });


            it('Build correctly with more classes', function() {
              var comp = new Component();
              var m1 = comp.get('components').add({tagName: 'article'});
              var cls1 = m1.get('classes').add({name: 'class1'});
              var cls2 = m1.get('classes').add({name: 'class2'});

              var cssc = new CssComposer();
              var rule = cssc.newRule([cls1, cls2]);
              rule.set('style',{'prop1':'value1', 'prop2':'value2'});
              cssc.addRule(rule);

              this.obj.build(comp, cssc).should.equal('.class1.class2{prop1:value1;prop2:value2;}');
              this.obj.build(comp, cssc).should.equal('.class1.class2{prop1:value1;prop2:value2;}');
            });

            it('Build correctly with class styled out', function() {
              var comp = new Component();
              var m1 = comp.get('components').add({tagName: 'article'});
              var cls1 = m1.get('classes').add({name: 'class1'});
              var cls2 = m1.get('classes').add({name: 'class2'});

              var cssc = new CssComposer();
              var rule = cssc.newRule([cls1, cls2]);
              rule.set('style',{'prop1':'value1'});
              cssc.addRule(rule);
              var rule2 = cssc.newRule(cls2);
              rule2.set('style',{'prop2':'value2'});
              cssc.addRule(rule2);

              this.obj.build(comp, cssc).should.equal('.class1.class2{prop1:value1;}.class2{prop2:value2;}');
            });

            it('Rule with media query', function() {
              var comp = new Component();
              var m1 = comp.get('components').add({tagName: 'article'});
              var cls1 = m1.get('classes').add({name: 'class1'});
              var cls2 = m1.get('classes').add({name: 'class2'});

              var cssc = new CssComposer();
              var rule = cssc.newRule([cls1, cls2]);
              rule.set('style',{'prop1':'value1'});
              rule.set('maxWidth', '999px');
              cssc.addRule(rule);

              this.obj.build(comp, cssc).should.equal('@media (max-width: 999px){.class1.class2{prop1:value1;}}');
            });

            it('Rules mixed with media queries', function() {
              var comp = new Component();
              var m1 = comp.get('components').add({tagName: 'article'});
              var cls1 = m1.get('classes').add({name: 'class1'});
              var cls2 = m1.get('classes').add({name: 'class2'});

              var cssc = new CssComposer();

              var rule = cssc.newRule([cls1, cls2]);
              rule.set('style',{'prop1':'value1'});
              cssc.addRule(rule);
              var rule2 = cssc.newRule(cls2);
              rule2.set('style',{'prop2':'value2'});
              cssc.addRule(rule2);

              var rule3 = cssc.newRule(cls1, '', '999px');
              rule3.set('style',{'prop3':'value3'});
              cssc.addRule(rule3);
              var rule4 = cssc.newRule(cls2, '', '999px');
              rule4.set('style',{'prop4':'value4'});
              cssc.addRule(rule4);

              var rule5 = cssc.newRule(cls1, '', '100px');
              rule5.set('style',{'prop5':'value5'});
              cssc.addRule(rule5);

              this.obj.build(comp, cssc).should.equal('.class1.class2{prop1:value1;}.class2{prop2:value2;}'+
                '@media (max-width: 999px){.class1{prop3:value3;}.class2{prop4:value4;}}'+
                '@media (max-width: 100px){.class1{prop5:value5;}}');
            });

            it("Avoid useless code", function() {
              var comp = new Component();
              var m1 = comp.get('components').add({tagName: 'article'});
              var cls1 = m1.get('classes').add({name: 'class1'});

              var cssc = new CssComposer();
              var rule = cssc.newRule(cls1);
              rule.set('style',{'prop1':'value1', 'prop2':'value2'});
              cssc.addRule(rule);

              comp.get('components').remove(m1);
              this.obj.build(comp, cssc).should.equal('');
            });
        })
      }
    };

});