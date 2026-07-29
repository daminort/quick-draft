import { Flex, Text, Select } from '@radix-ui/themes';

import type { TDocument } from '~/types/document';

import { UNIT_OPTIONS } from '~/constants/ui';

import { useDocumentStore } from '~/stores/useDocumentStore';

export function UnitsControl() {
  const units = useDocumentStore(state => state.document.units);
  const setUnits = useDocumentStore(state => state.setUnits);

  return (
    <Text as="label" size="2">
      <Flex direction="column" gap="1">
        Measurement units
        <Select.Root value={units} onValueChange={value => setUnits(value as TDocument['units'])}>
          <Select.Trigger />
          <Select.Content>
            {UNIT_OPTIONS.map(unit => (
              <Select.Item key={unit} value={unit}>
                {unit}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>
    </Text>
  );
}
