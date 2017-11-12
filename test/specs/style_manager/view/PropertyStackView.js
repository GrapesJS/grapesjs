const PropertyStackView = require('style_manager/view/PropertyStackView');
const Property = require('style_manager/model/PropertyStack');
const Component = require('dom_components/model/Component');
const Editor = require('editor/model/Editor');
const DomComponents = require('dom_components');

module.exports = {
  run() {

      describe('PropertyStackView', () => {

        let em;
        let dcomp;
        let compOpts;
        var component;
        var fixtures;
        var target;
        var model;
        var view;
        var propName = 'testprop';
        var propValue = 'test1value';
        var defValue = 'test2value';
        var layers = [
          {value: 'lval1'},
          {value: 'lval2 lval22'},
          {value: 'lval3 lval32 lval33'}
        ];
        var properties = [
          {property: 'subprop1'},
          {
            type: 'integer',
            property: 'subprop2',
            defaults: 0,
            units: ['%', 'px']
          },
          {
            type: 'select',
            property: 'subprop3',
            defaults: 'val2',
            list: [
              {value:'val1'},
              {value:'val2'},
              {value:'val3'},
            ]
          },
        ];

        beforeEach(() => {
          em = new Editor({});
          dcomp = new DomComponents();
          compOpts = { em, componentTypes: dcomp.componentTypes };
          target = new Component({}, compOpts);
          component = new Component({}, compOpts);
          target.model = component;
          model = new Property({
            type: 'stack',
            property: propName,
            properties
          });
          view = new PropertyStackView({
            model
          });
          document.body.innerHTML = '<div id="fixtures"></div>';
          fixtures = document.body.firstChild;
          view.render();
          fixtures.appendChild(view.el);
        });

        after(() => {
          component = null;
          view = null;
          model = null;
        });

        it('Rendered correctly', () => {
          var prop = view.el;
          expect(fixtures.querySelector('.property')).toExist();
          expect(prop.querySelector('.label')).toExist();
          expect(prop.querySelector('.field')).toExist();
          expect(prop.querySelector('#add')).toExist();
        });

        it('Layers rendered', () => {
          expect(view.el.querySelector('.layers')).toExist();
        });

        it('Layers wrapper should exist', () => {
          expect(view.el.querySelector('[data-layers-wrapper]')).toExist();
        });

        it('Layers rendered correctly', () => {
          var children = view.el.querySelector('[data-layers-wrapper]').children;
          expect(children.length).toEqual(1);
        });

        it('Input value is on default', () => {
          expect(view.model.get('value')).toEqual('0 val2');
        });

        it('Layers container is empty', () => {
          var layers = view.el.querySelector('.layers');
          expect(layers.innerHTML).toNotExist();
        });

        describe('With layers', () => {

          beforeEach(() => {
            model = new Property({
              type: 'stack',
              property: propName,
              properties,
            });
            view = new PropertyStackView({
              model,
              propTarget: target
            });
            fixtures.innerHTML = '';
            view.render();
            fixtures.appendChild(view.el);
            model.get('layers').add(layers);
          });

          it('Layers inserted', () => {
            expect(view.getLayers().length).toEqual(layers.length);
          });

          it('Add layer', () => {
            view.addLayer();
            expect(view.getLayers().length).toEqual(layers.length + 1);
          });

        });

    });
  }
};
