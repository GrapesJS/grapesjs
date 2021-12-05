export const typeForm = 'form';
export const typeInput = 'input';
export const typeTextarea = 'textarea';
export const typeSelect = 'select';
export const typeCheckbox = 'checkbox';
export const typeRadio = 'radio';
export const typeButton = 'button';
export const typeLabel = 'label';
export const typeOption = 'option';

export default function(editor, opt = {}) {
  const domc = editor.DomComponents;

  const idTrait = {
    name: 'id',
  };

  const forTrait = {
    name: 'for',
  };

  const nameTrait = {
    name: 'name',
  };

  const placeholderTrait = {
    name: 'placeholder',
  };

  const valueTrait = {
    name: 'value',
  };

  const requiredTrait = {
    type: 'checkbox',
    name: 'required',
  };

  const checkedTrait = {
    type: 'checkbox',
    name: 'checked',
  };

  domc.addType(typeForm, {
    isComponent: el => el.tagName == 'FORM',

    model: {
      defaults: {
        tagName: 'form',
        droppable: ':not(form)',
        draggable: ':not(form)',
        attributes: { method: 'get' },
        traits: [{
          type: 'select',
          name: 'method',
          options: [
            {value: 'get', name: 'GET'},
            {value: 'post', name: 'POST'},
          ],
        }, {
          name: 'action',
        }],
      },
    },

    view: {
      events: {
        submit: e => e.preventDefault(),
      }
    },
  });





  // INPUT
  domc.addType(typeInput, {
    isComponent: el => el.tagName == 'INPUT',

    model: {
      defaults: {
        tagName: 'input',
        draggable: 'form, form *',
        droppable: false,
        highlightable: false,
        attributes: { type: 'text' },
        traits: [
          nameTrait,
          placeholderTrait,
          {
            type: 'select',
            name: 'type',
            options: [
              { value: 'text' },
              { value: 'email' },
              { value: 'password' },
              { value: 'number' },
            ]
          },
          requiredTrait
        ],
      },
    },

    extendFnView: ['updateAttributes'],
    view: {
      updateAttributes() {
        this.el.setAttribute('autocomplete', 'off');
      },
    }
  });





  // TEXTAREA
  domc.addType(typeTextarea, {
    extend: typeInput,
    isComponent: el => el.tagName == 'TEXTAREA',

    model: {
      defaults: {
        tagName: 'textarea',
        attributes: {},
        traits: [
          nameTrait,
          placeholderTrait,
          requiredTrait
        ]
      },
    },
  });





  // OPTION
  domc.addType(typeOption, {
    isComponent: el => el.tagName == 'OPTION',

    model: {
      defaults: {
        tagName: 'option',
        layerable: false,
        droppable: false,
        draggable: false,
        highlightable: false,
      },
    },
  });

  const createOption = (value, name) => ({ type: typeOption, components: name, attributes: { value } });





  // SELECT
  domc.addType(typeSelect, {
    extend: typeInput,
    isComponent: el => el.tagName == 'SELECT',

    model: {
      defaults: {
        tagName: 'select',
        components: [
          createOption('opt1', 'Option 1'),
          createOption('opt2', 'Option 2'),
        ],
        traits: [
          nameTrait,
          {
            name: 'options',
            type: 'select-options'
          },
          requiredTrait
        ],
      },
    },

    view: {
      events: {
        mousedown: e => e.preventDefault(),
      },
    },
  });





  // CHECKBOX
  domc.addType(typeCheckbox, {
    extend: typeInput,
    isComponent: el => el.tagName == 'INPUT' && el.type == 'checkbox',

    model: {
      defaults: {
        copyable: false,
        attributes: { type: 'checkbox' },
        traits: [
          idTrait,
          nameTrait,
          valueTrait,
          requiredTrait,
          checkedTrait
        ],
      },
    },

    view: {
      events: {
        click: e => e.preventDefault(),
      },

      init() {
        this.listenTo(this.model, 'change:attributes:checked', this.handleChecked);
      },

      handleChecked() {
        this.el.checked = !!this.model.get('attributes').checked;
      },
    },
  });





  // RADIO
  domc.addType(typeRadio, {
    extend: typeCheckbox,
    isComponent: el => el.tagName == 'INPUT' && el.type == 'radio',

    model: {
      defaults: {
        attributes: { type: 'radio' },
      },
    },
  });





  domc.addType(typeButton, {
    extend: typeInput,
    isComponent: el => el.tagName == 'BUTTON',

    model: {
      defaults: {
        tagName: 'button',
        attributes: { type: 'button' },
        text: 'Send',
        traits: [
          {
            name: 'text',
            changeProp: true,
          }, {
            type: 'select',
            name: 'type',
            options: [
              { value: 'button' },
              { value: 'submit' },
              { value: 'reset' },
            ]
        }]
      },

      init() {
        const comps = this.components();
        const tChild =  comps.length === 1 && comps.models[0];
        const chCnt = (tChild && tChild.is('textnode') && tChild.get('content')) || '';
        const text = chCnt || this.get('text');
        this.set({ text });
        this.on('change:text', this.__onTextChange);
        (text !== chCnt) && this.__onTextChange();
      },

      __onTextChange() {
        this.components(this.get('text'));
      },
    },

    view: {
      events: {
        click: e => e.preventDefault(),
      },
    },
  });





  // LABEL
  domc.addType(typeLabel, {
    extend: 'text',
    isComponent: el => el.tagName == 'LABEL',

    model: {
      defaults: {
        tagName: 'label',
        components: 'Label',
        traits: [forTrait],
      },
    },
  });
}
