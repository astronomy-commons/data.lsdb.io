import * as React from 'react';
import Alert from '@mui/material/Alert';

export const InfoBanner = ({ title, children }) => {
  const isString = typeof children === 'string';
  return (
    <Alert severity='info'>
      {title && <h5>{title}</h5>}
      {isString ? <div dangerouslySetInnerHTML={{ __html: children }} /> : children}
    </Alert>
  );
};

export const WarningBanner = ({ title, children }) => {
  const isString = typeof children === 'string';
  return (
    <Alert className='s3-warning' severity='warning'>
      {title && <h5>{title}</h5>}
      {isString ? <div dangerouslySetInnerHTML={{ __html: children }} /> : children}
    </Alert>
  );
};
