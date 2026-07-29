import { Flex, Text, TextField, Select } from '@radix-ui/themes';

import type { Shape, ShapeId, ShapePatch } from '~/types/document';

import { useDocumentStore } from '~/stores/useDocumentStore';

interface NumberFieldProps {
  label: string;
  value: number;
  min?: number;
  onChange: (value: number) => void;
}

function NumberField({ label, value, min, onChange }: NumberFieldProps) {
  return (
    <Text as="label" size="2">
      <Flex direction="column" gap="1">
        {label}
        <TextField.Root
          type="number"
          min={min}
          value={value}
          onChange={e => {
            const next = Number(e.target.value);
            if (Number.isFinite(next)) {
              onChange(next);
            }
          }}
        />
      </Flex>
    </Text>
  );
}

interface GeometryFieldsProps {
  shape: Extract<Shape, { type: 'guide' | 'component-instance' }>;
  updateShape: (id: ShapeId, patch: ShapePatch) => void;
}

function GeometryFields({ shape, updateShape }: GeometryFieldsProps) {
  switch (shape.type) {
    case 'guide':
      return (
        <>
          <Text as="label" size="2">
            <Flex direction="column" gap="1">
              Orientation
              <Select.Root
                value={shape.orientation}
                onValueChange={value =>
                  updateShape(shape.id, {
                    orientation: value as 'h' | 'v' | 'angle',
                  })
                }
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="h">Horizontal</Select.Item>
                  <Select.Item value="v">Vertical</Select.Item>
                  <Select.Item value="angle">Angle</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>
          </Text>
          <NumberField
            label="Position"
            value={shape.position}
            onChange={v => updateShape(shape.id, { position: v })}
          />
          {shape.orientation === 'angle' && (
            <NumberField
              label="Angle"
              value={shape.angle ?? 0}
              onChange={v => updateShape(shape.id, { angle: v })}
            />
          )}
        </>
      );
    case 'component-instance':
      return (
        <>
          <NumberField label="X" value={shape.x} onChange={v => updateShape(shape.id, { x: v })} />
          <NumberField label="Y" value={shape.y} onChange={v => updateShape(shape.id, { y: v })} />
          <NumberField
            label="Scale"
            value={shape.scale}
            min={0.01}
            onChange={v => updateShape(shape.id, { scale: v })}
          />
          <NumberField
            label="Rotation"
            value={shape.rotation}
            onChange={v => updateShape(shape.id, { rotation: v })}
          />
        </>
      );
    default:
      return null;
  }
}

interface GeometryPanelProps {
  shape: Extract<Shape, { type: 'guide' | 'component-instance' }>;
}

export function GeometryPanel({ shape }: GeometryPanelProps) {
  const updateShape = useDocumentStore(state => state.updateShape);

  return (
    <Flex direction="column" gap="2">
      <GeometryFields shape={shape} updateShape={updateShape} />
    </Flex>
  );
}
