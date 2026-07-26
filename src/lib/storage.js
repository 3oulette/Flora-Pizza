// ============================================================================
// Persistance localStorage — fiabilité critique (données déjà perdues une fois)
// ----------------------------------------------------------------------------
// Règles :
//  - Écriture IMMÉDIATE (pas de debounce), clé par semaine flora-week-YYYY-MM-DD.
//  - Backup automatique flora-bak-... avant la 1re écriture d'une session.
//  - Si la lecture échoue alors que la clé existe → on BLOQUE les écritures
//    (on n'écrase jamais silencieusement par une semaine vide).
// ============================================================================

export const WEEK_PREFIX = 'flora-week-'
export const BAK_PREFIX = 'flora-bak-'
export const EXTRAS_KEY = 'flora-extras'
export const POSTES_KEY = 'flora-postes' // surcharge éditable de DEFAULT_POSTE

export function weekKey(mondayISO) {
  return `${WEEK_PREFIX}${mondayISO}`
}
export function bakKey(mondayISO) {
  return `${BAK_PREFIX}${mondayISO}`
}

// Clés dont un backup a déjà été fait durant CETTE session (mémoire process).
const backedUpThisSession = new Set()

// Clés bloquées en écriture (lecture corrompue détectée) → sécurité.
const blockedKeys = new Set()

function hasLocalStorage() {
  try {
    return typeof window !== 'undefined' && !!window.localStorage
  } catch {
    return false
  }
}

// Lit et parse une valeur JSON. Renvoie { ok, value, corrupt }.
//  - ok:false + corrupt:true  → la clé existe mais est illisible (⚠ bloquant)
//  - ok:false + corrupt:false → la clé n'existe pas
export function readJSON(key) {
  if (!hasLocalStorage()) return { ok: false, value: null, corrupt: false }
  let raw
  try {
    raw = window.localStorage.getItem(key)
  } catch {
    return { ok: false, value: null, corrupt: true }
  }
  if (raw === null || raw === undefined) {
    return { ok: false, value: null, corrupt: false }
  }
  try {
    return { ok: true, value: JSON.parse(raw), corrupt: false }
  } catch {
    // La clé existe mais le JSON est cassé → surtout NE PAS écraser.
    return { ok: false, value: null, corrupt: true }
  }
}

export function keyExists(key) {
  if (!hasLocalStorage()) return false
  try {
    return window.localStorage.getItem(key) !== null
  } catch {
    return false
  }
}

// Backup (une seule fois par session) de la valeur existante d'une clé semaine.
function ensureBackup(mondayISO) {
  const wk = weekKey(mondayISO)
  if (backedUpThisSession.has(wk)) return
  backedUpThisSession.add(wk)
  if (!hasLocalStorage()) return
  try {
    const existing = window.localStorage.getItem(wk)
    if (existing !== null) {
      window.localStorage.setItem(bakKey(mondayISO), existing)
    }
  } catch {
    // Backup best-effort : on n'empêche pas l'écriture pour autant.
  }
}

// Marque une clé semaine comme bloquée (lecture corrompue).
export function blockWeek(mondayISO) {
  blockedKeys.add(weekKey(mondayISO))
}
export function isWeekBlocked(mondayISO) {
  return blockedKeys.has(weekKey(mondayISO))
}

// Écrit une semaine. Renvoie true si succès, false sinon.
// Refuse d'écrire si la clé est bloquée (lecture corrompue non résolue).
export function writeWeek(mondayISO, data) {
  const wk = weekKey(mondayISO)
  if (blockedKeys.has(wk)) return false
  if (!hasLocalStorage()) return false
  ensureBackup(mondayISO)
  try {
    window.localStorage.setItem(wk, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

// Écriture générique (extras, postes…) — best-effort.
export function writeRaw(key, data) {
  if (!hasLocalStorage()) return false
  try {
    window.localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

// Liste toutes les clés Flora présentes (semaines, backups, divers).
export function listFloraKeys() {
  if (!hasLocalStorage()) return []
  const out = []
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i)
      if (k && k.startsWith('flora-')) {
        const raw = window.localStorage.getItem(k) || ''
        out.push({ key: k, size: raw.length })
      }
    }
  } catch {
    /* ignore */
  }
  return out.sort((a, b) => a.key.localeCompare(b.key))
}

export function removeKey(key) {
  if (!hasLocalStorage()) return false
  try {
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

// Restaure un backup vers sa clé semaine. Débloque la clé au passage.
export function restoreBackup(mondayISO) {
  if (!hasLocalStorage()) return false
  try {
    const bak = window.localStorage.getItem(bakKey(mondayISO))
    if (bak === null) return false
    window.localStorage.setItem(weekKey(mondayISO), bak)
    blockedKeys.delete(weekKey(mondayISO))
    return true
  } catch {
    return false
  }
}
