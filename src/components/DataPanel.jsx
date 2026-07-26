import { useState } from 'react'
import { useFlora } from '../state'
import { EQUIPES, EQUIPE_FIXE, EQUIPE_KEYS } from '../data/config'
import {
  listFloraKeys,
  readJSON,
  removeKey,
  bakKey,
  keyExists,
} from '../lib/storage'
import { formatComplet } from '../lib/dates'

function Section({ title, children }) {
  return (
    <div className="panel-card">
      <h3>{title}</h3>
      {children}
    </div>
  )
}

// Éditeur du poste par défaut d'une personne.
function PosteRow({ name }) {
  const { postesMap, setPoste } = useFlora()
  const def = postesMap[name] || { equipe: 'salle', poste: 'Joker' }

  const onEquipe = (equipe) => {
    setPoste(name, { equipe, poste: EQUIPES[equipe].postes[0] })
  }
  const onPoste = (poste) => setPoste(name, { ...def, poste })

  return (
    <div className="key-row" style={{ background: 'var(--creme)' }}>
      <span style={{ fontWeight: 600, minWidth: 74 }}>{name}</span>
      <div style={{ display: 'flex', gap: 6, flex: 1 }}>
        <select
          className="sel"
          style={{ minHeight: 40, padding: '6px 8px', flex: '0 0 auto' }}
          value={def.equipe}
          onChange={(e) => onEquipe(e.target.value)}
        >
          {EQUIPE_KEYS.map((eq) => (
            <option key={eq} value={eq}>
              {EQUIPES[eq].label}
            </option>
          ))}
        </select>
        <select
          className="sel"
          style={{ minHeight: 40, padding: '6px 8px', flex: 1 }}
          value={def.poste}
          onChange={(e) => onPoste(e.target.value)}
        >
          {EQUIPES[def.equipe].postes.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default function DataPanel() {
  const {
    week,
    mondayISO,
    saveStatus,
    replaceWeek,
    restoreCurrentBackup,
    resetPostes,
    reloadWeek,
  } = useFlora()

  const [importText, setImportText] = useState('')
  const [msg, setMsg] = useState('')
  const [keys, setKeys] = useState(() => listFloraKeys())
  const [showPostes, setShowPostes] = useState(false)

  const refreshKeys = () => setKeys(listFloraKeys())
  const flash = (m) => {
    setMsg(m)
    setTimeout(() => setMsg(''), 2500)
  }

  const exportWeek = async () => {
    const txt = JSON.stringify(week, null, 2)
    setImportText(txt)
    try {
      await navigator.clipboard.writeText(txt)
      flash('Semaine copiée dans le presse-papier ✓')
    } catch {
      flash('Copie impossible — sélectionnez le texte ci-dessous.')
    }
  }

  const doImport = () => {
    let data
    try {
      data = JSON.parse(importText)
    } catch {
      flash('JSON invalide.')
      return
    }
    if (!data || typeof data !== 'object' || !data.days) {
      flash('JSON inattendu (clé "days" manquante).')
      return
    }
    if (
      !window.confirm(
        'Remplacer la semaine actuellement affichée par ce JSON ? Un backup est conservé.',
      )
    )
      return
    const ok = replaceWeek(data)
    flash(ok ? 'Semaine importée ✓' : 'Échec de l’import.')
    refreshKeys()
  }

  const hasBak = keyExists(bakKey(mondayISO))

  return (
    <div>
      <h2 className="section-title">Données</h2>

      {/* État enregistrement */}
      <Section title="Enregistrement">
        <p className="muted">
          Statut :{' '}
          {saveStatus === 'saved'
            ? '✓ Enregistré'
            : saveStatus === 'retry'
              ? '⚠ Échec — réessayez depuis le header'
              : '⚠ Écritures bloquées (données illisibles)'}
        </p>
        <p className="muted" style={{ marginTop: 4 }}>
          Semaine du {formatComplet(mondayISO)} — écriture immédiate à chaque
          modification, backup automatique avant la 1re modification.
        </p>
      </Section>

      {/* Export / Import */}
      <Section title="Exporter / Importer (JSON)">
        <div className="btn-row">
          <button className="btn" onClick={exportWeek}>
            Exporter la semaine
          </button>
          <button className="btn ghost" onClick={doImport}>
            Importer le JSON
          </button>
        </div>
        <textarea
          className="json"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Collez ici un JSON de semaine à importer, ou exportez pour copier la semaine courante…"
        />
        {msg && <p className="muted">{msg}</p>}
      </Section>

      {/* Backup */}
      <Section title="Backup de la semaine">
        <p className="muted">
          {hasBak
            ? 'Un backup existe pour cette semaine.'
            : 'Aucun backup pour l’instant (créé automatiquement à la 1re modification).'}
        </p>
        <div className="btn-row">
          <button
            className="btn ghost"
            onClick={() => {
              if (
                window.confirm(
                  'Restaurer le backup ? La version affichée sera remplacée.',
                )
              ) {
                restoreCurrentBackup()
                flash('Backup restauré ✓')
                refreshKeys()
              }
            }}
            disabled={!hasBak}
          >
            Restaurer le backup
          </button>
          <button className="btn ghost" onClick={reloadWeek}>
            Recharger
          </button>
        </div>
      </Section>

      {/* Clés stockées */}
      <Section title="Clés stockées">
        <div className="btn-row">
          <button className="mini-btn" onClick={refreshKeys}>
            Rafraîchir
          </button>
        </div>
        <div className="key-list">
          {keys.length === 0 && <p className="muted">Aucune clé Flora.</p>}
          {keys.map((k) => (
            <div className="key-row" key={k.key}>
              <span className="kname">{k.key}</span>
              <span className="ksize">{k.size} c.</span>
              <button
                className="mini-btn danger"
                onClick={() => {
                  if (window.confirm(`Supprimer ${k.key} ?`)) {
                    removeKey(k.key)
                    refreshKeys()
                  }
                }}
              >
                Suppr.
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Postes par défaut */}
      <Section title="Postes par défaut ⚙︎">
        <p className="muted">
          Poste par défaut de chaque personne. Sert à ordonner les noms dans le
          sélecteur d’un slot et à pré-affecter. Modifiable à tout moment.
        </p>
        <div className="btn-row">
          <button
            className="mini-btn"
            onClick={() => setShowPostes((v) => !v)}
          >
            {showPostes ? 'Masquer' : 'Modifier les postes'}
          </button>
          <button
            className="mini-btn danger"
            onClick={() => {
              if (window.confirm('Réinitialiser tous les postes par défaut ?'))
                resetPostes()
            }}
          >
            Réinitialiser
          </button>
        </div>
        {showPostes && (
          <div className="key-list" style={{ marginTop: 10 }}>
            {EQUIPE_FIXE.map((name) => (
              <PosteRow key={name} name={name} />
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}
