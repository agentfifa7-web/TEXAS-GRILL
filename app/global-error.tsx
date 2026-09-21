'use client'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ background: '#0b0605', color: '#f7f1e4', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: 24 }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>Texas Grill est momentanément indisponible.</h1>
          <p style={{ color: '#c9beac', maxWidth: 360 }}>Une erreur critique est survenue. Merci de réessayer dans quelques instants.</p>
          <button
            onClick={reset}
            style={{ border: 0, borderRadius: 999, padding: '12px 22px', background: '#e5283a', color: 'white', fontWeight: 800, cursor: 'pointer' }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  )
}
