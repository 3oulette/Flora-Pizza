// Génération des exports texte (WhatsApp) et helpers d'affichage partagé.

import {
  CRENEAUX,
  CRENEAU_LABEL,
  EQUIPE_KEYS,
  EQUIPES,
  POSTE_EQUIPE,
  TOUS_POSTES,
} from '../data/config'
import {
  JOURS_COURTS,
  JOURS_LONGS,
  formatJourMois,
  formatPlageSemaine,
  weekDays,
} from './dates'
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

// Ordre canonique des postes (cuisine puis salle, dans l'ordre des équipes).
const POSTE_ORDER = TOUS_POSTES.map((tp) => tp.poste)

// Structure « par poste » d'un créneau : pour chaque poste présent dans la
// semaine, la liste des personnes affectées chaque jour.
// → [{ poste, equipe, cells: [ [{name, extra}], ... 7 jours ] }]
export function byPosteRows(week, dayKeys, creneau) {
  const present = new Set()
  for (const k of dayKeys) {
    for (const s of week.days[k]?.slots?.[creneau] || []) present.add(s.poste)
  }
  const postes = POSTE_ORDER.filter((p) => present.has(p))
  return postes.map((poste) => ({
    poste,
    equipe: POSTE_EQUIPE[poste],
    cells: dayKeys.map((k) =>
      (week.days[k]?.slots?.[creneau] || [])
        .filter((s) => s.poste === poste && s.person)
        .map((s) => ({ name: s.person, extra: s.statut === 'extra' })),
    ),
  }))
}

// Export texte « par poste » (WhatsApp) : par créneau, chaque poste avec les
// noms jour par jour.
export function buildTextExportByPoste(week, mondayISO) {
  const dayKeys = weekDays(mondayISO)
  const lines = []
  lines.push('✿ CAFÉ FLORA — Planning par poste')
  lines.push(`Semaine ${formatPlageSemaine(mondayISO)}`)

  for (const cr of CRENEAUX) {
    const rows = byPosteRows(week, dayKeys, cr)
    if (rows.length === 0) continue
    lines.push('')
    lines.push(`— ${CRENEAU_LABEL[cr].toUpperCase()} —`)
    for (const row of rows) {
      lines.push(`${row.poste} :`)
      dayKeys.forEach((k, i) => {
        const names = row.cells[i]
        if (names.length === 0) return
        const txt = names.map((n) => n.name + (n.extra ? '*' : '')).join(', ')
        lines.push(`  ${JOURS_COURTS[i]} : ${txt}`)
      })
    }
  }
  lines.push('')
  lines.push('(* = extra)')
  return lines.join('\n')
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
