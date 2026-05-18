import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CatalogTab from '../components/CatalogTab';
import SkymapPage from './SkymapPage';
import NotFoundPage from './NotFoundPage';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const slug = (label) => label.replaceAll(' ', '_').replace('≥', 'gte');

const addHashes = (items, parentHash = '') =>
  items.map((item) => {
    if ('dir' in item) return { ...item, hash: item.dir };
    const hash = parentHash ? `${parentHash}/${slug(item.label)}` : slug(item.label);
    return { ...item, hash, catalogs: addHashes(item.catalogs, hash) };
  });

const findFirstLeaf = (items) => {
  for (const item of items) {
    if ('dir' in item) return item;
    const leaf = findFirstLeaf(item.catalogs);
    if (leaf) return leaf;
  }
  return null;
};

const countLeaves = (item) => {
  if ('dir' in item) return 1;
  return item.catalogs.reduce((n, child) => n + countLeaves(child), 0);
};

const resolve = (items, path, breadcrumbs = []) => {
  if (!path) return { selectedLeaf: findFirstLeaf(items), breadcrumbs };

  const leaf = items.find((i) => 'dir' in i && i.hash === path);
  if (leaf) return { selectedLeaf: leaf, breadcrumbs };

  for (const item of items) {
    if ('dir' in item) continue;
    const crumbs = [...breadcrumbs, { label: item.label, hash: item.hash }];
    if (path === item.hash)
      return { selectedLeaf: findFirstLeaf(item.catalogs), breadcrumbs: crumbs };
    if (path.startsWith(item.hash + '/')) return resolve(item.catalogs, path, crumbs);
  }

  return { selectedLeaf: null, notFound: true, breadcrumbs };
};

const encodePath = (hash) => hash.split('/').map(encodeURIComponent).join('/');

// ---------------------------------------------------------------------------
// Star field (Easter egg — activated on LINCC logo hover)
// ---------------------------------------------------------------------------

const det = (n) => Math.sin(n) * 0.5 + 0.5;

const STAR_DATA = Array.from({ length: 45 }, (_, i) => ({
  id: i,
  left: `${det(i * 13.7) * 100}%`,
  top: `${det(i * 7.3 + 1) * 100}%`,
  size: `${7 + det(i * 5.1) * 11}px`,
  color: i % 3 === 0 ? '#e37534' : '#1976D2',
  duration: `${2 + det(i * 3.7) * 4}s`,
  delay: `-${det(i * 11.3) * 8}s`,
}));

const StarField = () => (
  <Box
    aria-hidden
    sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
  >
    {STAR_DATA.map(({ id, left, top, size, color, duration, delay }) => (
      <Box
        key={id}
        component='span'
        sx={{
          position: 'absolute',
          left,
          top,
          fontSize: size,
          lineHeight: 1,
          color,
          userSelect: 'none',
          animation: `star-float ${duration} ${delay} ease-in-out infinite`,
        }}
      >
        ✦
      </Box>
    ))}
  </Box>
);

const expandedGroupsFor = (items, targetHash, result = new Set()) => {
  if (!targetHash) return result;
  for (const item of items) {
    if ('dir' in item) continue;
    if (targetHash.startsWith(item.hash + '/')) {
      result.add(item.hash);
      expandedGroupsFor(item.catalogs, targetHash, result);
    }
  }
  return result;
};

// ---------------------------------------------------------------------------
// Left panel
// ---------------------------------------------------------------------------

const CatalogListPanel = ({ items, selectedLeaf, onNavigate }) => {
  const [expanded, setExpanded] = React.useState(() =>
    expandedGroupsFor(items, selectedLeaf?.hash)
  );

  const selectedHash = selectedLeaf?.hash;
  React.useEffect(() => {
    if (selectedHash) {
      setExpanded((prev) => new Set([...prev, ...expandedGroupsFor(items, selectedHash)]));
    }
  }, [selectedHash, items]);

  const toggle = (hash) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(hash) ? next.delete(hash) : next.add(hash);
      return next;
    });

  const renderItems = (nodeItems, depth = 0) =>
    nodeItems.map((item) => {
      const isGroup = !('dir' in item);
      const isExpanded = isGroup && expanded.has(item.hash);
      const isSelected = !isGroup && item.hash === selectedLeaf?.hash;

      return (
        <React.Fragment key={item.hash}>
          <ListItemButton
            selected={isSelected}
            onClick={() => (isGroup ? toggle(item.hash) : onNavigate(item.hash))}
            sx={{ py: 1, mx: 0.5, borderRadius: 1, pl: 1 + depth * 2 }}
          >
            {isGroup && (
              <ListItemIcon sx={{ minWidth: 36 }}>
                <FolderOutlinedIcon fontSize='small' color='primary' />
              </ListItemIcon>
            )}
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontWeight: 500, noWrap: true }}
            />
            {isGroup && (
              <>
                <Chip
                  label={countLeaves(item)}
                  size='small'
                  sx={{ mr: 0.5, height: 18, fontSize: '0.7rem', pointerEvents: 'none' }}
                />
                <ChevronRightIcon
                  fontSize='small'
                  sx={{
                    color: 'text.disabled',
                    flexShrink: 0,
                    transform: isExpanded ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
              </>
            )}
          </ListItemButton>
          {isExpanded && renderItems(item.catalogs, depth + 1)}
        </React.Fragment>
      );
    });

  return (
    <List disablePadding dense>
      {renderItems(items)}
    </List>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CatalogPage({ catalogs, basePath }) {
  const { '*': rawPath = '' } = useParams();
  const navigate = useNavigate();

  const isSkymap = rawPath.endsWith('/skymaps');
  const catalogPath = isSkymap ? rawPath.slice(0, -8) : rawPath;

  const base = basePath === '/' ? '' : basePath;
  const pathTo = React.useCallback(
    (hash) => (hash ? `${base}/${encodePath(hash)}` : basePath),
    [base, basePath]
  );

  const catalogsWithHashes = React.useMemo(() => addHashes(catalogs), [catalogs]);
  const { selectedLeaf, notFound, breadcrumbs } = resolve(catalogsWithHashes, catalogPath);

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
    const dir = selectedLeaf?.dir;
    if (!dir) return;
    setLoading(true);
    fetch(`/data/${dir}/catalog.json`)
      .then((r) => r.json())
      .then((data) => {
        setCatalogData(data);
        setLoading(false);
      });
  }, [selectedLeaf?.dir]);

  if (notFound) return <NotFoundPage />;

  if (isSkymap) {
    if (!catalogData) return null;
    if (!catalogData.column_mean_maps?.length) return <NotFoundPage />;
    return (
      <SkymapPage
        catalog={catalogData}
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
        {/* Sidebar — inline on desktop, Drawer on mobile */}
        {(() => {
          const sidebarSx = {
            width: 280,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: 1,
            borderColor: 'divider',
            overflow: 'hidden',
            bgcolor: 'rgba(25, 118, 210, 0.0)',
            height: '100%',
          };
          const sidebarContent = (
            <>
              <Box sx={{ px: 2, pt: '1rem', pb: '0.1rem', flexShrink: 0 }}>
                <Typography
                  sx={{ color: '#1976D2', fontFamily: 'Nunito', fontWeight: 400, fontSize: '1rem' }}
                >
                  Catalogs
                </Typography>
              </Box>
              <Box sx={{ overflowY: 'auto', flex: 1, py: 0.5, scrollbarGutter: 'stable' }}>
                <CatalogListPanel
                  items={catalogsWithHashes}
                  selectedLeaf={selectedLeaf}
                  onNavigate={(hash) => {
                    navigate(pathTo(hash));
                    setSidebarOpen(false);
                  }}
                />
              </Box>
            </>
          );
          return isMobile ? (
            <Drawer
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              PaperProps={{ sx: { ...sidebarSx, bgcolor: '#eef5fc', height: '100%' } }}
            >
              {sidebarContent}
            </Drawer>
          ) : (
            <Box sx={sidebarSx}>{sidebarContent}</Box>
          );
        })()}

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
