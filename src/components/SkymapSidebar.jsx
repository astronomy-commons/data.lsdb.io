import * as React from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Drawer from '@mui/material/Drawer';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

export const SkymapSidebar = ({
  catalogName,
  label,
  onNavigateBack,
  filters,
  selectedFilters,
  onToggleFilter,
  onClearAll,
  isMobile,
  sidebarOpen,
  onClose,
}) => {
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
  const content = (
    <>
      <Box sx={{ px: 2, pt: 1.5, pb: 0.5, flexShrink: 0 }}>
        <Link
          component='button'
          underline='hover'
          onClick={onNavigateBack}
          sx={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.9rem',
            color: 'text.secondary',
            mb: 1,
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 16 }} />
          {label ?? catalogName}
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='caption' color='text.secondary'>
            {selectedFilters.size === 0
              ? 'None selected'
              : `${selectedFilters.size} / ${filters.length}`}
          </Typography>
          <Link
            component='button'
            underline='hover'
            onClick={onClearAll}
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
                onChange={() => onToggleFilter(f)}
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
      onClose={onClose}
      PaperProps={{ sx: { ...sidebarSx, bgcolor: '#eef5fc', height: '100%' } }}
    >
      {content}
    </Drawer>
  ) : (
    <Box sx={sidebarSx}>{content}</Box>
  );
};
