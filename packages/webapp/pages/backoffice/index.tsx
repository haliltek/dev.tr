import type { ReactElement } from 'react';
import { useEffect } from 'react';
import Head from 'next/head';

export default function BackofficeRedirect(): ReactElement {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDirectPort = window.location.port === '3096' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const targetUrl = isDirectPort
        ? `http://${window.location.hostname}:5003`
        : '/admin';
      window.location.replace(targetUrl);
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0d1117',
      color: '#c9d1d9',
      fontFamily: 'sans-serif'
    }}>
      <Head>
        <title>Yönlendiriliyor | Devcore.tr Admin</title>
      </Head>
      <div style={{
        padding: '2rem',
        borderRadius: '8px',
        backgroundColor: '#161b22',
        border: '1px solid #30363d',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#58a6ff', marginBottom: '1rem' }}>Devcore.tr Yönetim Paneline Yönlendiriliyorsunuz...</h2>
        <p style={{ color: '#8b949e', marginBottom: '1.5rem' }}>Yeni güvenli TailAdmin paneline aktarılıyorsunuz.</p>
        <a
          href={typeof window !== 'undefined' && (window.location.port === '3096' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? `http://${window.location.hostname}:5003` : '/admin'}
          style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: '#238636',
            color: '#ffffff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          Panele Git &rarr;
        </a>
      </div>
    </div>
  );
}
