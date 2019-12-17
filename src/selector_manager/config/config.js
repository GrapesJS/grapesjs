export default {
  // Style prefix
  stylePrefix: 'clm-',

  // Specify the element to use as a container, string (query) or HTMLElement
  // With the empty value, nothing will be rendered
  appendTo: '',

  // Default selectors
  selectors: [],

  // States
  states: [{ name: 'hover' }, { name: 'active' }, { name: 'nth-of-type(2n)' }],

  // Custom selector name escaping strategy, eg.
  // name => name.replace(' ', '_')
  escapeName: 0,

  // Custom selected name strategy (the string you see after 'Selected')
  // ({ result, state, target }) => {
  //  return `${result} - ID: ${target.getId()}`
  // }
  selectedName: 0,

  // Icon used to add new selector
  iconAdd:
    '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>',

  // Icon used to sync styles
  iconSync:
    '<svg viewBox="0 0 24 24"><path d="M12 18c-3.31 0-6-2.69-6-6 0-1 .25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4m0-11V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8z"></path></svg>',

  /**
   * Custom render function for the Select Manager
   * @example
   * render: ({ el, labelHead, labelStates, labelInfo, }) => {
   *  // You can use the default `el` to extend/edit the current
   *  // DOM element of the Selector Manager
   *  const someEl = document.createElement('div');
   *  // ...
   *  el.appendChild(someEl);
   *  // no need to return anything from the function
   *
   *  // Create and return a new DOM element
   *  const newEl = document.createElement('div');
   *  // ...
   *  return newEl;
   *
   *  // Return an HTML string for a completely different layout.
   *  // Use `data-*` attributes to make the module recognize some elements:
   *  // `data-states` - Where to append state `<option>` elements (or just write yours)
   *  // `data-selectors` - Where to append selectors
   *  // `data-input` - Input element which is used to add new selectors
   *  // `data-add` - Element which triggers the add of a new selector on click
   *  // `data-sync-style` - Element which triggers the sync of styles (visible with `componentFirst` enabled)
   *  // `data-selected` - Where to print selected selectors
   *  return `
   *    <div class="my-sm-header">
   *     <div>${labelHead}</div>
   *     <div>
   *       <select data-states>
   *         <option value="">${labelStates}</option>
   *       </select>
   *     </div>
   *    </div>
   *    <div class="my-sm-body">
   *      <div data-selectors></div>
   *      <input data-input/>
   *      <span data-add>Add</span>
   *      <span data-sync-style>Sync</span>
   *    </div>
   *    <div class="my-sm-info">
   *      <div>${labelInfo}</div>
   *      <div data-selected></div>
   *    </div>
   * `;
   * }
   */
  render: 0,

  // When you select a component in the canvas the selected Model (Component or CSS Rule)
  // is passed to the StyleManager which will be then able to be styled, these are the cases:
  // * Selected component doesn't have any classes: Component will be passed
  // * Selected component has at least one class: The CSS Rule will be passed
  //
  // With this option enabled, also in the second case, the Component will be passed.
  // This method allows to avoid styling classes directly and make, for example, some
  // unintended changes below the visible canvas area (when components share same classes)
  componentFirst: 1
};
