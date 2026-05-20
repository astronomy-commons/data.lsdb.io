import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import ModalImage from 'react-modal-image';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import { SkymapSidebar } from '../components/SkymapSidebar';

export default function SkymapPage({ catalog, hash, backPath, label }) {
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
        <SkymapSidebar
          catalogName={catalog.name}
          label={label}
          onNavigateBack={() => navigate(backPath)}
          filters={filters}
          selectedFilters={selectedFilters}
          onToggleFilter={toggleFilter}
          onClearAll={() => setSelectedFilters(new Set())}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

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
                const src = `/data/${hash}/column_means/${filter}.webp`;
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
