import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import ModalImage from 'react-modal-image';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Drawer from '@mui/material/Drawer';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';

export default function SkymapPage({ catalog, backPath, label }) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [filters, setFilters] = React.useState([]);
  const [selectedFilters, setSelectedFilters] = React.useState(new Set());

  React.useEffect(() => {
    const maps = catalog.column_mean_maps;
    if (!maps) {
      setFilters([]);
      setSelectedFilters(new Set());
    } else {
      const sorted = [...maps].sort();
      setFilters(sorted);
      setSelectedFilters(new Set(sorted.slice(0, 4)));
    }
  }, [catalog]);

  const toggleFilter = (filter) => {
    const next = new Set(selectedFilters);
    if (next.has(filter)) next.delete(filter);
    else next.add(filter);
    setSelectedFilters(next);
  };

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
            bgcolor: 'rgba(25, 118, 210, 0.07)',
            overflow: 'hidden',
            height: '100%',
          };
          const sidebarContent = (
            <>
              <Box sx={{ px: 2, pt: 1.5, pb: 0.5, flexShrink: 0 }}>
                <Link
                  component='button'
                  underline='hover'
                  onClick={() => navigate(backPath)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.9rem',
                    color: 'text.secondary',
                    mb: 1,
                  }}
                >
                  <ChevronLeftIcon sx={{ fontSize: 16 }} />
                  {label ?? catalog.name}
                </Link>
                <Typography
                  sx={{
                    color: '#1976D2',
                    fontFamily: 'Nunito',
                    fontWeight: 400,
                    fontSize: '1rem',
                    mb: 0.5,
                  }}
                >
                  Mean Column Skymaps
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant='caption' color='text.secondary'>
                    {selectedFilters.size === 0
                      ? 'None selected'
                      : `${selectedFilters.size} / ${filters.length}`}
                  </Typography>
                  <Link
                    component='button'
                    underline='hover'
                    onClick={() => setSelectedFilters(new Set())}
                    disabled={selectedFilters.size === 0}
                    sx={{ fontSize: '0.72rem', color: 'text.secondary' }}
                  >
                    Clear all
                  </Link>
                </Box>
              </Box>
              <Box sx={{ overflowY: 'auto', flex: 1, py: 0.5, scrollbarGutter: 'stable' }}>
                {filters.map((f) => (
                  <FormControlLabel
                    key={f}
                    control={
                      <Checkbox
                        checked={selectedFilters.has(f)}
                        onChange={() => toggleFilter(f)}
                        size='small'
                        sx={{ py: 0.25 }}
                      />
                    }
                    label={
                      <Typography noWrap sx={{ fontWeight: 500, fontSize: '0.82rem' }}>
                        {f}
                      </Typography>
                    }
                    sx={{
                      display: 'flex',
                      mx: 0.5,
                      px: 0.5,
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  />
                ))}
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
        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, bgcolor: 'white' }}>
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
              <IconButton
                onClick={() => setSidebarOpen(true)}
                size='small'
                sx={{ color: '#1976D2' }}
                aria-label='Open filter list'
              >
                <MenuIcon />
              </IconButton>
              <Typography color='#1976D2' fontFamily='Nunito' fontWeight={400} fontSize='1rem'>
                Columns
              </Typography>
            </Box>
          )}
          {selectedFilters.size === 0 ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: 200,
              }}
            >
              <Typography
                sx={{ color: '#555c67', fontFamily: '"Open Sans", sans-serif', fontSize: '1.1rem' }}
              >
                Select columns from the left panel to view their mean skymaps
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: 3,
              }}
            >
              {[...selectedFilters].map((filter) => {
                const src = `/data/${catalog.dir}/column_means/${filter}.webp`;
                return (
                  <Box key={filter}>
                    <ModalImage
                      small={src}
                      large={src}
                      alt={`${catalog.name}: ${filter}`}
                      hideZoom
                      className='skymap-image'
                    />
                    <Typography
                      variant='caption'
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        color: 'text.secondary',
                        fontFamily: 'monospace',
                      }}
                    >
                      {filter}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
