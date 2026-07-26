import { useState } from 'react'
import BottomSheet from './BottomSheet'
import { useFlora } from '../state'
import { CRENEAU_LABEL, EQUIPES, EQUIPE_KEYS } from '../data/config'
import { newSlotId } from '../lib/model'

// Sheet d'ajout d'un slot ponctuel sur un créneau donné.
export default function AddSlotSheet({ dayKey, creneau, onClose }) {
  const { updateWeek } = useFlora()
  const [equipe, setEquipe] = useState('salle')
  const [poste, setPoste] = useState(EQUIPES.salle.postes[0])

  const changeEquipe = (eq) => {
    setEquipe(eq)
    setPoste(EQUIPES[eq].postes[0])
  }

  const ajouter = () => {
    updateWeek((w) => {
      w.days[dayKey].slots[creneau].push({
        id: newSlotId(),
        equipe,
        poste,
        person: null,
        statut: 'fixe',
        base: false,
      })
    })
    onClose()
  }

  return (
    <BottomSheet
      title="Ajouter un slot"
      subtitle={`${CRENEAU_LABEL[creneau]} — slot ponctuel`}
      onClose={onClose}
    >
      <div className="field">
        <label>Équipe</label>
        <div className="seg">
          {EQUIPE_KEYS.map((eq) => (
            <button
              key={eq}
              className={equipe === eq ? 'on' : ''}
              onClick={() => changeEquipe(eq)}
            >
              {EQUIPES[eq].label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Poste</label>
        <select
          className="sel"
          value={poste}
          onChange={(e) => setPoste(e.target.value)}
        >
          {EQUIPES[equipe].postes.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="sheet-actions">
        <button className="btn ghost" onClick={onClose}>
          Annuler
        </button>
        <button className="btn" onClick={ajouter}>
          Ajouter le slot
        </button>
      </div>
    </BottomSheet>
  )
}
