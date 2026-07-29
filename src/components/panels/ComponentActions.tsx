import { useState } from 'react';

import { Flex, Text, TextField, Button } from '@radix-ui/themes';

import { useDocumentStore } from '~/stores/useDocumentStore';
import { useSelectionStore } from '~/stores/useSelectionStore';

export function ComponentActions() {
  const selectedIds = useSelectionStore(state => state.selectedIds);
  const select = useSelectionStore(state => state.select);
  const createComponent = useDocumentStore(state => state.createComponent);
  const [name, setName] = useState('');

  if (selectedIds.length <= 1) {
    return null;
  }

  const onCreate = () => {
    const instanceId = createComponent(selectedIds, name.trim() || 'Component');
    // Deferred: the instance's Konva node registers on mount, one render after this one — selecting
    // it a tick later (instead of in the same batch) lets the Transformer find it immediately.
    if (instanceId) {
      setTimeout(() => select([instanceId]), 0);
    }
    setName('');
  };

  return (
    <Flex direction="column" gap="2">
      <Text as="div" size="2" weight="bold">
        Component
      </Text>
      <Text as="p" size="1" color="gray">
        {selectedIds.length} shapes selected
      </Text>
      <Text as="label" size="2">
        <Flex direction="column" gap="1">
          Name
          <TextField.Root
            type="text"
            value={name}
            placeholder="Component"
            onChange={e => setName(e.target.value)}
          />
        </Flex>
      </Text>
      <Button type="button" onClick={onCreate}>
        Group into component
      </Button>
    </Flex>
  );
}
