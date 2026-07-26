// Construction et manipulation du modèle de semaine.

import {
  BESOINS,
  CRENEAUX,
  DEFAULT_POSTE,
  PRELOAD_SHIFTS,
  SHIFT_CODES,
} from '../data/config'
import { weekDays } from './dates'

export const MODEL_VERSION = 1

let slotCounter = 0
// Identifiant de slot unique et stable pour une session.
export function newSlotId() {
  slotCounter += 1
  return `s${Date.now().toString(36)}_${slotCounter}`
}

// Crée les slots « besoins constants » d'un créneau.
function baseSlots(creneau) {
  const slots = []
  for (const need of BESOINS[creneau]) {
    for (let i = 0; i < need.count; i++) {
      slots.push({
        id: newSlotId(),
        equipe: need.equipe,
        poste: need.poste,
        person: null,
        statut: 'fixe', // 'fixe' | 'extra'
        base: true, // slot issu des besoins constants (vs ajouté ponctuellement)
      })
    }
  }
  return slots
}

// Journée vide (tous les slots « à pourvoir »).
export function emptyDay() {
  return {
    slots: {
      matin: baseSlots('matin'),
      midi: baseSlots('midi'),
      soir: baseSlots('soir'),
    },
    repos: [],
    extraSlots: 0, // compteur informatif de slots ajoutés
  }
}

// Semaine vide à partir d'un lundi ISO.
export function emptyWeek(mondayISO) {
  const days = {}
  for (const key of weekDays(mondayISO)) days[key] = emptyDay()
  return { weekStart: mondayISO, version: MODEL_VERSION, days }
}

// --- Ordonnancement des noms pour le sélecteur d'un slot ---
// 1) même poste que le slot, 2) même équipe, 3) le reste.
export function orderNamesForSlot(names, slot, postesMap) {
  const rank = (name) => {
    const dp = postesMap[name]
    if (dp && dp.equipe === slot.equipe && dp.poste === slot.poste) return 0
    if (dp && dp.equipe === slot.equipe) return 1
    return 2
  }
  return [...names]
    .map((name, i) => ({ name, i, r: rank(name) }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map((o) => o.name)
}

// Rang « pertinence » d'un nom pour un slot (0 exact, 1 équipe, 2 autre).
export function relevanceForSlot(name, slot, postesMap) {
  const dp = postesMap[name]
  if (dp && dp.equipe === slot.equipe && dp.poste === slot.poste) return 0
  if (dp && dp.equipe === slot.equipe) return 1
  return 2
}

// ============================================================================
// Pré-chargement : construit la semaine avec affectations depuis PRELOAD_SHIFTS.
// Chaque personne va sur son poste par défaut ; en cas de surplus sur un poste,
// on bascule sur un autre slot libre de la même équipe ; sinon slot « extra ».
// ============================================================================
export function buildPreloadWeek(mondayISO, postesMap = DEFAULT_POSTE) {
  const week = emptyWeek(mondayISO)
  const dayKeys = weekDays(mondayISO)

  // Pour chaque personne, décoder son shift par jour → créneaux travaillés.
  dayKeys.forEach((dayKey, dayIdx) => {
    const day = week.days[dayKey]

    // Regrouper, par créneau, la liste des personnes présentes.
    const presentsParCreneau = { matin: [], midi: [], soir: [] }
    for (const [person, codes] of Object.entries(PRELOAD_SHIFTS)) {
      const code = codes[dayIdx]
      if (!code) continue
      if (code === 'R') {
        if (!day.repos.includes(person)) day.repos.push(person)
        continue
      }
      const def = SHIFT_CODES[code]
      if (!def) continue
      for (const cr of def.creneaux) presentsParCreneau[cr].push(person)
    }

    // Affectation greedy créneau par créneau.
    for (const cr of CRENEAUX) {
      assignCreneau(day.slots[cr], presentsParCreneau[cr], postesMap)
    }
  })

  return week
}

// Affecte une liste de personnes aux slots d'un créneau (mutation en place).
function assignCreneau(slots, persons, postesMap) {
  const remaining = new Set(persons)

  // Passe 1 : match exact équipe + poste.
  for (const slot of slots) {
    if (slot.person) continue
    const match = [...remaining].find((p) => {
      const dp = postesMap[p]
      return dp && dp.equipe === slot.equipe && dp.poste === slot.poste
    })
    if (match) {
      slot.person = match
      slot.statut = 'fixe'
      remaining.delete(match)
    }
  }

  // Passe 2 : même équipe, poste libre (bascule).
  for (const slot of slots) {
    if (slot.person) continue
    const match = [...remaining].find((p) => {
      const dp = postesMap[p]
      return dp && dp.equipe === slot.equipe
    })
    if (match) {
      slot.person = match
      slot.statut = 'fixe'
      remaining.delete(match)
    }
  }

  // Passe 3 : n'importe quel slot libre (couvre les extras hors équipe / surplus).
  for (const slot of slots) {
    if (slot.person) continue
    if (remaining.size === 0) break
    const p = remaining.values().next().value
    slot.person = p
    slot.statut = postesMap[p] ? 'fixe' : 'extra'
    remaining.delete(p)
  }

  // Passe 4 : s'il reste des personnes (surplus), on crée des slots « extra »
  // pour ne rien perdre de la donnée pré-chargée.
  for (const p of remaining) {
    const dp = postesMap[p]
    slots.push({
      id: newSlotId(),
      equipe: dp?.equipe || 'salle',
      poste: dp?.poste || 'Joker',
      person: p,
      statut: 'extra',
      base: false,
    })
  }
}
