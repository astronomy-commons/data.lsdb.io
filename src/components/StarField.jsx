import * as React from 'react';
import Box from '@mui/material/Box';

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

export const StarField = () => (
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
