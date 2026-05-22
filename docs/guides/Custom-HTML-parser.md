---
title: Use Custom HTML Parser
---

# Use Custom HTML Parser

If your GrapesJS integration needs to parse HTML in environments where DOM APIs are not available, you can register a custom HTML code parser and let GrapesJS compile the returned parsed nodes into components.

This is useful for:

- server-side or worker-based HTML imports
- integrations that already have their own HTML parser
- cases where component recognition should not depend on browser DOM nodes

::: warning
This guide requires GrapesJS v0.23.1 or higher
:::

[[toc]]

## Register a parser

Code parsers are managed by the `Parser` module.

```js
const { Parser } = editor;

Parser.addParserCode(
  'my-parser',
  (input) => {
    return [
      {
        nodeType: 1,
        tagName: 'section',
        attributes: { class: 'hero' },
        childNodes: [{ nodeType: 3, textContent: 'Hello world' }],
      },
    ];
  }
);
```

The parser function must always return an array of parsed nodes.

## Select a parser

You can select the active parser globally:

```js
Parser.parserCode = 'my-parser';
const result = Parser.parseHtml('<section>Hello world</section>');
```

Or for a single call:

```js
const result = Parser.parseHtml('<section>Hello world</section>', {
  parserCode: 'my-parser',
});
```

Passing `parserCode: ''` forces the built-in DOM parser path for that call.

## Parsed nodes

Custom parsers return nodes shaped like this:

```ts
interface ParsedNode {
  nodeType?: number;
  tagName?: string;
  namespaceURI?: string;
  attributes?: Record<string, string>;
  childNodes?: ParsedNode[];
  textContent?: string;
}
```

Supported node types in the current implementation are:

- `1` for elements
- `3` for text nodes
- `8` for comments
- `9` for documents
- `11` for document fragments

When `asDocument: true` is used, GrapesJS normalizes the parser output to a document-like root so `root`, `head`, and `body` can still be compiled.

## Component recognition

For headless parsing, component types can implement `isParsedNode`:

```js
editor.Components.addType('my-component', {
  isParsedNode(node, opts) {
    if (node.tagName === 'my-component') {
      return { type: 'my-component' };
    }
  },
});
```

When `parserCode` is active, `isParsedNode` is preferred over `isComponent`.

## Legacy `isComponent` fallback

Existing components that only implement `isComponent` continue to work with `parserCode`.
GrapesJS passes a read-only synthetic element that exposes the most common DOM-like properties:

- `nodeType`
- `tagName`
- `nodeName`
- `namespaceURI`
- `textContent`
- `nodeValue`
- `parentNode`
- `childNodes`
- `children`
- `getAttribute`
- `hasAttribute`

If you need more DOM-like helpers, extend the base synthetic element:

```js
editor.Parser.config.customSyntheticElement = (SyntheticElement) =>
  class MySyntheticElement extends SyntheticElement {
    get foo() {
      return this.getAttribute('data-foo') || '';
    }
  };
```

## Registry helpers

You can inspect and manage the registry at runtime:

```js
const parser = Parser.getParserCode('my-parser');
const removed = Parser.removeParserCode('my-parser');
const registry = Parser.parsersCode;
```

Removing the selected parser clears `Parser.parserCode`.
