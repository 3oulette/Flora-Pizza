import { useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { useFlora } from '../state'
import {
  CRENEAUX,
  CRENEAU_LABEL,
  EQUIPE_FIXE,
  SHIFT_CODES,
  SHIFT_COLOR,
} from '../data/config'
import {
  JOURS_COURTS,
  JOURS_LONGS,
  formatJourMois,
  formatPlageSemaine,
  weekDays,
} from '../lib/dates'
import { shiftCodeForPerson } from '../lib/shifts'
import {
  buildTextExport,
  creneauDetail,
  personHasExtraThisDay,
} from '../lib/share'

export default function ShareView() {
  const { week, mondayISO, allNames } = useFlora()
  const dayKeys = useMemo(() => weekDays(mondayISO), [mondayISO])
  const posterRef = useRef(null)

  const [detailParJour, setDetailParJour] = useState(false)
  const [actifsSeulement, setActifsSeulement] = useState(true)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')

  if (!week) return null

  const worksThisWeek = (name) =>
    dayKeys.some((k) => shiftCodeForPerson(week.days[k] || {}, name))

  const baseNames = [
    ...EQUIPE_FIXE,
    ...allNames.filter((n) => !EQUIPE_FIXE.includes(n)),
  ]
  const names = actifsSeulement ? baseNames.filter(worksThisWeek) : baseNames

  const flash = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const exportPNG = async () => {
    if (!posterRef.current) return
    setBusy(true)
    try {
      const canvas = await html2canvas(posterRef.current, {
        backgroundColor: '#eff2e9',
        scale: 2,
        useCORS: true,
      })
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `flora-planning-${mondayISO}.png`
      a.click()
      flash('Image PNG téléchargée ✓')
    } catch (e) {
      flash('Échec export image')
    } finally {
      setBusy(false)
    }
  }

  const exportTexte = async () => {
    const txt = buildTextExport(week, mondayISO, names, { detailParJour: true })
    try {
      await navigator.clipboard.writeText(txt)
      flash('Texte WhatsApp copié ✓')
    } catch {
      // Repli : sélection manuelle via prompt.
      window.prompt('Copiez le texte :', txt)
    }
  }

  return (
    <div>
      <h2 className="section-title">Partage</h2>

      <div className="share-controls">
        <button
          className={`toggle ${detailParJour ? 'on' : ''}`}
          onClick={() => setDetailParJour((v) => !v)}
        >
          Détail par jour
        </button>
        <button
          className={`toggle ${actifsSeulement ? 'on' : ''}`}
          onClick={() => setActifsSeulement((v) => !v)}
        >
          {actifsSeulement ? 'Actifs seulement' : 'Toute l’équipe'}
        </button>
      </div>

      <div className="btn-row">
        <button className="btn" onClick={exportPNG} disabled={busy}>
          {busy ? '…' : '🖼 Image PNG'}
        </button>
        <button className="btn ghost" onClick={exportTexte}>
          💬 Texte WhatsApp
        </button>
      </div>
      {toast && <p className="muted center">{toast}</p>}

      {/* Affiche exportable */}
      <div className="poster" ref={posterRef}>
        <div className="poster-head">
          <div className="glyph">✿</div>
          <h2>Café Flora</h2>
          <div className="sub">Planning · semaine {formatPlageSemaine(mondayISO)}</div>
        </div>

        <div className="wk-wrap" style={{ boxShadow: 'none', border: 'none' }}>
          <table className="grid">
            <thead>
              <tr>
                <th className="name-col">Équipe</th>
                {dayKeys.map((k, i) => (
                  <th key={k}>{JOURS_COURTS[i]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {names.map((name) => (
                <tr key={name}>
                  <td className="name-col">{name}</td>
                  {dayKeys.map((k) => {
                    const code = shiftCodeForPerson(week.days[k] || {}, name)
                    const extra = personHasExtraThisDay(week.days[k] || {}, name)
                    if (!code)
                      return (
                        <td key={k}>
                          <span className="badge empty">·</span>
                        </td>
                      )
                    if (code === 'R')
                      return (
                        <td key={k}>
                          <span className="badge rest">R</span>
                        </td>
                      )
                    return (
                      <td key={k}>
                        <span
                          className="badge"
                          style={{ background: SHIFT_COLOR[code] }}
                        >
                          {code}
                          {extra ? '*' : ''}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Légende */}
        <div className="legend">
          {Object.entries(SHIFT_CODES)
            .filter(([c]) => c !== 'R')
            .map(([code, def]) => (
              <span className="item" key={code}>
                <span className="badge" style={{ background: SHIFT_COLOR[code] }}>
                  {code}
                </span>
                {def.label}
              </span>
            ))}
          <span className="item">
            <span className="badge rest">R</span> Repos
          </span>
          <span className="item">✱ = shift extra</span>
        </div>

        {/* Détail par jour optionnel */}
        {detailParJour && (
          <div className="jour-detail">
            {dayKeys.map((k, i) => {
              const day = week.days[k]
              if (!day) return null
              const anything = CRENEAUX.some(
                (cr) => creneauDetail(day, cr).length > 0,
              )
              if (!anything) return null
              return (
                <div className="jour-block" key={k}>
                  <h4>
                    {JOURS_LONGS[i]} {formatJourMois(k)}
                  </h4>
                  {CRENEAUX.map((cr) => {
                    const detail = creneauDetail(day, cr)
                    if (detail.length === 0) return null
                    return (
                      <div className="creneau-line" key={cr}>
                        <span className={`cr-label ${cr}`}>
                          {CRENEAU_LABEL[cr]}
                        </span>
                        {detail
                          .map(
                            (s) =>
                              `${s.person}${s.statut === 'extra' ? '✱' : ''} (${s.poste})`,
                          )
                          .join(' · ')}
                      </div>
                    )
                  })}
                  {(day.repos || []).length > 0 && (
                    <div className="creneau-line">
                      <span className="cr-label" style={{ color: '#9AA69B' }}>
                        Repos
                      </span>
                      {day.repos.join(' · ')}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
