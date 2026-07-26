// Dérivation des shifts à partir des affectations, et règles d'alerte (repos).

import { CRENEAUX } from '../data/config'

// À partir de l'ensemble des créneaux travaillés par une personne un jour donné,
// renvoie le code de shift correspondant (M, MM, Mi, MS, S, M+S, J, '').
export function creneauxToCode(creneauxSet) {
  const m = creneauxSet.has('matin')
  const mi = creneauxSet.has('midi')
  const s = creneauxSet.has('soir')
  if (m && mi && s) return 'J'
  if (m && mi) return 'MM'
  if (mi && s) return 'MS'
  if (m && s) return 'M+S'
  if (m) return 'M'
  if (mi) return 'Mi'
  if (s) return 'S'
  return ''
}

// Renvoie l'ensemble des créneaux où `person` est affecté(e) dans un `day`.
export function creneauxForPerson(day, person) {
  const set = new Set()
  for (const cr of CRENEAUX) {
    const slots = day.slots?.[cr] || []
    if (slots.some((sl) => sl.person === person)) set.add(cr)
  }
  return set
}

// Code de shift d'une personne pour un jour (tient compte du repos explicite).
export function shiftCodeForPerson(day, person) {
  if (day.repos?.includes(person)) {
    // Si malgré le repos la personne est affectée quelque part → on montre quand
    // même le vrai shift travaillé (le badge d'alerte gèrera l'incohérence).
    const worked = creneauxForPerson(day, person)
    if (worked.size > 0) return creneauxToCode(worked)
    return 'R'
  }
  return creneauxToCode(creneauxForPerson(day, person))
}

// True si la personne travaille (au moins un créneau) ce jour-là.
export function worksThisDay(day, person) {
  return creneauxForPerson(day, person).size > 0
}

// Incohérence : affecté un jour où marqué en repos.
export function reposConflict(day, person) {
  return !!day.repos?.includes(person) && worksThisDay(day, person)
}

// Nombre de jours travaillés dans la semaine pour une personne.
export function joursTravailles(week, person, dayKeys) {
  return dayKeys.reduce(
    (n, key) => n + (worksThisDay(week.days[key] || {}, person) ? 1 : 0),
    0,
  )
}

// Vrai s'il existe au moins un jour explicitement marqué « repos » (R).
export function aDuReposPlanifie(week, person, dayKeys) {
  return dayKeys.some((key) => (week.days[key] || {}).repos?.includes(person))
}

// Alerte « sans repos » : travaille 6–7 jours sans aucun repos planifié (R).
export function sansRepos(week, person, dayKeys) {
  const nb = joursTravailles(week, person, dayKeys)
  return nb >= 6 && !aDuReposPlanifie(week, person, dayKeys)
}
