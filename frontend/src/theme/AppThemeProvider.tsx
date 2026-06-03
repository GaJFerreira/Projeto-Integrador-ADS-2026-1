import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { theme } from './index';
import snackbarComponents from './SnackbarClickToDismiss';
import type { PropsWithChildren } from 'react';

export function AppThemeProvider({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        Components={snackbarComponents}
      >
        {children}
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default AppThemeProvider;
