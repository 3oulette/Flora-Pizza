import { useEffect, useMemo, useState } from 'react'
import { useFlora } from '../state'
import {
  CRENEAUX,
  CRENEAU_LABEL,
  EQUIPES,
  EQUIPE_FIXE,
  EQUIPE_KEYS,
} from '../data/config'
import {
  JOURS_COURTS,
  formatJourMois,
  todayISO,
  weekDays,
} from '../lib/dates'
import { reposConflict, worksThisDay } from '../lib/shifts'
import SlotSheet from './SlotSheet'
import AddSlotSheet from './AddSlotSheet'

const CRENEAU_ICON = { matin: '☀', midi: '✻', soir: '☾' }

// Taux de remplissage d'un jour (slots pourvus / total).
function fillRatio(day) {
  let total = 0
  let filled = 0
  for (const cr of CRENEAUX) {
    for (const s of day.slots[cr]) {
      total += 1
      if (s.person) filled += 1
    }
  }
  return { total, filled, ratio: total ? filled / total : 0 }
}

function CreneauBlock({ day, dayKey, creneau, onSlot, onAdd }) {
  const slots = day.slots[creneau]
  const filled = slots.filter((s) => s.person).length
  return (
    <section className={`creneau ${creneau}`}>
      <div className="creneau-head">
        <div className="titre">
          <span>{CRENEAU_ICON[creneau]}</span>
          {CRENEAU_LABEL[creneau]}
        </div>
        <div className="compte">
          {filled}/{slots.length}
        </div>
      </div>

      {EQUIPE_KEYS.map((eq) => {
        const eqSlots = slots.filter((s) => s.equipe === eq)
        if (eqSlots.length === 0) return null
        return (
          <div className="equipe-groupe" key={eq}>
            <div className="equipe-titre">{EQUIPES[eq].label}</div>
            {eqSlots.map((s) => {
              const conflit = s.person && reposConflict(day, s.person)
              return (
                <div
                  className="slot"
                  key={s.id}
                  onClick={() => onSlot(creneau, s.id)}
                >
                  <div className="slot-poste">{s.poste}</div>
                  <div className={`slot-person ${s.person ? '' : 'vide'}`}>
                    <span className="nom">{s.person || 'à pourvoir'}</span>
                    {s.person && s.statut === 'extra' && (
                      <span className="tag extra">extra</span>
                    )}
                    {conflit && <span className="tag alerte">repos ⚠</span>}
                  </div>
                  <span className="slot-chev">›</span>
                </div>
              )
            })}
          </div>
        )
      })}

      <div className="addslot-row">
        <button className="addslot-btn" onClick={() => onAdd(creneau)}>
          + Ajouter un slot
        </button>
      </div>
    </section>
  )
}

function ReposSection({ week, dayKey, dayKeys }) {
  const { updateWeek } = useFlora()
  const day = week.days[dayKey]
  const repos = day.repos || []

  const toggle = (name) => {
    updateWeek((w) => {
      const d = w.days[dayKey]
      d.repos = d.repos || []
      if (d.repos.includes(name)) {
        d.repos = d.repos.filter((n) => n !== name)
      } else {
        d.repos.push(name)
      }
    })
  }

  return (
    <div className="repos-card">
      <h3>☕ Repos du jour</h3>
      <div className="chips">
        {EQUIPE_FIXE.map((name) => {
          const on = repos.includes(name)
          const works = worksThisDay(day, name)
          return (
            <button
              key={name}
              className={`chip ${on ? 'on' : ''} ${on && works ? 'warn' : ''}`}
              onClick={() => toggle(name)}
            >
              {name}
              {on && works && <small>⚠ affecté</small>}
            </button>
          )
        })}
      </div>
      <div className="hint" style={{ marginTop: 10 }}>
        Touchez un prénom pour (dé)marquer un repos. ⚠ = marqué en repos mais
        affecté à un créneau.
      </div>
    </div>
  )
}

export default function DayView({ selected, setSelected }) {
  const { week, mondayISO } = useFlora()
  const dayKeys = useMemo(() => weekDays(mondayISO), [mondayISO])

  // Garde-fou : si le jour sélectionné n'appartient plus à la semaine affichée,
  // on retombe sur aujourd'hui (si présent) ou le lundi.
  useEffect(() => {
    if (!dayKeys.includes(selected)) {
      const t = todayISO()
      setSelected(dayKeys.includes(t) ? t : dayKeys[0])
    }
  }, [dayKeys, selected, setSelected])

  const [slotSheet, setSlotSheet] = useState(null) // {creneau, slotId}
  const [addSheet, setAddSheet] = useState(null) // {creneau}

  if (!week) return null
  // Clé effective (robuste au changement de semaine avant que l'effet ne recale).
  const activeKey = dayKeys.includes(selected) ? selected : dayKeys[0]
  const day = week.days[activeKey]
  if (!day) return null

  return (
    <div>
      {/* Onglets Lun→Dim */}
      <div className="daytabs">
        {dayKeys.map((key, i) => {
          const { ratio, total } = fillRatio(week.days[key])
          const full = ratio >= 1
          return (
            <button
              key={key}
              className={`daytab ${key === activeKey ? 'active' : ''}`}
              onClick={() => setSelected(key)}
            >
              <span className="dt-jour">{JOURS_COURTS[i]}</span>
              <span className="dt-date">{formatJourMois(key)}</span>
              <span className={`fill-dot ${full ? 'full' : ''}`}>
                <span style={{ width: `${Math.round(ratio * 100)}%` }} />
              </span>
            </button>
          )
        })}
      </div>

      {/* Blocs créneaux */}
      {CRENEAUX.map((cr) => (
        <CreneauBlock
          key={cr}
          day={day}
          dayKey={activeKey}
          creneau={cr}
          onSlot={(creneau, slotId) => setSlotSheet({ creneau, slotId })}
          onAdd={(creneau) => setAddSheet({ creneau })}
        />
      ))}

      {/* Repos */}
      <ReposSection week={week} dayKey={activeKey} dayKeys={dayKeys} />

      {slotSheet && (
        <SlotSheet
          dayKey={activeKey}
          creneau={slotSheet.creneau}
          slotId={slotSheet.slotId}
          onClose={() => setSlotSheet(null)}
        />
      )}
      {addSheet && (
        <AddSlotSheet
          dayKey={activeKey}
          creneau={addSheet.creneau}
          onClose={() => setAddSheet(null)}
        />
      )}
    </div>
  )
}
