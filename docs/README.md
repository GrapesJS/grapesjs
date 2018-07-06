# Introduction

[[toc]]

## What is GrapesJS?
At first look you might probably think it's just yet another kind of page/HTML builder, but actually is something more. GrapesJS is the first, multi-purpose, Web Builder Framework, which means it allows you easily create your, drag & drop enabled, builder of "THINGS". For "THINGS" we consider anything web structure related, so HTML at first, but don't just think about web pages, we use HTML-like structure basically everywhere: Newsletters, Native Mobile Applications (eg. [React Native](https://github.com/facebook/react-native)), Native Desktop Applications (eg. [Vuido](https://vuido.mimec.org)), PDFs (eg. [React PDF](https://github.com/diegomura/react-pdf)), etc. So, for everything you can imagine as a set of elements like `<tag some="attribute">... other nested elements ...</tag>` you can create easily a GrapesJS builder around it and then use it independently in some of your applications.
GrapesJS comes along with different features and tools which enable you to craft easy to use builders, which will allow your users to create complex HTML templates without any knowledge of coding.





## Why GrapesJS?
The development of the framework is started by the need to replace common WYSIWYG editors, which are good for content editing but inappropriate for creating HTML structures





## Demos
To show up what GrapesJS is capable of we have created some presets to use as official demos. You can actually use them as a starting point for your editors, so just clone and extend them as you wish. For a quick start with GrapesJS check below.





## Architecture

| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |

::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger Custom title
This is a dangerous warning
:::

``` js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

Import Code Snippets

<<< @/src/editor/config/config.js
