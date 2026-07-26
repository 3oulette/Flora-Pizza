// Construction et manipulation du modèle de semaine.

import {
  BESOINS,
  CRENEAUX,
  POSTE_EQUIPE,
  PRELOAD_PLAN,
  PRELOAD_SEED_VERSION,
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
// Pré-chargement : construit la semaine à partir du planning explicite
// PRELOAD_PLAN (affectations exactes fournies par le manager).
// Chaque entrée remplit le premier slot libre de son poste ; au-delà du besoin
// constant, un slot supplémentaire est créé. Les slots non remplis restent
// « à pourvoir ».
// ============================================================================
export function buildPreloadWeek(mondayISO) {
  const week = emptyWeek(mondayISO)
  const dayKeys = weekDays(mondayISO)

  dayKeys.forEach((dayKey, dayIdx) => {
    const day = week.days[dayKey]
    const plan = PRELOAD_PLAN[dayIdx]
    if (!plan) return
    for (const cr of CRENEAUX) {
      fillCreneauFromPlan(day.slots[cr], plan[cr] || [])
    }
    day.repos = [...(plan.repos || [])]
  })

  week.seed = PRELOAD_SEED_VERSION
  return week
}

// Place les entrées d'un créneau sur les slots (mutation en place).
function fillCreneauFromPlan(slots, entries) {
  for (const entry of entries) {
    const slot = slots.find((s) => s.poste === entry.poste && !s.person)
    if (slot) {
      slot.person = entry.person
      slot.statut = entry.extra ? 'extra' : 'fixe'
    } else {
      // Au-delà du besoin constant → slot supplémentaire.
      slots.push({
        id: newSlotId(),
        equipe: POSTE_EQUIPE[entry.poste] || 'salle',
        poste: entry.poste,
        person: entry.person,
        statut: entry.extra ? 'extra' : 'fixe',
        base: false,
      })
    }
  }
}
