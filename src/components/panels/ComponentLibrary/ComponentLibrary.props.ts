import type { TComponentDef } from '~/types/document';

type TComponentPreviewProps = {
  componentDef: TComponentDef;
  components: Record<string, TComponentDef>;
};

export type { TComponentPreviewProps };
