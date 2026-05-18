import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import useMediaQuery from '@mui/material/useMediaQuery';

const cellBase = {
  fontFamily: '"Open Sans", sans-serif',
  padding: '7px 14px',
  whiteSpace: 'nowrap',
  borderBottom: 0,
};

export default function MetadataTable({ metadata }) {
  const isMobile = useMediaQuery('(max-width:900px)');
  const fields = [
    {
      label: 'Rows',
      value: metadata.numRows,
      formatter: (v) => v.toLocaleString(),
      width: '8rem',
    },
    {
      label: 'Columns',
      value: metadata.numColumns,
      formatter: (v) => v.toLocaleString(),
      width: '8rem',
    },
    {
      label: 'Partitions',
      value: metadata.numPartitions,
      formatter: (v) => v.toLocaleString(),
      width: '8rem',
    },
    { label: 'Size on disk', value: metadata.sizeOnDisk, width: '8rem' },
    { label: 'Builder', value: metadata.hatsBuilder },
  ];

  return (
    <div>
      <TableContainer
        sx={{ borderTop: '1px solid rgba(0,0,0,0.08)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}
      >
        <Table size='small' sx={{ tableLayout: 'fixed', width: '100%' }}>
          {isMobile ? (
            <TableBody>
              {fields.map(({ label, value, formatter }) => (
                <TableRow key={label}>
                  <TableCell
                    sx={{
                      ...cellBase,
                      width: '9rem',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      borderBottom: '1px solid rgba(0,0,0,0.07)',
                    }}
                  >
                    {label}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...cellBase,
                      fontSize: '0.83rem',
                      color: value ? '#1f2937' : '#d1d5db',
                      borderBottom: '1px solid rgba(0,0,0,0.07)',
                    }}
                  >
                    {value ? (formatter ? formatter(value) : value) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <>
              <TableHead>
                <TableRow>
                  {fields.map(({ label, width }) => (
                    <TableCell
                      key={label}
                      sx={{
                        ...cellBase,
                        width,
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        borderBottom: '1px solid rgba(0,0,0,0.07)',
                        paddingBottom: '6px',
                      }}
                    >
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {fields.map(({ label, value, formatter }) => (
                    <TableCell
                      key={label}
                      sx={{
                        ...cellBase,
                        fontSize: '0.83rem',
                        color: value ? '#1f2937' : '#d1d5db',
                        paddingTop: '8px',
                      }}
                    >
                      {value ? (formatter ? formatter(value) : value) : '—'}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </>
          )}
        </Table>
      </TableContainer>
    </div>
  );
}
