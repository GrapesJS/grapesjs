---
title: GrapesJS Telemetry
---

# GrapesJS Telemetry

We collect and use data to improve GrapesJS. This page explains what data we collect and how we use it.

## What data we collect

We collect the following data:

- **domain**: The domain of the website where GrapesJS is used.
- **version**: The version of GrapesJS used.
- **timestamp**: The time when the editor is loaded.

## How we use data

We use data to:

- **Improve GrapesJS**: We use data to improve GrapesJS. For example, we use data to identify bugs and fix them.
- **Analyze usage**: We use data to analyze how GrapesJS is used. For example, we use data to understand which features are used most often.
- **Provide support**: We use data to provide support to users. For example, we use data to understand how users interact with GrapesJS.

## How to opt-out

You can opt-out of data collection by setting the `telemetry` option to `false` when initializing GrapesJS:

```js
const editor = grapesjs.init({
  // ...
  telemetry: false,
});
```
