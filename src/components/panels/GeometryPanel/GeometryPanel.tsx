import type { ChangeEvent } from 'react';

import { Flex, Text, TextField, Select } from '@radix-ui/themes';

import { COMPONENT_INSTANCE_MIN_SCALE } from '~/constants/componentLibrary';

import { documentActions } from '~/stores/documentStore';

import type {
  TNumberFieldProps,
  TGeometryFieldsProps,
  TGeometryPanelProps,
} from './GeometryPanel.props';

const NumberField = ({ label, value, min, onChange }: TNumberFieldProps) => {
  const onFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    if (Number.isFinite(next)) {
      onChange(next);
    }
  };

  return (
    <Text as="label" size="2">
      <Flex direction="column" gap="1">
        {label}
        <TextField.Root type="number" min={min} value={value} onChange={onFieldChange} />
      </Flex>
    </Text>
  );
};

const GeometryFields = ({ shape }: TGeometryFieldsProps) => {
  switch (shape.type) {
    case 'guide': {
      const onOrientationChange = (value: string) =>
        documentActions.updateShape(shape.id, { orientation: value as 'h' | 'v' | 'angle' });
      const onPositionChange = (v: number) =>
        documentActions.updateShape(shape.id, { position: v });
      const onAngleChange = (v: number) => documentActions.updateShape(shape.id, { angle: v });

      return (
        <>
          <Text as="label" size="2">
            <Flex direction="column" gap="1">
              Orientation
              <Select.Root value={shape.orientation} onValueChange={onOrientationChange}>
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="h">Horizontal</Select.Item>
                  <Select.Item value="v">Vertical</Select.Item>
                  <Select.Item value="angle">Angle</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>
          </Text>
          <NumberField label="Position" value={shape.position} onChange={onPositionChange} />
          {shape.orientation === 'angle' && (
            <NumberField label="Angle" value={shape.angle ?? 0} onChange={onAngleChange} />
          )}
        </>
      );
    }
    case 'component-instance': {
      const onXChange = (v: number) => documentActions.updateShape(shape.id, { x: v });
      const onYChange = (v: number) => documentActions.updateShape(shape.id, { y: v });
      const onScaleChange = (v: number) => documentActions.updateShape(shape.id, { scale: v });
      const onRotationChange = (v: number) =>
        documentActions.updateShape(shape.id, { rotation: v });

      return (
        <>
          <NumberField label="X" value={shape.x} onChange={onXChange} />
          <NumberField label="Y" value={shape.y} onChange={onYChange} />
          <NumberField
            label="Scale"
            value={shape.scale}
            min={COMPONENT_INSTANCE_MIN_SCALE}
            onChange={onScaleChange}
          />
          <NumberField label="Rotation" value={shape.rotation} onChange={onRotationChange} />
        </>
      );
    }
    default:
      return null;
  }
};

const GeometryPanel = ({ shape }: TGeometryPanelProps) => {
  return (
    <Flex direction="column" gap="2">
      <GeometryFields shape={shape} />
    </Flex>
  );
};

export { GeometryPanel };
