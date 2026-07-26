import { useFlora } from '../state'
import { formatPlageSemaine } from '../lib/dates'

function SavePill({ status, onRetry }) {
  if (status === 'blocked') {
    return <span className="save-pill blocked">⚠ Bloqué</span>
  }
  if (status === 'retry') {
    return (
      <button className="save-pill retry" onClick={onRetry}>
        ⚠ Réessayer
      </button>
    )
  }
  return <span className="save-pill ok">✓ Enregistré</span>
}

export default function Header() {
  const { mondayISO, saveStatus, retrySave, goPrev, goNext, goToday } =
    useFlora()

  return (
    <header className="header">
      <div className="header-top">
        <div className="brand">
          <span className="brand-glyph">✿</span>
          <div style={{ minWidth: 0 }}>
            <div className="brand-name">Café Flora</div>
            <div className="brand-sub">Planning</div>
          </div>
        </div>
        <SavePill status={saveStatus} onRetry={retrySave} />
      </div>

      <div className="weeknav">
        <button className="arrow" onClick={goPrev} aria-label="Semaine précédente">
          ‹
        </button>
        <div className="weeknav-label">
          <div className="plage">Semaine {formatPlageSemaine(mondayISO)}</div>
          <button className="today-link" onClick={goToday}>
            Aller à la semaine en cours
          </button>
        </div>
        <button className="arrow" onClick={goNext} aria-label="Semaine suivante">
          ›
        </button>
      </div>
    </header>
  )
}
