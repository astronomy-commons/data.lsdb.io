import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/material';

const JupyterIconProps = () => ({
  sx: {
    borderColor: '#e37534',
    '&:hover': { borderColor: '#c45e1a' },
  },
  startIcon: (
    <Box
      component='img'
      src='/assets/img/jupyter-logo.png'
      alt='Jupyter logo'
      sx={{ height: 16 }}
    />
  ),
});

const baseButtonSx = {
  fontFamily: '"Outfit", sans-serif',
  color: '#012970',
  borderColor: '#012970',
  textTransform: 'capitalize',
  '&:hover': { borderColor: '#01348f', color: '#01348f' },
};

function UrlButton({ title, value }) {
  const { sx: extraSx, ...otherProps } =
    value.endsWith('.ipynb') || title.includes('Rubin') ? JupyterIconProps() : {};
  return (
    value && (
      <Button
        variant='outlined'
        size='small'
        href={value}
        sx={[baseButtonSx, extraSx ?? {}]}
        {...otherProps}
      >
        <span>{title}</span>
      </Button>
    )
  );
}

export default function ReferencesSection({ urls }) {
  return (
    <div>
      <Stack direction='row' spacing={2} flexWrap='wrap'>
        {urls.map((url, index) => (
          <UrlButton key={index} title={url.label} value={url.url} />
        ))}
      </Stack>
    </div>
  );
}
