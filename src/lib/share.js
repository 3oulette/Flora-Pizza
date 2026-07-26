// Génération des exports texte (WhatsApp) et helpers d'affichage partagé.

import { CRENEAUX, CRENEAU_LABEL, EQUIPE_KEYS, EQUIPES } from '../data/config'
import { JOURS_LONGS, formatJourMois, formatPlageSemaine, weekDays } from './dates'
import { shiftCodeForPerson } from './shifts'

// La personne a-t-elle au moins une affectation « extra » ce jour-là ?
export function personHasExtraThisDay(day, person) {
  for (const cr of CRENEAUX) {
    for (const s of day.slots?.[cr] || []) {
      if (s.person === person && s.statut === 'extra') return true
    }
  }
  return false
}

// Ordre des postes tel que défini dans les besoins (pour un affichage stable).
function posteOrder(equipe) {
  return EQUIPES[equipe].postes
}

// Détail d'un créneau : liste [{ poste, person, extra }] triée par poste.
export function creneauDetail(day, creneau) {
  const slots = day.slots?.[creneau] || []
  const withPerson = slots.filter((s) => s.person)
  return withPerson.sort((a, b) => {
    if (a.equipe !== b.equipe) return a.equipe === 'cuisine' ? -1 : 1
    const oa = posteOrder(a.equipe).indexOf(a.poste)
    const ob = posteOrder(b.equipe).indexOf(b.poste)
    return oa - ob
  })
}

// Export texte formaté WhatsApp.
//  - Section « Qui vient quand » (par personne, avec ses jours + codes)
//  - Détail par jour (poste : nom, par créneau)
export function buildTextExport(week, mondayISO, names, { detailParJour } = {}) {
  const dayKeys = weekDays(mondayISO)
  const lines = []
  lines.push(`✿ CAFÉ FLORA — Planning`)
  lines.push(`Semaine ${formatPlageSemaine(mondayISO)}`)
  lines.push('')

  // --- Qui vient quand ---
  lines.push('— QUI VIENT QUAND —')
  for (const name of names) {
    const parts = []
    let hasAny = false
    dayKeys.forEach((k, i) => {
      const code = shiftCodeForPerson(week.days[k] || {}, name)
      if (code && code !== 'R') {
        hasAny = true
        const extra = personHasExtraThisDay(week.days[k] || {}, name) ? '*' : ''
        parts.push(`${JOURS_LONGS[i].slice(0, 3)} ${code}${extra}`)
      }
    })
    if (hasAny) lines.push(`${name} : ${parts.join(', ')}`)
  }
  lines.push('')
  lines.push('(* = extra)')

  // --- Détail par jour ---
  if (detailParJour) {
    lines.push('')
    lines.push('— DÉTAIL PAR JOUR —')
    dayKeys.forEach((k, i) => {
      const day = week.days[k]
      if (!day) return
      lines.push('')
      lines.push(`▸ ${JOURS_LONGS[i]} ${formatJourMois(k)}`)
      for (const cr of CRENEAUX) {
        const detail = creneauDetail(day, cr)
        if (detail.length === 0) continue
        const items = detail
          .map((s) => `${s.person}${s.statut === 'extra' ? '*' : ''} (${s.poste})`)
          .join(', ')
        lines.push(`  ${CRENEAU_LABEL[cr]} : ${items}`)
      }
      const repos = day.repos || []
      if (repos.length) lines.push(`  Repos : ${repos.join(', ')}`)
    })
  }

  return lines.join('\n')
}
