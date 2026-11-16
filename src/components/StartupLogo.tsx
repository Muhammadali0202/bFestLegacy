'use client';

import React from 'react';

interface StartupLogoProps {
  logo?: string;
  name?: string;
  size?: number | string;
  fontSize?: string;
  rounded?: string;
}

export default function StartupLogo({
  logo = '🚀',
  name = 'Startup logo',
  size = 40,
  fontSize = '1.5rem',
  rounded = '10px',
}: StartupLogoProps) {
  const isImage =
    typeof logo === 'string' &&
    (logo.startsWith('data:image/') || logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('/'));

  if (isImage) {
    return (
      <img
        src={logo}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: rounded,
          objectFit: 'cover',
          flexShrink: 0,
          background: '#ffffff',
          border: '1px solid rgba(148, 163, 184, 0.25)',
        }}
      />
    );
  }

  return (
    <span
      style={{
        fontSize,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {logo || '🚀'}
    </span>
  );
}
