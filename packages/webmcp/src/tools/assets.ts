import type { Asset } from 'grapesjs';
import * as z from 'zod/mini';
import type { WebMcpToolsContext } from '../types';
import { ToolNames } from './names';
import { createTool, limitSchema, offsetSchema, paginate, ToolError, toPlain } from '../utils';

const serializeAsset = (asset: Asset) => {
  const { src, type, name, width, height } = asset.attributes as Record<string, any>;
  return toPlain({ src, type, ...(name ? { name } : {}), ...(width ? { width } : {}), ...(height ? { height } : {}) });
};

export default ({ editor, defaultLimit }: WebMcpToolsContext) => [
  createTool({
    name: ToolNames.listAssets,
    title: 'List assets',
    description: 'List the assets (eg. images) of the project.',
    annotations: { readOnlyHint: true },
    input: z.strictObject({
      type: z.optional(z.string().check(z.describe('Filter by asset type, eg. "image"'))),
      limit: limitSchema,
      offset: offsetSchema,
    }),
    execute: (input) => {
      const assets = editor.Assets.getAll().filter(
        (asset: Asset) => input.type === undefined || asset.get('type') === input.type,
      );
      return paginate(assets, input, defaultLimit, serializeAsset);
    },
  }),
  createTool({
    name: ToolNames.addAssets,
    title: 'Add assets',
    description: 'Add assets by URL (no file upload).',
    input: z.strictObject({
      assets: z
        .array(
          z.strictObject({
            src: z.string().check(z.describe('Asset URL')),
            type: z.optional(z.string().check(z.describe('Asset type (default "image")'))),
            name: z.optional(z.string()),
            width: z.optional(z.number()),
            height: z.optional(z.number()),
          }),
        )
        .check(z.minLength(1)),
    }),
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
  createTool({
    name: ToolNames.removeAssets,
    title: 'Remove assets',
    description: 'Remove assets by their URL.',
    annotations: { consequentialHint: true },
    input: z.strictObject({ srcs: z.array(z.string()).check(z.minLength(1), z.describe('Asset URLs')) }),
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
