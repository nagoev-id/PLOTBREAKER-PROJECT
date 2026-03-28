'use client';

import { ExternalLink } from 'lucide-react';
import { FC, JSX } from 'react';
import Link from 'next/link';

/**
 * Компонент для открытия сайта из админ-панели
 * @returns {JSX.Element}
 */
const OpenSiteLink: FC = (): JSX.Element => {
  return (
    <Link
      href="/"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        borderRadius: '4px',
        color: 'var(--theme-text)',
        textDecoration: 'none',
        fontSize: '13px',
        border: '1px solid var(--theme-elevation-300)',
        transition: 'background-color 0.15s ease',
        justifyContent: 'center',
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLAnchorElement).style.backgroundColor =
          'var(--theme-elevation-100)';
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLAnchorElement).style.backgroundColor = 'transparent';
      }}
    >
      <ExternalLink size={14} />
      Открыть сайт
    </Link>
  );
};

export default OpenSiteLink;
