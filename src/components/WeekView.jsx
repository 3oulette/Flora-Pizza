import { useMemo } from 'react'
import { useFlora } from '../state'
import { EQUIPE_FIXE, SHIFT_CODES, SHIFT_COLOR } from '../data/config'
import { JOURS_COURTS, formatJourMois, weekDays } from '../lib/dates'
import { joursTravailles, sansRepos, shiftCodeForPerson } from '../lib/shifts'

function ShiftBadge({ code }) {
  if (!code) return <span className="badge empty">·</span>
  if (code === 'R') return <span className="badge rest">R</span>
  return (
    <span className="badge" style={{ background: SHIFT_COLOR[code] }}>
      {code}
    </span>
  )
}

export default function WeekView({ onOpenDay }) {
  const { week, mondayISO, allNames } = useFlora()
  const dayKeys = useMemo(() => weekDays(mondayISO), [mondayISO])

  if (!week) return null

  // Personnes à afficher : équipe fixe + extras réellement présents cette semaine.
  const activeExtras = allNames.filter(
    (n) =>
      !EQUIPE_FIXE.includes(n) &&
      dayKeys.some((k) => shiftCodeForPerson(week.days[k] || {}, n)),
  )
  const rows = [...EQUIPE_FIXE, ...activeExtras]

  return (
    <div>
      <h2 className="section-title">Vue semaine</h2>
      <div className="wk-wrap">
        <table className="grid">
          <thead>
            <tr>
              <th className="name-col">Équipe</th>
              {dayKeys.map((k, i) => (
                <th key={k}>{JOURS_COURTS[i]}</th>
              ))}
              <th>Jrs</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((name) => {
              const nb = joursTravailles(week, name, dayKeys)
              const alerte = sansRepos(week, name, dayKeys)
              return (
                <tr key={name}>
                  <td className="name-col">{name}</td>
                  {dayKeys.map((k) => {
                    const code = shiftCodeForPerson(week.days[k] || {}, name)
                    return (
                      <td
                        key={k}
                        onClick={() => onOpenDay(k)}
                        style={{ cursor: 'pointer' }}
                      >
                        <ShiftBadge code={code} />
                      </td>
                    )
                  })}
                  <td className="wk-count">{nb}</td>
                  <td>{alerte && <span className="wk-warn" title="Sans repos">⚠</span>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

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
        <span className="item">
          <span className="wk-warn">⚠</span> 6–7 jours sans repos
        </span>
      </div>
      <p className="muted center">Touchez une case pour ouvrir le jour.</p>
    </div>
  )
}
