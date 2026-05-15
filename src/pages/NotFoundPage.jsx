import * as React from 'react';

const TelescopeIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='80'
    height='80'
    viewBox='0 0 24 24'
    fill='none'
    stroke='#012970'
    strokeWidth='1.2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <circle cx='17' cy='7' r='3' />
    <line x1='17' y1='10' x2='17' y2='21' />
    <line x1='14' y1='21' x2='20' y2='21' />
    <line x1='3' y1='12' x2='14' y2='7' />
    <line x1='3' y1='7' x2='14' y2='12' />
    <line x1='3' y1='7' x2='3' y2='12' />
    <circle cx='4.5' cy='3.5' r='0.5' fill='#012970' />
    <circle cx='8' cy='2' r='0.5' fill='#012970' />
    <circle cx='11.5' cy='3' r='0.5' fill='#012970' />
    <circle cx='20.5' cy='3.5' r='0.5' fill='#012970' />
    <circle cx='22' cy='6' r='0.5' fill='#012970' />
  </svg>
);

export default function NotFoundPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '16px',
        fontFamily: '"Open Sans", sans-serif',
        color: '#444444',
        textAlign: 'center',
        padding: '32px',
      }}
    >
      <TelescopeIcon />
      <h1
        style={{
          fontFamily: '"Outfit", sans-serif',
          fontSize: '5rem',
          fontWeight: 300,
          color: '#012970',
          margin: 0,
          lineHeight: 1,
        }}
      >
        404
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#555c67', margin: 0 }}>
        Nothing here — this catalog doesn&apos;t exist.
      </p>
      <a
        href='/'
        style={{
          marginTop: '8px',
          padding: '8px 24px',
          border: '1px solid #012970',
          borderRadius: '4px',
          color: '#012970',
          fontFamily: '"Outfit", sans-serif',
          fontSize: '0.95rem',
          textDecoration: 'none',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(1,41,112,0.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        Browse catalogs
      </a>
    </div>
  );
}
