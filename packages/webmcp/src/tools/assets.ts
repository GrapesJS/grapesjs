import type { Asset } from 'grapesjs';
import type { WebMcpToolsContext } from '../types';
import { ToolNames } from './names';
import { createTool, limitSchema, offsetSchema, paginate, ToolError, toPlain } from '../utils';

const serializeAsset = (asset: Asset) => {
  const { src, type, name, width, height } = asset.attributes as Record<string, any>;
  return toPlain({ src, type, ...(name ? { name } : {}), ...(width ? { width } : {}), ...(height ? { height } : {}) });
};

export default ({ editor, defaultLimit }: WebMcpToolsContext) => [
  createTool<{ type?: string; limit?: number; offset?: number }>({
    name: ToolNames.listAssets,
    title: 'List assets',
    description: 'List the assets (eg. images) of the project.',
    annotations: { readOnlyHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', description: 'Filter by asset type, eg. "image"' },
        limit: limitSchema,
        offset: offsetSchema,
      },
      additionalProperties: false,
    },
    execute: (input) => {
      const assets = editor.Assets.getAll().filter(
        (asset: Asset) => input.type === undefined || asset.get('type') === input.type,
      );
      return paginate(assets, input, defaultLimit, serializeAsset);
    },
  }),
  createTool<{ assets: Array<{ src: string; type?: string; name?: string; width?: number; height?: number }> }>({
    name: ToolNames.addAssets,
    title: 'Add assets',
    description: 'Add assets by URL (no file upload).',
    inputSchema: {
      type: 'object',
      properties: {
        assets: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            properties: {
              src: { type: 'string', description: 'Asset URL' },
              type: { type: 'string', description: 'Asset type (default "image")' },
              name: { type: 'string' },
              width: { type: 'number' },
              height: { type: 'number' },
            },
            required: ['src'],
            additionalProperties: false,
          },
        },
      },
      required: ['assets'],
      additionalProperties: false,
    },
    execute: ({ assets }) => {
      assets.forEach(({ src }) => {
        if (!/^(https?:|data:image\/|\/|\.)/i.test(src)) {
          throw new ToolError(`Invalid asset URL "${src}"`, 'invalid_input');
        }
      });
      const added = editor.Assets.add(assets as any) as unknown as Asset | Asset[];
      return { added: (Array.isArray(added) ? added : [added]).map(serializeAsset) };
    },
  }),
  createTool<{ srcs: string[] }>({
    name: ToolNames.removeAssets,
    title: 'Remove assets',
    description: 'Remove assets by their URL.',
    annotations: { consequentialHint: true },
    inputSchema: {
      type: 'object',
      properties: {
        srcs: { type: 'array', items: { type: 'string' }, minItems: 1, description: 'Asset URLs' },
      },
      required: ['srcs'],
      additionalProperties: false,
    },
    execute: ({ srcs }) => {
      const assets = srcs.map((src) => {
        const asset = editor.Assets.get(src);
        if (!asset) throw new ToolError(`Asset "${src}" not found`, 'not_found');
        return asset;
      });
      assets.forEach((asset) => editor.Assets.remove(asset));
      return { removed: srcs };
    },
  }),
];
