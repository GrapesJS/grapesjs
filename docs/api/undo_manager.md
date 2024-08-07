<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## UndoManager

This module allows to manage the stack of changes applied in canvas.
Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance

```js
const um = editor.UndoManager;
```

*   [getConfig][1]
*   [add][2]
*   [remove][3]
*   [removeAll][4]
*   [start][5]
*   [stop][6]
*   [undo][7]
*   [undoAll][8]
*   [redo][9]
*   [redoAll][10]
*   [hasUndo][11]
*   [hasRedo][12]
*   [getStack][13]
*   [clear][14]

## getConfig

Get configuration object

Returns **[Object][15]** 

## add

Add an entity (Model/Collection) to track
Note: New Components and CSSRules will be added automatically

### Parameters

*   `entity` **(Model | Collection)** Entity to track

### Examples

```javascript
um.add(someModelOrCollection);
```

Returns **this** 

## remove

Remove and stop tracking the entity (Model/Collection)

### Parameters

*   `entity` **(Model | Collection)** Entity to remove

### Examples

```javascript
um.remove(someModelOrCollection);
```

Returns **this** 

## removeAll

Remove all entities

### Examples

```javascript
um.removeAll();
```

Returns **this** 

## start

Start/resume tracking changes

### Examples

```javascript
um.start();
```

Returns **this** 

## stop

Stop tracking changes

### Examples

```javascript
um.stop();
```

Returns **this** 

## undo

Undo last change

### Parameters

*   `all`   (optional, default `true`)

### Examples

```javascript
um.undo();
```

Returns **this** 

## undoAll

Undo all changes

### Examples

```javascript
um.undoAll();
```

Returns **this** 

## redo

Redo last change

### Parameters

*   `all`   (optional, default `true`)

### Examples

```javascript
um.redo();
```

Returns **this** 

## redoAll

Redo all changes

### Examples

```javascript
um.redoAll();
```

Returns **this** 

## hasUndo

Checks if exists an available undo

### Examples

```javascript
um.hasUndo();
```

Returns **[Boolean][16]** 

## hasRedo

Checks if exists an available redo

### Examples

```javascript
um.hasRedo();
```

Returns **[Boolean][16]** 

## isRegistered

Check if the entity (Model/Collection) to tracked
Note: New Components and CSSRules will be added automatically

### Parameters

*   `obj` **any** 
*   `entity` **(Model | Collection)** Entity to track

Returns **[Boolean][16]** 

## getStack

Get stack of changes

### Examples

```javascript
const stack = um.getStack();
stack.each(item => ...);
```

Returns **Collection** 

## skip

Execute the provided callback temporarily stopping tracking changes

### Parameters

*   `clb` **[Function][17]** The callback to execute with changes tracking stopped

### Examples

```javascript
um.skip(() => {
 // Do stuff without tracking
});
```

## clear

Clear the stack

### Examples

```javascript
um.clear();
```

Returns **this** 

[1]: #getconfig

[2]: #add

[3]: #remove

[4]: #removeall

[5]: #start

[6]: #stop

[7]: #undo

[8]: #undoall

[9]: #redo

[10]: #redoall

[11]: #hasundo

[12]: #hasredo

[13]: #getstack

[14]: #clear

[15]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[16]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean

[17]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function
