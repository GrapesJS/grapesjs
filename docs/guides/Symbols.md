---
title: Symbols
---
# Symbols

::: warning
This feature is released as a beta from GrapesJS v0.21.11


To get a better understanding of the content in this guide we recommend reading [Components] first
:::

Symbols are a special type of [Component] that allows you to easily reuse common elements across your project. They are particularly useful for components that appear multiple times in your project and need to remain consistent. By using Symbols, you can easily update these components in one place and have the changes reflected everywhere they are used.

[[toc]]


## Concept

A Symbol created from a component retains the same shape and uses the same [Components API], but it includes a reference to other related Symbols. When you create a new Symbol from a Component, it creates a Main Symbol, and the original component becomes an Instance Symbol.

When you reuse the Symbol elsewhere, it creates new Instance Symbols. Any updates made to the Main Symbol are automatically replicated in all Instance Symbols, ensuring consistency throughout your project.

Below is a simple representation of the connection between Main and Instance Symbols.

[IMAGE]

::: warning Note
This feature operates at a low level, meaning there is no built-in UI for creating and managing symbols. Developers need to implement their own UI to interact with this feature. Below you'll find an example of implementation.
:::


## Programmatic usage

Let's see how to work with and manage Symbols in your project.



### Create symbol

Create a new Symbol from any component in your project:

```js
const anyComponent = editor.getSelected();
const symbolMain = editor.Components.addSymbol(anyComponent);
```

This will transform `anyComponent` to an Instance and the returned `symbolMain` will be the Main Symbol. GrapesJS keeps track of Main Symbols separately in your project JSON, and they will be automatically reconnected when you reload the project.

The `addSymbol` method also handles the creation of Instances. If you call it again by passing `symbolMain` or `anyComponent`, it will create a new Instance of `symbolMain`.

```js
const secondInstance = editor.Components.addSymbol(symbolMain);
```

Now, `symbolMain` references two instances of its shape.

To get all the available Symbols in your project, use `getSymbols`:

```js
const symbols = editor.Components.getSymbols();
const symbolMain = symbols[0];
```



### Symbol details

Once you have Symbols in your project, you might need to know when a Component is a Symbol and get details about it. Use the `getSymbolInfo` method for this:

```js
// Details from the Main Symbol
const symbolMainInfo = editor.Components.getSymbolInfo(symbolMain);

symbolMainInfo.isSymbol; // true; It's a Symbol
symbolMainInfo.isRoot; // true; It's the root of the Symbol
symbolMainInfo.isMain; // true; It's the Main Symbol
symbolMainInfo.isInstance; // false; It's not the Instance Symbol
symbolMainInfo.main; // symbolMainInfo; Reference to the Main Symbol
symbolMainInfo.instances; // [anyComponent, secondInstance]; Reference to Instance Symbols
symbolMainInfo.relatives; // [anyComponent, secondInstance]; Relative Symbols

// Details from the Instance Symbol
const secondInstanceInfo = editor.Components.getSymbolInfo(secondInstance);

symbolMainInfo.isSymbol; // true; It's a Symbol
symbolMainInfo.isRoot; // true; It's the root of the Symbol
symbolMainInfo.isMain; // false; It's not the Main Symbol
symbolMainInfo.isInstance; // true; It's the Instance Symbol
symbolMainInfo.main; // symbolMainInfo; Reference to the Main Symbol
symbolMainInfo.instances; // [anyComponent, secondInstance]; Reference to Instance Symbols
symbolMainInfo.relatives; // [anyComponent, symbolMain]; Relative Symbols
```



### Overrides

When you update a Symbol's properties, changes are propagated to all related Symbols. To avoid propagating specific properties, you can specify at the component level which properties to skip:

```js
anyComponent.set('my-property', true);
secondInstance.get('my-property'); // true; change propagated

anyComponent.setSymbolOverride(['my-property']);
// Get current override value: anyComponent.getSymbolOverride();

anyComponent.set('my-property', false);
secondInstance.get('my-property'); // true; change didn't propagate
```



### Detach symbol

Once you have Symbol instances you might need to disconnect one to create a new custom shape with other components inside, in that case you can use `detachSymbol`.

```js
editor.Components.detachSymbol(anyComponent);

const info = editor.Components.getSymbolInfo(anyComponent);
info.isSymbol; // false; Not a Symbol anymore

const infoMain = editor.Components.getSymbolInfo(symbolMain);
infoMain.instances; // [secondInstance]; Removed the reference
```



### Remove symbol

To remove a Main Symbol and detach all related instances:

```js
const symbolMain = editor.Components.getSymbols()[0];
symbolMain.remove();
```




## Events

The editor triggers several symbol-related events that you can leverage for your integration:


* `symbol:main:add`  Added new root main symbol.
```js
editor.on('symbol:main:add', ({ component }) => { ... });
```

* `symbol:main:update`  Root main symbol updated.
```js
editor.on('symbol:main:update', ({ component }) => { ... });
```

* `symbol:main:remove`  Root main symbol removed.
```js
editor.on('symbol:main:remove', ({ component }) => { ... });
```

* `symbol:main` Catch-all event related to root main symbol updates.
```js
editor.on('symbol:main', ({ event, component }) => { ... });
```

* `symbol:instance:add` Added new root instance symbol.
```js
editor.on('symbol:instance:add', ({ component }) => { ... });
```

* `symbol:instance:remove` Root instance symbol removed.
```js
editor.on('symbol:instance:remove', ({ component }) => { ... });
```

* `symbol:instance` Catch-all event related to root instance symbol updates.
```js
editor.on('symbol:instance', ({ event, component }) => { ... });
```

* `symbol` Catch-all event for any symbol update (main or instance).
```js
editor.on('symbol', () => { ... });
```




## Example

Below is a basic UI implementation leveraging the Symbols API:


<demo-viewer value="zdetbjsg" height="500" darkcode/>


[Component]: </modules/Components.html>
[Components]: </modules/Components.html>
[Components API]: </api/component.html>