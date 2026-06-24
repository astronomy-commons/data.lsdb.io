import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CatalogPage from './pages/CatalogPage';
import catalogIndex from '../data/catalogs.json';
import rubinIndex from '../data/rubinCatalogs.json';

const theme = createTheme({
  palette: {
    primary: { main: '#1976D2', contrastText: '#fff' },
    secondary: { main: '#e37534', contrastText: '#fff' },
    tertiary: { main: '#2E7D32', contrastText: '#fff' },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path='/rubin/*' element={<CatalogPage catalogs={rubinIndex} basePath='/rubin' />} />
        <Route
          path='/*'
          element={
            <CatalogPage
              catalogs={catalogIndex}
              basePath='/'
              defaultHash='Rubin_DP1/object_collection'
            />
          }
        />
      </Routes>
    </ThemeProvider>
  );
}
