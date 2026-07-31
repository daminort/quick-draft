import { useState } from 'react';
import type { ChangeEvent } from 'react';

import { Flex, Text, TextField, Button } from '@radix-ui/themes';

import { documentActions } from '~/stores/documentStore';
import { selectionStore, selectionSelectors, selectionActions } from '~/stores/selectionStore';

function ComponentActions() {
  const selectedIds = selectionStore(selectionSelectors.getSelectedIds);
  const [name, setName] = useState('');

  if (selectedIds.length <= 1) {
    return null;
  }

  const onCreate = () => {
    const instanceId = documentActions.createComponent(selectedIds, name.trim() || 'Component');
    // Deferred: the instance's Konva node registers on mount, one render after this one — selecting
    // it a tick later (instead of in the same batch) lets the Transformer find it immediately.
    if (instanceId) {
      setTimeout(() => selectionActions.select([instanceId]), 0);
    }
    setName('');
  };

  const selectedCount = selectedIds.length;

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  return (
    <Flex direction="column" gap="2">
      <Text as="div" size="2" weight="bold">
        Component
      </Text>
      <Text as="p" size="1" color="gray">
        {selectedCount} shapes selected
      </Text>
      <Text as="label" size="2">
        <Flex direction="column" gap="1">
          Name
          <TextField.Root
            type="text"
            value={name}
            onChange={onNameChange}
            placeholder="Component"
          />
        </Flex>
      </Text>
      <Button type="button" onClick={onCreate}>
        Group into component
      </Button>
    </Flex>
  );
}

export { ComponentActions };
