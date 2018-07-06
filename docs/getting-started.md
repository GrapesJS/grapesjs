---
title: Getting Started
meta:
  - name: keywords
    content: grapesjs getting started
---

# Getting Started

[[toc]]

In this section we gonna build a new editor from scratch <Badge text="tip" type="tip"/>

<script>
  var editor = 'Init editor';
  console.log(editor);
</script>

## Badge <Badge text="tip" type="tip" vertical="middle"/> <Badge text="warn" type="warn"/> <Badge text="error" type="error"/>

## Download

* CDNs
  * UNPKG
    * `https://unpkg.com/grapesjs`
    * `https://unpkg.com/grapesjs/dist/css/grapes.min.css`
  * CDNJS
    * `https://cdnjs.cloudflare.com/ajax/libs/grapesjs/0.12.17/grapes.min.js`
    * `https://cdnjs.cloudflare.com/ajax/libs/grapesjs/0.12.17/css/grapes.min.css`
* NPM
  * `npm i grapesjs`
* GIT
  * `git clone https://github.com/artf/grapesjs.git`


## Installation

## Load/Save Template

## Export Template

## Development


In this guide we will see how to create a completely customized page builder from scratch.  You can check the final result here.

The first step is to define the interface of our editor and for this purpose we gonna use Panels API.
Find a common style for the ui of any project is not an easy taks thats why grapesjs preferes to keep this process as simple as possible, by providing few helpers but letting the user define the interface in a more flexible way.
The main part of the GrapesJS editor is the canvas, this os where you gonna creare the structure of your templates and you definitly can miss it. Let's try to initiate the editor with just the canvas and no panels.

-- code only canvas, with the demo

With just the canvas you're already able to move, copy and delete components on the structure. For now we just see the example template taken from the container. Let's see now how can we create and drag custom blocks into our canvas.

BLOCKS
A block in Grapesjs is just a draggable peace of HTML, so it can be an image, a button, or an entire section with videos, forms and iframes. Let's start from creating another container and append inside ir few basic blocks which we can later use to build more complex structures.

-- add block, image, text and button blocks, put the block container under the canvas

As you see we added our blocks via the initial configuration, which is ok, but obviously there might be the case you would like to add them dynamically, in this case you have to use the Block's API

-- show how to add a block via API
--TODO: components as blocks

Now that we have blocks we can drag them inside our canvas and building complex structures.

COMPONENTS
Tecnically, once you drop your HTML block inside the canvas each element of the content is transformed in Grapesjs Component, which is an object containing informations about how the element is rendered in the canvas (managed in the View) and how it might look its final code (created by the properties in the Model). Generally, all Model properties are reflected to the View, so, for example, if you add a new attribute to the model, not only it will be available in the export code (will see later how to get it) but also the element you see in the canvas is updated with new attributes.
While this is a common behaviour what is cool about the Components is that you can create a totally decoupled view and show to the editor user what you desire, like for example, just by dragging a placeholder text you can fetch and show instead a dynamic content in the canvas. If want to get more about Custom Components and how to create and extend them, we recommend to checke Component GUIDE.
Grapesjs comes already with few [Built-in Components] which enabel different core features once rendered in canvas. Just to mention few of them, by double clicking on the image component you will see show up the default [Asset Manager], which you can customize or integrate you own, by double clicking on the text component you're able to edit it via the built-in Rich Text Editor, which is also customizable and replaceable.

--TODO: block hooks

If you prefer you can also create Blocks directly with the component type by passing an object

-- add block as image type object

PANELS
Now that we have a canvas and custom blocks let's see how to create a new panel with some buttons inside which trigger commands (from the core or custom one).

-- show addPanel with toggle-borders, export-code and custom alert show selected JSON + panel style

So, first of all, we have defined where to render the panel and then for each button we added a command property. The command could be the id, an object with run and stop functions or simply a single function.
Try to use Commands when it's possible because you are able to track them globally and so execute callbacks before and after their execution.

-- show commands events

Check the [Commands page] to learn more about their creation.

LAYERS -- show image
Another utility tool you might find useful when working with web elements is a layer manger. It's just a tree overview of the structure nodes and enables you to manage it easier. To enable it you just have to specify where to render it

-- show how to enable LM
-- HINT: create resizable panels

STYLE MANAGER
An important step in any web project is the style definition and with the built-in style manager module you're able to do so freely and quickly.
The style manager is composed by style properties and grouped by sectors, so let's see how to define a basic set of them.

-- show how to render SM and show style for width, height, padding, Typography, shadows

Now any component could be defined with its own style, you can add any other CSS property to your sectors and configure it by your needs. To get more about style manager extension check out this guide.
Each component can also indicate what to style and what not.

-- Example component with limit styles


TRAITS
Most of them time you would style your components and you would place them somewhere in the structure, but sometimes your components might need custom attributes or even behaviours

DEVICES
Grapesjs implements also a built-in module witch allows you to work with responsive templates easily. Let's see how to define different devices

-- config devices, desktop, tablet and mobile

On the UI side you will not see differences, but you can already use Devices API to toggle them.

--  show devices api and events

To help the user resize the canvas easily let's add a set of buttons

-- add responsive buttons

If you want to enable a mobile-first approch just change your configurations in this way

-- show mobile first config

STORAGE
Once you get all the tools you need for styling and managing your components the last part would to setup the storing and loading process.
Grapesjs implements 2 simple type of storages, the local (by using localStorage, active by default) and the remote one.
Those are enough to cover most of the cases, but it's also possible to add new storage implementations (eg. think about IndexedDB), if you want you can read more about [Storages here].
Let's see how can we setup a simple remote storage.

-- Add remote storage, see old getting started


THEMING
One last step that might actually improve a lot the personality of you editor is how it's look visually. To achive an easy to use theming we have adapted an atomic design for this purpose. To customize the main palette of colors all you have to do is to change some CSS, or variables if you work in SCSS

-- show import in SCSS and CSS
