import type { ChangeEvent } from 'react';

import { Flex, Text, TextField, Select } from '@radix-ui/themes';

import type { TShape, TShapeId, TShapePatch } from '~/types/document';

import { COMPONENT_INSTANCE_MIN_SCALE } from '~/constants/componentLibrary';

import { useDocumentStore } from '~/stores/useDocumentStore';

type TNumberFieldProps = {
  label: string;
  value: number;
  min?: number;
  onChange: (value: number) => void;
};

function NumberField({ label, value, min, onChange }: TNumberFieldProps) {
  function onFieldChange(e: ChangeEvent<HTMLInputElement>) {
    const next = Number(e.target.value);
    if (Number.isFinite(next)) {
      onChange(next);
    }
  }

  return (
    <Text as="label" size="2">
      <Flex direction="column" gap="1">
        {label}
        <TextField.Root type="number" min={min} value={value} onChange={onFieldChange} />
      </Flex>
    </Text>
  );
}

type TGeometryFieldsProps = {
  shape: Extract<TShape, { type: 'guide' | 'component-instance' }>;
  updateShape: (id: TShapeId, patch: TShapePatch) => void;
};

function GeometryFields({ shape, updateShape }: TGeometryFieldsProps) {
  switch (shape.type) {
    case 'guide': {
      const onOrientationChange = (value: string) =>
        updateShape(shape.id, { orientation: value as 'h' | 'v' | 'angle' });
      const onPositionChange = (v: number) => updateShape(shape.id, { position: v });
      const onAngleChange = (v: number) => updateShape(shape.id, { angle: v });

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
      const onXChange = (v: number) => updateShape(shape.id, { x: v });
      const onYChange = (v: number) => updateShape(shape.id, { y: v });
      const onScaleChange = (v: number) => updateShape(shape.id, { scale: v });
      const onRotationChange = (v: number) => updateShape(shape.id, { rotation: v });

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
}

type TGeometryPanelProps = {
  shape: Extract<TShape, { type: 'guide' | 'component-instance' }>;
};

export function GeometryPanel({ shape }: TGeometryPanelProps) {
  const updateShape = useDocumentStore(state => state.updateShape);

  return (
    <Flex direction="column" gap="2">
      <GeometryFields shape={shape} updateShape={updateShape} />
    </Flex>
  );
}
