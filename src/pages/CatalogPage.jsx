import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import CatalogTab from '../components/CatalogTab';
import { CatalogSidebar } from '../components/CatalogSidebar';
import { StarField } from '../components/StarField';
import SkymapPage from './SkymapPage';
import NotFoundPage from './NotFoundPage';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const slug = (label) => label.replaceAll(' ', '_').replace('≥', 'gte');

const addHashes = (items, parentHash = '') =>
  items.map((item) => {
    const label = typeof item === 'string' ? item : item.label;
    const hash = parentHash ? `${parentHash}/${slug(label)}` : slug(label);
    if (typeof item === 'string' || !('catalogs' in item)) return { label, hash };
    return { ...item, hash, catalogs: addHashes(item.catalogs, hash) };
  });

const findFirstLeaf = (items) => {
  for (const item of items) {
    if (!('catalogs' in item)) return item;
    const leaf = findFirstLeaf(item.catalogs);
    if (leaf) return leaf;
  }
  return null;
};

const findLeafByHash = (items, hash) => {
  for (const item of items) {
    if (!('catalogs' in item)) {
      if (item.hash === hash) return item;
    } else {
      const leaf = findLeafByHash(item.catalogs, hash);
      if (leaf) return leaf;
    }
  }
  return null;
};

const resolve = (items, path, breadcrumbs = [], defaultHash = null) => {
  if (!path) {
    const fallback = (defaultHash && findLeafByHash(items, defaultHash)) || findFirstLeaf(items);
    return { selectedLeaf: fallback, breadcrumbs };
  }

  const leaf = items.find((i) => !('catalogs' in i) && i.hash === path);
  if (leaf) return { selectedLeaf: leaf, breadcrumbs };

  for (const item of items) {
    if (!('catalogs' in item)) continue;
    const crumbs = [...breadcrumbs, { label: item.label, hash: item.hash }];
    if (path === item.hash)
      return { selectedLeaf: findFirstLeaf(item.catalogs), breadcrumbs: crumbs };
    if (path.startsWith(item.hash + '/')) return resolve(item.catalogs, path, crumbs);
  }

  return { selectedLeaf: null, notFound: true, breadcrumbs };
};

const encodePath = (hash) => hash.split('/').map(encodeURIComponent).join('/');

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CatalogPage({ catalogs, basePath, defaultHash = null }) {
  const { '*': rawPath = '' } = useParams();
  const navigate = useNavigate();

  const cleanPath = rawPath.replace(/\/$/, '');
  const isSkymap = cleanPath.endsWith('/skymaps');
  const catalogPath = isSkymap ? cleanPath.slice(0, -8) : cleanPath;

  const base = basePath === '/' ? '' : basePath;
  const pathTo = React.useCallback(
    (hash) => (hash ? `${base}/${encodePath(hash)}` : basePath),
    [base, basePath]
  );

  const catalogsWithHashes = React.useMemo(() => addHashes(catalogs), [catalogs]);
  const { selectedLeaf, notFound, breadcrumbs } = resolve(
    catalogsWithHashes,
    catalogPath,
    [],
    defaultHash
  );

  const isMobile = useMediaQuery('(max-width:900px)');
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [catalogData, setCatalogData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [logoHovered, setLogoHovered] = React.useState(false);

  React.useEffect(() => {
    const hash = selectedLeaf?.hash;
    if (!isSkymap && !notFound && !catalogPath && hash) {
      navigate(pathTo(hash), { replace: true });
    }
  }, [catalogPath, selectedLeaf?.hash, isSkymap, notFound, navigate, pathTo]);

  React.useEffect(() => {
    const dir = selectedLeaf?.hash;
    if (!dir) return;
    setLoading(true);
    fetch(`/data/${dir}/catalog.json`)
      .then((r) => r.json())
      .then((data) => {
        setCatalogData(data);
        setLoading(false);
      });
  }, [selectedLeaf?.hash]);

  if (notFound) return <NotFoundPage />;

  if (isSkymap) {
    if (!catalogData) return null;
    if (!catalogData.column_mean_maps?.length) return <NotFoundPage />;
    return (
      <SkymapPage
        catalog={catalogData}
        hash={selectedLeaf.hash}
        backPath={pathTo(selectedLeaf.hash)}
        label={selectedLeaf.label}
      />
    );
  }

  const skymapPath = selectedLeaf ? `${pathTo(selectedLeaf.hash)}/skymaps` : null;

  return (
    <Box
      id='catalog-section'
      sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
    >
      <Box
        sx={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0, overflow: 'hidden' }}
      >
        <CatalogSidebar
          catalogsWithHashes={catalogsWithHashes}
          selectedLeaf={selectedLeaf}
          onNavigate={(hash) => {
            navigate(pathTo(hash));
            setSidebarOpen(false);
          }}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              height: '100%',
              overflowY: 'auto',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                bgcolor: 'white',
                p: { xs: 2, md: 4 },
                opacity: loading ? 0.4 : 1,
                transition: 'opacity 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100%',
              }}
            >
              <Box sx={{ flex: 1 }}>
                {logoHovered && <StarField />}
                {isMobile && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                    <IconButton
                      onClick={() => setSidebarOpen(true)}
                      size='small'
                      sx={{ color: '#1976D2' }}
                      style={{ paddingLeft: 0 }}
                      aria-label='Open catalog list'
                    >
                      <MenuIcon />
                    </IconButton>
                    <Typography
                      sx={{
                        color: '#1976D2',
                        fontFamily: 'Nunito',
                        fontWeight: 400,
                        fontSize: '1rem',
                      }}
                    >
                      Catalogs
                    </Typography>
                  </Box>
                )}
                {breadcrumbs.length > 0 && (
                  <Box sx={{ maxWidth: '70em', mx: 'auto', width: '100%', mb: 1.5 }}>
                    <Breadcrumbs separator='/'>
                      {breadcrumbs.map((crumb) => (
                        <Typography key={crumb.hash} fontSize='0.8rem' sx={{ color: '#6b7280' }}>
                          {crumb.label}
                        </Typography>
                      ))}
                      {selectedLeaf && (
                        <Typography fontSize='0.8rem' sx={{ color: '#6b7280' }} fontWeight={400}>
                          {selectedLeaf.label}
                        </Typography>
                      )}
                    </Breadcrumbs>
                  </Box>
                )}
                {catalogData && <CatalogTab catalog_info={catalogData} skymapPath={skymapPath} />}
              </Box>
              <footer className='catalog-footer'>
                <img
                  src='/assets/img/lincc-logo.webp'
                  alt='LINCC logo'
                  onMouseEnter={() => setLogoHovered(true)}
                  onMouseLeave={() => setLogoHovered(false)}
                  style={{ cursor: 'default' }}
                />
                <p>
                  This project is supported by Schmidt Sciences. This project is based upon work
                  supported by the National Science Foundation under Grant No. AST-2003196. This
                  project acknowledges support from the DIRAC Institute in the Department of
                  Astronomy at the University of Washington. The DIRAC Institute is supported
                  through generous gifts from the Charles and Lisa Simonyi Fund for Arts and
                  Sciences, and the Washington Research Foundation.
                </p>
              </footer>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
