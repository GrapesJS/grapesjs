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

### 1. `onRecordAdd`

This transformer is triggered when a new record is added to the data source. It allows for modification or enrichment of the record before it is stored.

#### Example Usage

```javascript
const testDataSource = {
  id: 'test-data-source',
  records: [],
  transformers: {
    onRecordAdd: ({ record }) => {
      record.content = record.content.toUpperCase();
      return record;
    },
  },
};
```

In this example, every record added will have its `content` field converted to uppercase.

### 2. `onRecordSetValue`

This transformer is invoked when a record's property is updated. It provides an opportunity to validate or transform the new value.

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

Here, the transformer ensures that the `content` field is always a string and transforms it to uppercase.

### 3. `onRecordRead`

This transformer is used when a record is read from the data source. It allows for post-processing of the data before it is returned.

#### Example Usage

```javascript
const testDataSource = {
  id: 'test-data-source',
  records: [],
  transformers: {
    onRecordRead: ({ record }) => {
      const content = record.get('content');
      return record.set('content', content.toUpperCase(), { avoidTransformers: true });
    },
  },
};
```

In this example, the `content` field of a record is converted to uppercase when read.

### 4. `onRecordDelete`

This transformer is invoked when a record is about to be deleted. It can be used to prevent deletion or to perform additional actions before the record is removed.

#### Example Usage

```javascript
const testDataSource = {
  id: 'test-data-source',
  records: [],
  transformers: {
    onRecordDelete: ({ record }) => {
      if (record.get('content') === 'i love grapes') {
        throw new Error('Cannot delete record with content "i love grapes"');
      }
    },
  },
};
```

In this scenario, a record with the `content` of `"i love grapes"` cannot be deleted.

---

These transformers can be customized to meet specific needs, ensuring that data is managed and manipulated in a way that fits your application requirements.

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
