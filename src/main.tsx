import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';
import { Theme } from '@radix-ui/themes';

import '@radix-ui/themes/styles.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '~/index.css';
import { App } from '~/App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme style={{ height: '100%' }}>
      <App />
    </Theme>
  </StrictMode>,
);
