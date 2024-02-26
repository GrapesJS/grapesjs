type ParamType =
  | { type: 'list'; inner: ParamType }
  | { type: 'object'; inner: { [name: string]: ParamType } }
  | { type: 'single' };

// interface ParamType{
//     type: 'list';
//     inner: ParamType[]
// }

export type ComponentEvent = {
  id: string;
  type: 'single';
  params: ParamType;
};
