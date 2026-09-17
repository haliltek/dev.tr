'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontFamily: 'sans-serif' }}>
          <h2>Bir şeyler ters gitti!</h2>
          <button
            onClick={() => reset()}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
          >
            Yeniden Dene
          </button>
        </div>
      </body>
    </html>
  );
}
