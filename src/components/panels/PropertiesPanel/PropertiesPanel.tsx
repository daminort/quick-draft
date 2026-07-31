import { Flex, Text } from '@radix-ui/themes';

import type { TShape } from '~/types/document';

import { documentStore, documentSelectors } from '~/stores/documentStore';
import { selectionStore, selectionSelectors } from '~/stores/selectionStore';

import { GeometryPanel } from '~/components/panels/GeometryPanel';
import { LineSettingsPanel } from '~/components/panels/LineSettingsPanel';
import { RectSettingsPanel } from '~/components/panels/RectSettingsPanel';
import { CircleSettingsPanel } from '~/components/panels/CircleSettingsPanel';
import { ArcSettingsPanel } from '~/components/panels/ArcSettingsPanel';
import { TextSettingsPanel } from '~/components/panels/TextSettingsPanel';
import { DimensionSettingsPanel } from '~/components/panels/DimensionSettingsPanel';
import { ComponentActions } from '~/components/panels/ComponentActions';

import s from './PropertiesPanel.module.css';

const SHAPE_TYPE_LABELS: Record<TShape['type'], string> = {
  line: 'Line',
  rect: 'Rectangle',
  circle: 'Circle',
  arc: 'Arc',
  text: 'Text',
  dimension: 'Dimension',
  guide: 'Guide',
  'component-instance': 'Component instance',
};

function ShapeSettings({ shape }: { shape: TShape }) {
  switch (shape.type) {
    case 'line':
      return <LineSettingsPanel shape={shape} />;
    case 'rect':
      return <RectSettingsPanel shape={shape} />;
    case 'circle':
      return <CircleSettingsPanel shape={shape} />;
    case 'arc':
      return <ArcSettingsPanel shape={shape} />;
    case 'text':
      return <TextSettingsPanel shape={shape} />;
    case 'dimension':
      return <DimensionSettingsPanel shape={shape} />;
    case 'guide':
    case 'component-instance':
      return <GeometryPanel shape={shape} />;
    default:
      return null;
  }
}

function PropertiesPanel() {
  const selectedIds = selectionStore(selectionSelectors.getSelectedIds);
  const shapes = documentStore(documentSelectors.getShapes);

  if (selectedIds.length > 1) {
    return (
      <Flex direction="column" gap="4" width="220px" p="3" className={s.panel}>
        <ComponentActions />
      </Flex>
    );
  }

  if (selectedIds.length !== 1) {
    return null;
  }
  const shape = shapes.find(candidate => candidate.id === selectedIds[0]);
  if (!shape) {
    return null;
  }

  const shapeTypeLabel = SHAPE_TYPE_LABELS[shape.type];

  return (
    <Flex direction="column" gap="4" width="220px" p="3" className={s.panel}>
      <Text as="div" size="3" className={s.shapeTypeLabel}>
        {shapeTypeLabel}
      </Text>
      <ShapeSettings shape={shape} />
    </Flex>
  );
}

export { PropertiesPanel };
