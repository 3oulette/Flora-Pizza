import { useMemo, useState } from 'react'
import BottomSheet from './BottomSheet'
import { useFlora } from '../state'
import { CRENEAU_LABEL } from '../data/config'
import { orderNamesForSlot, relevanceForSlot } from '../lib/model'
import { creneauxForPerson } from '../lib/shifts'

// Petits indicateurs M/Mi/S selon les créneaux déjà prévus ce jour.
function miniCreneaux(day, person, currentCreneau) {
  const set = creneauxForPerson(day, person)
  const out = []
  if (set.has('matin')) out.push('M')
  if (set.has('midi')) out.push('Mi')
  if (set.has('soir')) out.push('S')
  return out
}

export default function SlotSheet({ dayKey, creneau, slotId, onClose }) {
  const { week, updateWeek, allNames, postesMap, addExtra } = useFlora()
  const day = week.days[dayKey]
  const slot = day.slots[creneau].find((s) => s.id === slotId)

  const [statut, setStatut] = useState(slot?.statut || 'fixe')
  const [extraName, setExtraName] = useState('')

  const orderedNames = useMemo(
    () => (slot ? orderNamesForSlot(allNames, slot, postesMap) : []),
    [allNames, slot, postesMap],
  )

  if (!slot) {
    onClose()
    return null
  }

  const assign = (person, asStatut) => {
    updateWeek((w) => {
      const s = w.days[dayKey].slots[creneau].find((x) => x.id === slotId)
      if (!s) return
      s.person = person
      s.statut = asStatut || statut
      // Affecter quelqu'un le retire de la liste des repos du jour.
      w.days[dayKey].repos = (w.days[dayKey].repos || []).filter(
        (n) => n !== person,
      )
    })
    onClose()
  }

  const retirer = () => {
    updateWeek((w) => {
      const s = w.days[dayKey].slots[creneau].find((x) => x.id === slotId)
      if (!s) return
      if (s.base) {
        s.person = null
        s.statut = 'fixe'
      } else {
        // Slot ajouté ponctuellement → on le supprime entièrement.
        w.days[dayKey].slots[creneau] = w.days[dayKey].slots[creneau].filter(
          (x) => x.id !== slotId,
        )
      }
    })
    onClose()
  }

  const validerExtra = () => {
    const clean = extraName.trim()
    if (!clean) return
    addExtra(clean)
    assign(clean, 'extra')
  }

  const supprimerSlot = () => {
    updateWeek((w) => {
      w.days[dayKey].slots[creneau] = w.days[dayKey].slots[creneau].filter(
        (x) => x.id !== slotId,
      )
    })
    onClose()
  }

  return (
    <BottomSheet
      title={`${slot.poste}`}
      subtitle={`${CRENEAU_LABEL[creneau]} · ${slot.equipe === 'cuisine' ? 'Cuisine' : 'Salle'}${slot.person ? ` · ${slot.person}` : ' · à pourvoir'}`}
      onClose={onClose}
    >
      {/* Toggle Fixe / Extra */}
      <div className="seg">
        <button
          className={statut === 'fixe' ? 'on' : ''}
          onClick={() => {
            setStatut('fixe')
            if (slot.person) assign(slot.person, 'fixe')
          }}
        >
          Fixe
        </button>
        <button
          className={statut === 'extra' ? 'on' : ''}
          onClick={() => {
            setStatut('extra')
            if (slot.person) assign(slot.person, 'extra')
          }}
        >
          Extra
        </button>
      </div>

      {/* Grille de noms */}
      <div className="field">
        <label>Affecter une personne</label>
        <div className="name-grid">
          {orderedNames.map((name) => {
            const rel = relevanceForSlot(name, slot, postesMap)
            const mini = miniCreneaux(day, name, creneau)
            const enRepos = day.repos?.includes(name)
            const selected = slot.person === name
            return (
              <button
                key={name}
                className={[
                  'name-cell',
                  rel === 2 ? 'dim' : '',
                  selected ? 'selected' : '',
                ].join(' ')}
                onClick={() => assign(name)}
              >
                <span className="nom">{name}</span>
                <span className="mini">
                  {mini.map((m) => (
                    <span key={m} className="badge-mini">
                      {m}
                    </span>
                  ))}
                  {enRepos && <span className="rest-flag">R</span>}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Extra hors équipe */}
      <div className="field">
        <label>Extra hors équipe (nom libre)</label>
        <div className="row">
          <input
            className="txt"
            type="text"
            placeholder="Prénom…"
            value={extraName}
            onChange={(e) => setExtraName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && validerExtra()}
          />
          <button
            className="btn"
            onClick={validerExtra}
            disabled={!extraName.trim()}
            style={{ flex: '0 0 auto' }}
          >
            Ajouter
          </button>
        </div>
        <div className="hint">Mémorisé et réutilisable pour les prochains jours.</div>
      </div>

      {/* Actions */}
      <div className="sheet-actions">
        {slot.person && (
          <button className="btn ghost" onClick={retirer}>
            Retirer
          </button>
        )}
        {!slot.base && (
          <button
            className="btn ghost"
            onClick={supprimerSlot}
            style={{ color: 'var(--rouge)', borderColor: 'var(--rouge)' }}
          >
            Supprimer le slot
          </button>
        )}
        <button className="btn" onClick={onClose}>
          Fermer
        </button>
      </div>
    </BottomSheet>
  )
}
