---
title: Data Sources
---

# DataSources

## Overview

**DataSources** are a powerful feature in GrapesJS that allow you to manage and inject data into your components, styles, and traits programmatically. They help you bind dynamic data to your design elements and keep your user interface synchronized with underlying data models.

### Key Concepts

1. **DataSource**: A static object with records that can be used throughout GrapesJS.
2. **ComponentDataVariable**: A type of data variable that can be used within components to inject dynamic values.
3. **StyleDataVariable**: A data variable used to bind CSS properties to values in your DataSource.
4. **TraitDataVariable**: A data variable used in component traits to bind data to various UI elements.
5. **Transformers**: Methods for validating and transforming data records in a DataSource.

## Creating and Adding DataSources

To start using DataSources, you need to create them and add them to GrapesJS.

**Example: Creating and Adding a DataSource**

```ts
const editor = grapesjs.init({
  container: '#gjs',
});

const datasource = {
  id: 'my-datasource',
  records: [
    { id: 'id1', content: 'Hello World' },
    { id: 'id2', color: 'red' },
  ],
};

editor.DataSources.add(datasource);
```

## Using DataSources with Components

You can reference DataSources within your components to dynamically inject data.

**Example: Using DataSources with Components**

```ts
editor.addComponents([
  {
    tagName: 'h1',
    type: 'text',
    components: [
      {
        type: 'data-variable',
        defaultValue: 'default',
        path: 'my-datasource.id1.content',
      },
    ],
  },
]);
```

In this example, the `h1` component will display "Hello World" by fetching the content from the DataSource with the path `my-datasource.id1.content`.

## Using DataSources with Styles

DataSources can also be used to bind data to CSS properties.

**Example: Using DataSources with Styles**

```ts
editor.addComponents([
  {
    tagName: 'h1',
    type: 'text',
    components: [
      {
        type: 'data-variable',
        defaultValue: 'default',
        path: 'my-datasource.id1.content',
      },
    ],
    style: {
      color: {
        type: 'data-variable',
        defaultValue: 'red',
        path: 'my-datasource.id2.color',
      },
    },
  },
]);
```

Here, the `h1` component's color will be set to red, as specified in the DataSource at `my-datasource.id2.color`.

## Using DataSources with Traits

Traits are used to bind DataSource values to component properties, such as input fields.

**Example: Using DataSources with Traits**

```ts
const datasource = {
  id: 'my-datasource',
  records: [{ id: 'id1', value: 'I Love Grapes' }],
};
editor.DataSources.add(datasource);

editor.addComponents([
  {
    tagName: 'input',
    traits: [
      'name',
      'type',
      {
        type: 'text',
        label: 'Value',
        name: 'value',
        value: {
          type: 'data-variable',
          defaultValue: 'default',
          path: 'my-datasource.id1.value',
        },
      },
    ],
  },
]);
```

In this case, the value of the input field is bound to the DataSource value at `my-datasource.id1.value`.

## DataSource Transformers

Transformers in DataSources allow you to customize how data is processed during various stages of interaction with the data. The primary transformer functions include:

### 1. `onRecordSetValue`

This transformer is invoked when a record's property is added or updated. It provides an opportunity to validate or transform the new value.

#### Example Usage

```javascript
const testDataSource = {
  id: 'test-data-source',
  records: [],
  transformers: {
    onRecordSetValue: ({ id, key, value }) => {
      if (key !== 'content') {
        return value;
      }
      if (typeof value !== 'string') {
        throw new Error('Value must be a string');
      }
      return value.toUpperCase();
    },
  },
};
```

In this example, the `onRecordSetValue` transformer ensures that the `content` property is always an uppercase string.

## Storing DataSources in Project JSON

GrapesJS allows you to control whether a DataSource should be stored statically in the project JSON. This is useful for managing persistent data across project saves and loads.

### Using the `skipFromStorage` Key

When creating a DataSource, you can use the `skipFromStorage` key to specify whether it should be included in the project JSON.

**Example: Creating a DataSource with `skipFromStorage`**

```ts
const persistentDataSource = {
  id: 'persistent-datasource',
  records: [
    { id: 'id1', content: 'This data will be saved' },
    { id: 'id2', color: 'blue' },
  ],
};

editor.DataSources.add(persistentDataSource);

const temporaryDataSource = {
  id: 'temporary-datasource',
  records: [
    { id: 'id1', content: 'This data will not be saved' },
  ],
  skipFromStorage: true,
};

editor.DataSources.add(temporaryDataSource);
```

In this example, `persistentDataSource` will be included in the project JSON when the project is saved, while `temporaryDataSource` will not.

### Benefits of Using `skipFromStorage`

1. **Persistent Configuration**: Store configuration data that should persist across project saves and loads.
2. **Default Data**: Include default data that should always be available in the project.
3. **Selective Storage**: Choose which DataSources to include in the project JSON, optimizing storage and load times.

### Accessing Stored DataSources

When a project is loaded, GrapesJS will automatically restore the DataSources that were saved. You can then access and use these DataSources as usual.

```ts
// After loading a project
const loadedDataSource = editor.DataSources.get('persistent-datasource');
console.log(loadedDataSource.getRecord('id1').get('content')); // Outputs: "This data will be saved"
```

Remember that DataSources with `skipFromStorage: true` will not be available after a project is loaded unless you add them programmatically.


## Record Mutability

DataSource records are mutable by default, but can be set as immutable to prevent modifications. Use the mutable flag when creating records to control this behavior.

```ts
const dataSource = {
  id: 'my-datasource',
  records: [
    { id: 'id1', content: 'Mutable content' },
    { id: 'id2', content: 'Immutable content', mutable: false },
  ],
};


editor.DataSources.add(dataSource);

const ds = editor.DataSources.get('my-datasource');
ds.getRecord('id1').set('content', 'Updated content'); // Succeeds
ds.getRecord('id2').set('content', 'New content'); // Throws error
```

Immutable records cannot be modified or removed, ensuring data integrity for critical information.

## Benefits of Using DataSources

DataSources are integrated with GrapesJS's runtime and BackboneJS models, enabling dynamic updates and synchronization between your data and UI components. This allows you to:

1. **Inject Configuration**: Manage and inject configuration settings dynamically.
2. **Manage Global Themes**: Apply and update global styling themes.
3. **Mock & Test**: Use DataSources for testing and mocking data during development.
4. **Integrate with Third-Party Services**: Connect and synchronize with external data sources and services.

**Example: Using DataSources to Manage a Counter**

```ts
const datasource = {
  id: 'my-datasource',
  records: [{ id: 'id1', counter: 0 }],
};

editor.DataSources.add(datasource);

editor.addComponents([
  {
    tagName: 'span',
    type: 'text',
    components: [
      {
        type: 'data-variable',
        defaultValue: 'default',
        path: 'my-datasource.id1.counter',
      },
    ],
  },
]);

const ds = editor.DataSources.get('my-datasource');
setInterval(() => {
  console.log('Incrementing counter');
  const counterRecord = ds.getRecord('id1');
  counterRecord.set({ counter: counterRecord.get('counter') + 1 });
}, 1000);
```

In this example, a counter is dynamically updated and displayed in the UI, demonstrating the real-time synchronization capabilities of DataSources.

**Examples of How DataSources Could Be Used:**

1. Injecting configuration
2. Managing global themes
3. Mocking & testing
4. Third-party integrations