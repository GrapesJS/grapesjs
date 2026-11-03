---
title: Trait Manager
---

# Trait Manager

In GrapesJS, Traits define different parameters and behaviors of a component. Users generally see traits as a component's _Settings_. A common use of traits is to customize element attributes (e.g., `placeholder` for `<input>`). You can also bind traits to component properties and react to their changes.

::: warning
This guide applies to GrapesJS v0.21.9 or higher.<br><br>
To better understand this guide, we recommend reading [Components](Components.html) first.
:::

::: tip
Want traits that look great and work out of the box? [See how the Grapes Studio SDK handles it.](https://app.grapesjs.com/docs-sdk/configuration/components/properties?utm_source=grapesjs-docs&utm_medium=tip#traits)
:::

[[toc]]

## Add Traits to Components

Generally, you define traits as part of a custom component definition or by extending an existing component type. Let's see how to make inputs more customizable in the editor.

All components, by default, contain two traits: `id` and `title` (at the time of writing). So, if you select an input and open the Settings panel, you will see this:

<img :src="$withBase('/default-traits.png')" class="img-ctr-rad" style="max-width: 200px;" alt="Default traits">

We can start by creating a new custom `input` component in this way:

```js
editor.Components.addType('input', {
  isComponent: (el) => el.tagName === 'INPUT',
  model: {
    defaults: {
      traits: [
        // Strings are automatically converted to text types
        'name', // Same as: { type: 'text', name: 'name' }
        'placeholder',
        {
          type: 'select', // Type of the trait
          name: 'type', // (required) The name of the attribute/property to use on the component
          label: 'Type', // The label you will see in Settings
          options: [
            { id: 'text', label: 'Text' },
            { id: 'email', label: 'Email' },
            { id: 'password', label: 'Password' },
            { id: 'number', label: 'Number' },
          ],
        },
        {
          type: 'checkbox',
          name: 'required',
        },
      ],
      // Traits are bound to attributes by default, so we can use
      // attributes to define their initial values
      attributes: { type: 'text', required: true },
    },
  },
});
```

The result will be:

<img :src="$withBase('/input-custom-traits.png')" class="img-ctr-rad" style="max-width: 230px;" alt="Input with custom traits">

You can also use a function to define traits dynamically during component initialization. This is useful if you need to create traits based on other component characteristics.

```js
editor.Components.addType('input', {
  isComponent: (el) => el.tagName === 'INPUT',
  model: {
    defaults: {
      traits(component) {
        const result = [];

        // Example of some logic
        if (component.get('draggable')) {
          result.push('name');
        } else {
          result.push({
            type: 'select',
            // ....
          });
        }

        return result;
      },
    },
  },
});
```

To react to trait changes, you can listen for changes to the corresponding attributes:

```js
editor.Components.addType('input', {
  model: {
    defaults: {
      // ...
    },

    init() {
      this.on('change:attributes:type', this.handleTypeChange);
    },

    handleTypeChange() {
      console.log('Input type changed to: ', this.getAttributes().type);
    },
  },
});
```

As already mentioned, by default, traits modify attributes of the model, but you can also bind them to the properties by using the `changeProp` option.

```js
editor.Components.addType('input', {
  model: {
    defaults: {
      // ...
      traits: [
        {
          name: 'placeholder',
          changeProp: 1,
        },
        // ...
      ],
      // As we switched from attributes to properties, the
      // initial value should be set from the property
      placeholder: 'Initial placeholder',
    },

    init() {
      // The listener also changes from `change:attributes:*` to `change:*`
      this.on('change:placeholder', this.handlePlhChange);
    },
    // ...
  },
});
```

### Categories

It's possible to group your traits into categories, as shown below.

<img :src="$withBase('/trait-categories.png')" class="img-ctr-rad" style="max-width: 250px;" alt="Traits with categories">

```js
const category1 = { id: 'first', label: 'First category' };
const category2 = { id: 'second', label: 'Second category', open: false };

editor.Components.addType('input', {
  model: {
    defaults: {
      // ...
      traits: [
        { name: 'trait-1', category: category1 },
        { name: 'trait-2', category: category1 },
        { name: 'trait-3', category: category2 },
        { name: 'trait-4', category: category2 },
        // Traits without categories will be rendered at the bottom
        { name: 'trait-5' },
        { name: 'trait-6' },
      ],
    },
  },
});
```

## Built-in trait types

GrapesJS comes with a few built-in types that you can use to define your traits:

### Text

Simple text input

```js
{
  type: 'text', // If you don't specify the type, `text` is the default
  name: 'my-trait', // Required and available for all traits
  label: 'My trait', // The label you will see near the input
  // label: false, // If you set label to `false`, the label column will be removed
  placeholder: 'Insert text', // Placeholder to show inside the input
}
```

### Number

Input for numbers

```js
{
  type: 'number',
  // ...
  placeholder: '0-100',
  min: 0, // Minimum number value
  max: 100, // Maximum number value
  step: 5, // Number of steps
}
```

### Checkbox

Simple checkbox input

```js
{
  type: 'checkbox',
  // ...
  valueTrue: 'YES', // Value to assign when checked, default: `true`
  valueFalse: 'NO', // Value to assign when unchecked, default: `false`
}
```

### Select

Select input with options

```js
{
  type: 'select',
  // ...
  options: [ // Array of options
    { id: 'opt1', label: 'Option 1'},
    { id: 'opt2', label: 'Option 2'},
  ]
}
```

### Color

Color picker

```js
{
  type: 'color',
  // ...
}
```

### Button

Button with a command to assign

```js
{
  type: 'button',
  // ...
  text: 'Click me',
  full: true, // Full width button
  command: editor => alert('Hello'),
  // or you can just specify the Command ID
  command: 'some-command',

}
```

## Updating traits at run-time

To change a trait on your component, use the [Component API](/api/component.html):

Traits are stored as a property of the component. To get the complete list of current traits, use this:

```js
const component = editor.getSelected(); // Component selected in canvas
const traits = component.get('traits');
traits.forEach((trait) => console.log(trait.props()));
```

In case you need a single one:

```js
const component = editor.getSelected();
console.log(component.getTrait('type').props()); // Finds by the `name` of the trait
```

To update a property of the trait, do this:

```js
// Let's update `options` of our `type` trait, defined in Input component
const component = editor.getSelected();
component.getTrait('type').set('options', [
  { id: 'opt1', label: 'New option 1'},
  { id: 'opt2', label: 'New option 2'},
]);
// or with multiple values
component.getTrait('type').set({
  label: 'My type',
  options: [...],
});
```

You can also add or remove traits using [`addTrait`](/api/component.html#addtrait)/[`removeTrait`](/api/component.html#removetrait).

```js
// Add new trait
const component = editor.getSelected();
component.addTrait({
  name: 'type',
  ...
}, { at: 0 });
// The `at` option specifies the index at which to place the new trait;
// without it, the trait will be appended at the end of the list

// Remove trait
component.removeTrait('type');
```

## I18n

To use the [I18n module](I18n.html), follow this schema:

```js
{
  en: {
    traitManager: {
      empty: 'Select an element before using Trait Manager',
      label: 'Component settings',
      categories: {
        categoryId: 'Category label',
      },
      traits: {
        // The trait `name` property is used as a key
        labels: {
          href: 'Href label',
        },
        // For built-in traits, like `text` type, these are used on input DOM attributes
        attributes: {
          href: { placeholder: 'eg. https://google.com' },
        },
        // For `select` types, these are used to translate option labels
        options: {
          target: {
            // Here the key is the `id` of the option
            _blank: 'New window',
          },
        },
      },
    },
  }
}
```

## Customization

The default types cover most common properties. If you need a more advanced UI, you can [define your own types](#define-new-trait-type) or create a completely [custom Trait Manager UI](#custom-trait-manager) from scratch.

### Define new Trait type

For most cases, the default types should be enough, but sometimes you might need something more.
In that case, you can define a new type of trait and bind any kind of element to it.

#### Create element

Let's update the default `link` Component with a new kind of trait. These are the default traits for a simple link:

<img :src="$withBase('/default-link-comp.jpg')" class="img-ctr-rad" style="max-width: 210px;" alt="Default link component">

Let's just replace all of its traits with a new one, `href-next`, which will allow the user to select the type of href (e.g., 'url', 'email', etc.).

```js
// Update component
editor.Components.addType('link', {
  model: {
    defaults: {
      traits: [
        {
          type: 'href-next',
          name: 'href',
          label: 'New href',
        },
      ],
    },
  },
});
```

Now you'll see a simple text input because we have not yet defined our new trait type, so let's do it:

```js
editor.Traits.addType('href-next', {
  // Should return a simple HTML string or an HTML element
  createInput({ trait }) {
    // Here we can decide to use properties from the trait
    const traitOpts = trait.get('options') || [];
    const options = traitOpts.length
      ? traitOpts
      : [
          { id: 'url', label: 'URL' },
          { id: 'email', label: 'Email' },
        ];

    // Create a new element container and add some content
    const el = document.createElement('div');
    el.innerHTML = `
      <select class="href-next__type">
        ${options.map((opt) => `<option value="${opt.id}">${opt.label}</option>`).join('')}
      </select>
      <div class="href-next__url-inputs">
        <input class="href-next__url" placeholder="Insert URL"/>
      </div>
      <div class="href-next__email-inputs">
        <input class="href-next__email" placeholder="Insert email"/>
        <input class="href-next__email-subject" placeholder="Insert subject"/>
      </div>
    `;

    // Let's make our content interactive
    const inputsUrl = el.querySelector('.href-next__url-inputs');
    const inputsEmail = el.querySelector('.href-next__email-inputs');
    const inputType = el.querySelector('.href-next__type');
    inputType.addEventListener('change', (ev) => {
      switch (ev.target.value) {
        case 'url':
          inputsUrl.style.display = '';
          inputsEmail.style.display = 'none';
          break;
        case 'email':
          inputsUrl.style.display = 'none';
          inputsEmail.style.display = '';
          break;
      }
    });

    return el;
  },
});
```

In the example above, we created custom inputs, allowing the use of the `option` trait property, and added logic to switch inputs when the type changes. The result looks like this:

<img :src="$withBase('/docs-init-link-trait.jpg')" class="img-ctr-rad" style="max-width: 215px;" alt="Link with traits">

#### Update layout

Before making our trait work, let's look at its layout. You might have noticed that a trait consists of label and input columns. GrapesJS allows you to customize both.

To customize the label, use `createLabel`:

```js
editor.Traits.addType('href-next', {
  // Should return a simple HTML string or an HTML element
  createLabel({ label }) {
    return `<div>
      <div>Before</div>
      ${label}
      <div>After</div>
    </div>`;
  },
  // ...
});
```

You've already seen that you can set `label: false` in a trait definition to remove the label column. To apply this behavior to all instances of a trait type, use the `noLabel` property:

```js
editor.Traits.addType('href-next', {
  noLabel: true,
  // ...
});
```

By default, GrapesJS adds a wrapper around your inputs. This works well for simple inputs but may not suit a complex custom trait. To remove the default wrapper, use the `templateInput` option:

```js
editor.Traits.addType('href-next', {
  // Completely remove the wrapper
  templateInput: '',
  // Use a new wrapper, specifying where to place the input container with the `data-input` attribute
  templateInput: `<div class="custom-input-wrapper">
    Before input
    <div data-input></div>
    After input
  </div>`,
  // It can also be a function that returns an HTML string
  templateInput({ trait }) {
    return '<div ...';
  },
});
```

<img :src="$withBase('/docs-link-trait-raw.jpg')" class="img-ctr-rad" style="max-width: 215px;" alt="Basic custom link trait">

In this case, the result is unstyled, but custom trait types allow you to reuse your own styled inputs, which you may have already designed or implemented in a UI framework.
For now, let's keep the default input wrapper and continue with the integration of our custom trait.

#### Bind to component

The element created in `createInput` is not yet bound to the component, so nothing happens when you update the inputs. Let's bind it now:

```js
editor.Traits.addType('href-next', {
  // ...

  // Update the component based on element changes
  // `elInput` is the result HTMLElement you get from `createInput`
  onEvent({ elInput, component, event }) {
    const inputType = elInput.querySelector('.href-next__type');
    let href = '';

    switch (inputType.value) {
      case 'url':
        const valUrl = elInput.querySelector('.href-next__url').value;
        href = valUrl;
        break;
      case 'email':
        const valEmail = elInput.querySelector('.href-next__email').value;
        const valSubj = elInput.querySelector('.href-next__email-subject').value;
        href = `mailto:${valEmail}${valSubj ? `?subject=${valSubj}` : ''}`;
        break;
    }

    component.addAttributes({ href });
  },
});
```

Most of the trait should now work (you can update it and check the HTML in the code preview). You might wonder how the editor captures input changes and how to control this.
By default, the base trait wrapper listens for the `change` event and calls `onEvent` for each captured event. To be captured, the event must [bubble](https://stackoverflow.com/questions/4616694/what-is-event-bubbling-and-capturing). To update the component on the `input` event instead, change the `eventCapture` property:

```js
editor.Traits.addType('href-next', {
  eventCapture: ['input'], // you can use multiple events in the array
  // ...
});
```

Finally, you might have noticed that the inputs are not initially populated when the component already has an `href` attribute. Handle this in the `onUpdate` method:

```js
editor.Traits.addType('href-next', {
  // ...

  // Update elements on the component change
  onUpdate({ elInput, component }) {
    const href = component.getAttributes().href || '';
    const inputType = elInput.querySelector('.href-next__type');
    let type = 'url';

    if (href.indexOf('mailto:') === 0) {
      const inputEmail = elInput.querySelector('.href-next__email');
      const inputSubject = elInput.querySelector('.href-next__email-subject');
      const mailTo = href.replace('mailto:', '').split('?');
      const email = mailTo[0];
      const params = (mailTo[1] || '').split('&').reduce((acc, item) => {
        const items = item.split('=');
        acc[items[0]] = items[1];
        return acc;
      }, {});
      type = 'email';

      inputEmail.value = email || '';
      inputSubject.value = params.subject || '';
    } else {
      elInput.querySelector('.href-next__url').value = href;
    }

    inputType.value = type;
    inputType.dispatchEvent(new CustomEvent('change'));
  },
});
```

Now the trait will also update when the component changes, for example:

```js
editor.getSelected().addAttributes({ href: 'mailto:new-email@test.com?subject=NewSubject' });
```

To create a custom trait type, you need three methods:

- `createInput` - Where we define our custom HTML element
- `onEvent` - How to update the component when inputs change
- `onUpdate` - How to update inputs on component changes

#### Result

You can see the final result here:
<demo-viewer value="yf6amdqb/10"/>

#### Integrate external UI components

The example above might seem like a lot of code, but most of it handles the native DOM API, with only a little additional logic. A modern UI framework (e.g., Vue or React) can make integration easier. Here's how to integrate a custom [Vue Slider Component](https://github.com/NightCatSama/vue-slider-component) as a trait:

```js
editor.Traits.addType('slider', {
  createInput({ trait }) {
    const vueInst = new Vue({ render: (h) => h(VueSlider) }).$mount();
    const sliderInst = vueInst.$children[0];
    sliderInst.$on('change', (ev) => this.onChange(ev)); // Use onChange to trigger onEvent
    this.sliderInst = sliderInst;
    return vueInst.$el;
  },

  onEvent({ component }) {
    const value = this.sliderInst.getValue() || 0;
    component.addAttributes({ value });
  },

  onUpdate({ component }) {
    const value = component.getAttributes().value || 0;
    this.sliderInst.setValue(value);
  },
});
```

<demo-viewer value="x9sw2udv"/>

The integration with external components is possible by following these key steps:

1. **Component rendering**: `new Vue({ render: ...`<br/>
   This depends on the framework. For example, in React it would be `ReactDOM.render(element, ...`
1. **Change propagation**: `sliderInst.$on('change', ev => this.onChange(ev))`<br/>
   The framework should have a mechanism to subscribe to changes and the component [should expose that change](https://nightcatsama.github.io/vue-slider-component/#/api/events)<br/>
   We've also used the `onChange` method, which is useful when you need to trigger `onEvent` manually. Always call `onEvent` through `onChange` rather than directly.
1. **Property getters/setters**: [`sliderInst.getValue()`](https://nightcatsama.github.io/vue-slider-component/#/api/methods?hash=getvalue)/ [`sliderInst.setValue(value)`](https://nightcatsama.github.io/vue-slider-component/#/api/methods?hash=setvaluevalue)<br/>
   The component should allow you to read and write data through the instance.

### Custom Trait Manager

The default Trait Manager UI handles most common tasks. If you need more advanced logic or elements, you can create your own UI from scratch.

Tell the editor to use a custom UI, then subscribe to the `trait:custom` event, which is triggered whenever the UI needs to update.

```js
const editor = grapesjs.init({
  // ...
  traitManager: {
    custom: true,
    // ...
  },
});

editor.on('trait:custom', (props) => {
  // props.container (HTMLElement) - The default element where you can append your custom UI
  // Here you would put the logic to render/update your UI.
});
```

In the example below, we'll replicate most of the default functionality by using the [Traits API].

<demo-viewer value="hszpw2rb" height="500" darkcode/>

<!--
<style>
  .trait-input-color {
    width: 16px !important;
    height: 15px !important;
    opacity: 0 !important;
  }
  /* Vuetify overrides */
  .v-application {
    background: transparent !important;
  }
  .v-application--wrap {
    min-height: auto;
  }
  .v-input__slot {
    font-size: 12px;
    min-height: 10px !important;
    color-scheme: dark;
  }
  .v-select__selections {
    flex-wrap: nowrap;
  }
  .v-text-field .v-input__slot {
    padding: 0 10px !important;
  }
  .v-input--selection-controls {
    margin-top: 0;
  }
  .v-text-field__details, .v-messages {
    display: none;
  }
  .no-cat-header {
    opacity: 0;
    padding: 10px;
    max-height: 10px;
    pointer-events: none;
    min-height: auto !important;
  }
  .trait-color-prv {
    border: 1px solid rgba(255,255,255,0.5);
    border-radius: 3px;
  }
</style>
<div>
  <div class="vue-app">
    <v-app>
      <v-main>
        <v-expansion-panels accordion multiple v-model="panels">
          <v-expansion-panel v-for="trc in traitCategories">
            <v-expansion-panel-header v-if="trc.category">
              {{ trc.category.getLabel() }}
            </v-expansion-panel-header>
            <v-expansion-panel-header class="no-cat-header" v-else></v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-row>
                <trait-field v-for="trait in trc.items" :key="trait.id" :trait="trait"/>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-main>
    </v-app>
  </div>

  <div id="trait-field" style="display: none;">
    <v-col :class="['py-0 px-1 mb-1', trait.get('full') && 'mb-3']" :cols="12">
      <v-row class="flex-nowrap" v-if="isTypeNeedLabel">
        <v-col cols="auto pr-0">{{ trait.getLabel() }}</v-col>
      </v-row>
      <div v-if="type === 'number'">
        <v-text-field :placeholder="placeholder" :value="inputValue" @change="handleChange" outlined dense/>
      </div>
      <div v-else-if="type === 'checkbox'">
        <v-checkbox :label="trait.getLabel()" :input-value="inputValue" @change="handleChange"></v-checkbox>
      </div>
      <div v-else-if="type === 'select'">
        <v-select :items="toOptions" :value="inputValue" @change="handleChange" outlined dense/>
      </div>
      <div v-else-if="type === 'color'">
        <v-text-field :placeholder="placeholder" :value="inputValue" @change="handleChange" outlined dense>
          <template v-slot:append>
            <div :style="{ backgroundColor: inputValue || placeholder }" class="trait-color-prv">
              <input class="trait-input-color"
                      type="color"
                      :value="inputValue || placeholder"
                      @change="(ev) => handleChange(ev.target.value)"
                      @input="(ev) => handleInput(ev.target.value)"
                      />
            </div>
          </template>
        </v-text-field>
      </div>
      <div v-else-if="type === 'button'">
        <v-btn block @click="trait.runCommand()">
          <v-row>
            <v-col>{{ trait.get('labelButton') }}</v-col>
          </v-row>
        </v-btn>
      </div>
      <div v-else>
        <v-text-field :placeholder="placeholder" :type="type" :value="inputValue" @change="handleChange" outlined dense/>
      </div>
    </v-col>
  </div>
</div>
<script>
  const myPlugin = (editor) => {
    const category1 = { id: 'first', label: 'First category' };
    const category2 = { id: 'second', label: 'Second category', open: false };

    editor.Components.addType('demo-cmp', {
      model: {
        defaults: {
          traits: [
            {
              type: 'date',
              name: 'date-trait',
              label: 'Date trait',
              placeholder: 'Insert date',
            },
            {
              type: 'text',
              name: 'text-trait',
              label: false,
              placeholder: 'Insert text',
              category: category1,
            },
            {
              type: 'select',
              name: 'select-trait',
              label: 'Select 1',
              category: category1,
              default: 'opt1',
              options: [
                { id: 'opt1', name: 'Option 1'},
                { id: 'opt2', name: 'Option 2'},
                { id: 'opt3', name: 'Option 3'},
              ]
            },
            {
              type: 'select',
              name: 'select-trait2',
              label: 'Select 2',
              category: category1,
              default: 'opt2',
              options: [
                { id: 'opt1', name: 'Option 1'},
                { id: 'opt2', name: 'Option 2'},
                { id: 'opt3', name: 'Option 3'},
              ]
            },
            {
              type: 'number',
              name: 'number-trait',
              placeholder: '0-100',
              min: 0,
              max: 100,
              step: 5,
            },
            {
              type: 'color',
              label: 'Color trait',
              name: 'color-trait',
            },
            {
              type: 'checkbox',
              label: 'Checkbox trait',
              name: 'checkbox-trait',
              valueTrue: 'YES',
              valueFalse: 'NO',
            },
            {
              type: 'checkbox',
              name: 'open',
              category: category2,
            },
            {
              type: 'button',
              label: 'Button trait',
              labelButton: 'Alert',
              name: 'button-trait',
              category: category2,
              full: true,
              command: () => alert('hello'),
            },
            {
              type: 'button',
              label: false,
              full: true,
              category: category2,
              labelButton: 'Open code',
              name: 'button-trait2',
              command: 'core:open-code',
            },
          ],
        },
      },
    });
  };

  const editor = grapesjs.init({
    container: '#gjs',
    height: '100%',
    storageManager: false,
    fromElement: true,
    plugins: ['gjs-blocks-basic', myPlugin],
    traitManager: {
      custom: true
    }
  });

  Vue.component('trait-field', {
    props: { trait: Object },
    template: '#trait-field',
    computed: {
      inputValue() {
        return this.trait.getValue({ useType: true });
      },
      type() {
        return this.trait.getType();
      },
      placeholder() {
        return this.trait.get('placeholder');
      },
      toOptions() {
        const { trait } = this;
        return trait.getOptions().map(o => ({ value: trait.getOptionId(o), text: trait.getOptionLabel(o) }))
      },
      isTypeNeedLabel() {
        return !['checkbox', 'button'].includes(this.type);
      }
    },
    methods: {
      handleChange(value) {
        this.trait.setValue(value);
      },
      handleInput(value) {
        this.trait.setValue(value, { partial: true });
      },
    }
  });

  const app = new Vue({
    el: '.vue-app',
    vuetify: new Vuetify({
      theme: { dark: true },
    }),
    data: {
      traitCategories: [],
      panels: [],
    },
    mounted() {
      const { Traits } = editor;
      // Catch-all event for any spot update
      editor.on('trait:custom', this.onTraitCustom);
    },
    destroyed() {
      editor.off('trait:custom', this.handleCustom);
    },
    methods: {
      onTraitCustom(props) {
        const { container } = props;
        if (container && !container.contains(this.$el)) {
          container.appendChild(this.$el);
        }
        const traitsByCategory = editor.Traits.getTraitsByCategory();
        const noCategoryIndex = traitsByCategory.findIndex(trc => !trc.category) || 0;
        // Keep items without categories open
        if (!this.panels.includes(noCategoryIndex)) {
          this.panels.push(noCategoryIndex);
        }
        this.traitCategories = traitsByCategory;
      },
      categoryId(traitCategory) {
        return traitCategory.category?.id || 'none';
      },
    }
  });
</script>
-->

## Events

For a complete list of available events, check [here](/api/trait_manager.html#available-events).

[Traits API]: /api/trait_manager.html
