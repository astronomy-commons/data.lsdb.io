import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';

const countLeaves = (item) => {
  if (!('catalogs' in item)) return 1;
  return item.catalogs.reduce((n, child) => n + countLeaves(child), 0);
};

const expandedGroupsFor = (items, targetHash, result = new Set()) => {
  if (!targetHash) return result;
  for (const item of items) {
    if (!('catalogs' in item)) continue;
    if (targetHash.startsWith(item.hash + '/')) {
      result.add(item.hash);
      expandedGroupsFor(item.catalogs, targetHash, result);
    }
  }
  return result;
};

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
      const isGroup = 'catalogs' in item;
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

export const CatalogSidebar = ({
  catalogsWithHashes,
  selectedLeaf,
  onNavigate,
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
    overflow: 'hidden',
    bgcolor: 'rgba(25, 118, 210, 0.0)',
    height: '100%',
  };
  const content = (
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
          onNavigate={onNavigate}
        />
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
