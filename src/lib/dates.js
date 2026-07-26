// Utilitaires de dates — semaines ISO (lundi → dimanche), sans dépendance externe.

export const JOURS_COURTS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
export const JOURS_LONGS = [
  'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche',
]
const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

// Construit une date locale (midi, pour éviter tout souci de fuseau) depuis YYYY-MM-DD
function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

// Formate une Date en YYYY-MM-DD (local)
export function toISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Lundi ISO de la semaine contenant `date` (Date ou YYYY-MM-DD) → YYYY-MM-DD
export function mondayOf(date) {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date)
  const dow = (d.getDay() + 6) % 7 // 0 = lundi
  d.setDate(d.getDate() - dow)
  return toISO(d)
}

// Décale une clé de semaine (lundi ISO) de `weeks` semaines → YYYY-MM-DD
export function shiftWeek(mondayISO, weeks) {
  const d = parseISO(mondayISO)
  d.setDate(d.getDate() + weeks * 7)
  return toISO(d)
}

// Les 7 dates (YYYY-MM-DD) d'une semaine à partir de son lundi
export function weekDays(mondayISO) {
  const start = parseISO(mondayISO)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return toISO(d)
  })
}

// "27 juillet" — jour + mois
export function formatJourMois(iso) {
  const d = parseISO(iso)
  return `${d.getDate()} ${MOIS[d.getMonth()]}`
}

// "27 juillet 2026"
export function formatComplet(iso) {
  const d = parseISO(iso)
  return `${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`
}

// "semaine du 27 juillet au 2 août 2026"
export function formatPlageSemaine(mondayISO) {
  const days = weekDays(mondayISO)
  const a = parseISO(days[0])
  const b = parseISO(days[6])
  const finAnnee = b.getFullYear()
  // On omet l'année en début si identique à la fin
  const debut =
    a.getMonth() === b.getMonth()
      ? `${a.getDate()}`
      : `${a.getDate()} ${MOIS[a.getMonth()]}`
  return `du ${debut} ${a.getMonth() === b.getMonth() ? MOIS[a.getMonth()] : ''} au ${b.getDate()} ${MOIS[b.getMonth()]} ${finAnnee}`.replace(/\s+/g, ' ').trim()
}

// Aujourd'hui en YYYY-MM-DD (local)
export function todayISO() {
  return toISO(new Date())
}
