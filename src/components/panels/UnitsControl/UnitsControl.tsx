import { Flex, Text, Select } from '@radix-ui/themes';

import type { TDocument } from '~/types/document';

import { UNIT_OPTIONS } from '~/constants/ui';

import { documentStore, documentSelectors, documentActions } from '~/stores/documentStore';

function UnitsControl() {
  const units = documentStore(documentSelectors.getUnits);

  const onUnitsChange = (value: string) => documentActions.setUnits(value as TDocument['units']);

  return (
    <Text as="label" size="2">
      <Flex direction="column" gap="1">
        Measurement units
        <Select.Root value={units} onValueChange={onUnitsChange}>
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

export { UnitsControl };
