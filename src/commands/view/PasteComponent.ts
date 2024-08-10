import Component from '../../dom_components/model/Component';
import { CommandObject } from './CommandAbstract';
import Editor from '../../editor';
import DOMPurify from 'dompurify';
import _ from 'underscore';

export default {
  async run(ed, s, opts) {
    const clipboardItems = await navigator.clipboard.read();
    const lastSelected = ed.getSelected();

    if (clipboardItems.length === 0 || !lastSelected) {
      return;
    }

    const selected = ed.getSelectedAll().map(sel => sel.delegate?.copy?.(sel) || sel);

    for (const item of clipboardItems) {
      let components = [];

      const supportedTypes = ['web application/json', 'image', 'text/html', 'text/plain'];
      let type;

      for (const t of item.types) {
        type = supportedTypes.find(supportedType => t.startsWith(supportedType));
        if (type) break;
      }

      if (!type) continue;

      const data = await item.getType(type);
      switch (true) {
        case type.startsWith('image'):
          components = await this.pasteImage(ed, data);
          break;
        case type === 'web application/json':
          components = await this.pasteLocal(item);
          break;
        case type === 'text/html':
          components = await (this.config.disableHtmlPasting ? this.pasteText(data) : this.pasteHTML(data));
          break;
        case type === 'text/plain':
          components = await this.pasteText(data);
          break;
        default:
          console.warn(`Unsupported clipboard data type: ${type}`);
          break;
      }

      const addedComponents: Component[] = [];
      for (let index = 0; index < components.length; index++) {
        const component = components[index];
        const added = this.insertComponentIntoSelection(ed, selected, component, opts);
        addedComponents.push(...added);
      }
    }

    lastSelected.emitUpdate();
  },

  async pasteImage(ed: Editor, data: Blob): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const imgSrc = reader.result as string;
        ed.AssetManager.add(imgSrc);
        const componentData = {
          type: 'image',
          src: imgSrc,
          style: {
            width: '100%',
          },
        };
        resolve([componentData]);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(data);
    });
  },

  async pasteHTML(data: Blob) {
    const htmlContent = await data.text();
    const cleanHtml = DOMPurify.sanitize(htmlContent);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = cleanHtml;

    const components = Array.from(wrapper.children).map(child => {
      const elementHtml = child.outerHTML;
      const componentData = {
        content: elementHtml,
      };
      return componentData;
    });
    return components;
  },

  async pasteText(data: Blob) {
    const textData = await data.text();
    const parser = new DOMParser();
    const parsedDoc = parser.parseFromString(textData, 'text/html');

    const isParsableHTML = Array.from(parsedDoc.body.childNodes).some(node => node.nodeType === 1);

    if (isParsableHTML && !this.config.disableHtmlPasting) {
      return await this.pasteHTML(new Blob([textData], { type: 'text/html' }));
    }

    const textContent = await data.text();
    const escapedContent = _.escape(textContent);
    const componentData = {
      type: 'text',
      content: escapedContent,
    };
    return [componentData];
  },

  async pasteLocal(item: ClipboardItem) {
    const data = await item.getType('web application/json');
    const jsonContent = await data.text();

    try {
      const { format, data: componentData } = JSON.parse(jsonContent);

      if (format === this.config.ClipboardComponentFormat) {
        return [componentData];
      }
    } catch (err) {
      console.warn('Invalid JSON component data:', err);
    }

    return [];
  },

  insertComponentIntoSelection(
    ed: Editor,
    selected: any[],
    componentData: { type: string; content: string },
    opts: { action: any }
  ) {
    const addedComponents: Component[] = [];

    selected.forEach((sel: { index?: any; parent?: any; collection?: any }) => {
      const { collection } = sel;
      if (collection) {
        const at = sel.index() + 1;
        const addOpts = { at, action: opts.action || 'paste-component' };
        const parent = sel.parent();
        if (parent) {
          const addedComponent = this.addChildComponent(parent, componentData, addOpts);
          addedComponents.push(addedComponent);
        }
      } else {
        const pageBody = ed.getModel().Pages.getSelected()?.getMainComponent();
        const addOpts = { at: pageBody?.components().length || 0, action: opts.action || 'paste-component' };
        const addedComponent = this.addChildComponent(pageBody as Component, componentData, addOpts);
        addedComponents.push(addedComponent);
      }
    });

    return addedComponents;
  },

  addChildComponent(parent: Component, componentData: any, addOpts: { at: any; action: any }) {
    const addedComponent = parent.components().add(componentData, addOpts);
    return addedComponent;
  },
} as CommandObject<{ action: any }, { [k: string]: any }>;
