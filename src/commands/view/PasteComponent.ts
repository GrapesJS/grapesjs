import Component from '../../dom_components/model/Component';
import { CommandObject } from './CommandAbstract';
import Editor from '../../editor';
import DOMPurify from 'dompurify';

const GRAPESJS_COMPONENT_FORMAT = 'application/x-grapesjs-component';

export default {
  async run(ed, s, opts = {}) {
    const em = ed.getModel();
    const clipboardItems = await navigator.clipboard.read();
    const lastSelected = ed.getSelected();

    if (clipboardItems.length && lastSelected) {
      const selected = ed.getSelectedAll().map(sel => sel.delegate?.copy?.(sel) || sel);

      for (const item of clipboardItems) {
        const desiredTypes = ['web application/json', 'image', 'text/html', 'text/plain'];
        let type;

        for (const desiredType of desiredTypes) {
          type = item.types.find(t => t.startsWith(desiredType));
          if (type) break;
        }

        let components = [];
        if (!type) continue;

        const data = await item.getType(type);

        if (type.startsWith('image')) {
          components = await pasteImage(ed, data);
          console.log('🚀 ~ run ~ components:', components);
        } else {
          switch (type) {
            case 'web application/json':
              components = await pasteLocal(item);
              break;
            case 'text/html':
              components = await pasteHTML(data);
              break;
            case 'text/plain':
              components = await pasteText(data);
              break;
            default:
              console.warn(`Unsupported clipboard data type: ${type}`);
              break;
          }
        }

        const addedComponents: Component[] = [];
        for (let index = 0; index < components.length; index++) {
          const component = components[index];
          const added = addComponentToSelection(ed, selected, component, opts);
          addedComponents.push(...added);
        }
      }

      lastSelected.emitUpdate();
    }
  },
} as CommandObject;

async function pasteImage(ed: Editor, data: Blob): Promise<any> {
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
}

async function pasteHTML(data: Blob) {
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
}

async function pasteText(data: Blob) {
  const textContent = await data.text();
  const componentData = {
    type: 'text',
    content: textContent,
  };
  return [componentData];
}

async function pasteLocal(item: ClipboardItem) {
  const data = await item.getType('web application/json');
  const jsonContent = await data.text();

  try {
    const { format, data: componentData } = JSON.parse(jsonContent);

    if (format === GRAPESJS_COMPONENT_FORMAT) {
      return [componentData];
    }
  } catch (err) {
    console.warn('Invalid JSON component data:', err);
  }

  return [];
}

function addComponentToSelection(
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
        const addedComponent = doAddComponent(ed, parent, componentData, addOpts);
        addedComponents.push(addedComponent);
      }
    } else {
      const pageBody = ed.getModel().Pages.getSelected()?.getMainComponent();
      const addOpts = { at: pageBody?.components().length || 0, action: opts.action || 'paste-component' };
      const addedComponent = doAddComponent(ed, pageBody as Component, componentData, addOpts);
      addedComponents.push(addedComponent);
    }
  });

  return addedComponents;
}

function doAddComponent(ed: any, parent: Component, componentData: any, addOpts: { at: any; action: any }) {
  const addedComponent = parent.components().add(componentData, addOpts);
  return addedComponent;
}
