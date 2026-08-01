import { Box, Text } from '@radix-ui/themes';

import s from './HintBar.module.css';

import type { THintBarProps } from './HintBar.props';

const HintBar = ({ text }: THintBarProps) => {
  return (
    <Box px="3" py="2" className={s.container}>
      <Text size="2" color="gray">
        {text}
      </Text>
    </Box>
  );
};

export { HintBar };
