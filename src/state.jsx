import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  DEFAULT_POSTE,
  EQUIPE_FIXE,
  PRELOAD_EXTRAS,
  PRELOAD_SEED_VERSION,
  PRELOAD_WEEK_START,
} from './data/config'
import { mondayOf, todayISO, shiftWeek } from './lib/dates'
import {
  MODEL_VERSION,
  buildPreloadWeek,
  cloneWeekForTarget,
  emptyWeek,
  isWeekEmpty,
  reconcileBaseSlots,
} from './lib/model'
import {
  EXTRAS_KEY,
  POSTES_KEY,
  blockWeek,
  isWeekBlocked,
  readJSON,
  restoreBackup,
  weekKey,
  writeRaw,
  writeWeek,
} from './lib/storage'

const FloraContext = createContext(null)

// Semaine de départ : la semaine pré-chargée (proche de « aujourd'hui » simulé).
function initialMonday() {
  return PRELOAD_WEEK_START
}

export function FloraProvider({ children }) {
  const [mondayISO, setMondayISO] = useState(initialMonday)
  const [week, setWeek] = useState(null)
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved' | 'retry' | 'blocked'
  const [errorBanner, setErrorBanner] = useState(null)

  // --- Postes (DEFAULT_POSTE surchargé par le stockage) ---
  const [postesOverride, setPostesOverride] = useState(() => {
    const r = readJSON(POSTES_KEY)
    return r.ok && r.value && typeof r.value === 'object' ? r.value : {}
  })
  const postesMap = useMemo(
    () => ({ ...DEFAULT_POSTE, ...postesOverride }),
    [postesOverride],
  )

  // --- Extras hors équipe mémorisés ---
  const [extras, setExtras] = useState(() => {
    const r = readJSON(EXTRAS_KEY)
    const base = r.ok && Array.isArray(r.value) ? r.value : []
    return Array.from(new Set([...PRELOAD_EXTRAS, ...base]))
  })

  const allNames = useMemo(
    () => [...EQUIPE_FIXE, ...extras.filter((e) => !EQUIPE_FIXE.includes(e))],
    [extras],
  )

  // Persiste les extras à chaque changement.
  const extrasLoaded = useRef(false)
  useEffect(() => {
    if (!extrasLoaded.current) {
      extrasLoaded.current = true
      return
    }
    writeRaw(EXTRAS_KEY, extras)
  }, [extras])

  // ------------------------------------------------------------------
  // Chargement d'une semaine (à chaque changement de mondayISO).
  // ------------------------------------------------------------------
  const loadWeek = useCallback(
    (iso) => {
      setErrorBanner(null)
      const res = readJSON(`flora-week-${iso}`)

      if (res.corrupt) {
        // La clé existe mais est illisible → on bloque toute écriture.
        blockWeek(iso)
        setWeek(emptyWeek(iso)) // affichage neutre, NON sauvegardé
        setSaveStatus('blocked')
        setErrorBanner(
          `Données illisibles pour la semaine ${iso}. Écritures bloquées pour éviter d'écraser. Restaure un backup dans le panneau « Données ».`,
        )
        return
      }

      if (res.ok && res.value) {
        // Graine de pré-chargement obsolète → on ré-applique le planning fourni
        // (uniquement pour la semaine de référence ; backup automatique avant
        // écrasement). Les éditions ultérieures restent conservées ensuite.
        if (
          iso === PRELOAD_WEEK_START &&
          res.value.seed !== PRELOAD_SEED_VERSION &&
          !isWeekBlocked(iso)
        ) {
          const reseed = buildPreloadWeek(iso)
          const okr = writeWeek(iso, reseed)
          setWeek(reseed)
          setSaveStatus(okr ? 'saved' : 'retry')
          return
        }
        // Réconciliation : ajoute les slots de base récemment introduits
        // (ex. Crêperie) sans écraser les affectations existantes.
        const wk = res.value
        const changed = reconcileBaseSlots(wk)
        if (changed && !isWeekBlocked(iso)) writeWeek(iso, wk)
        setWeek(wk)
        setSaveStatus(isWeekBlocked(iso) ? 'blocked' : 'saved')
        return
      }

      // Clé absente : semaine pré-chargée pour la semaine de référence, sinon vide.
      const fresh =
        iso === PRELOAD_WEEK_START ? buildPreloadWeek(iso) : emptyWeek(iso)
      const ok = writeWeek(iso, fresh)
      setWeek(fresh)
      setSaveStatus(ok ? 'saved' : 'retry')
    },
    [],
  )

  useEffect(() => {
    loadWeek(mondayISO)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mondayISO])

  // ------------------------------------------------------------------
  // Mise à jour de la semaine : mutation immuable + écriture IMMÉDIATE.
  // ------------------------------------------------------------------
  const updateWeek = useCallback(
    (mutator) => {
      setWeek((prev) => {
        if (!prev) return prev
        if (isWeekBlocked(prev.weekStart)) {
          setSaveStatus('blocked')
          return prev // on refuse d'écrire sur une semaine corrompue
        }
        const next = structuredClone(prev)
        mutator(next)
        const ok = writeWeek(next.weekStart, next)
        setSaveStatus(ok ? 'saved' : 'retry')
        return next
      })
    },
    [],
  )

  // Remplace intégralement la semaine courante (import JSON).
  const replaceWeek = useCallback(
    (data) => {
      if (isWeekBlocked(mondayISO)) {
        setSaveStatus('blocked')
        return false
      }
      const next = { ...data, weekStart: mondayISO, version: MODEL_VERSION }
      const ok = writeWeek(mondayISO, next)
      setWeek(next)
      setSaveStatus(ok ? 'saved' : 'retry')
      return ok
    },
    [mondayISO],
  )

  // Copie une autre semaine (source) dans la semaine courante.
  // sourceOffset = -1 (précédente), +1 (suivante), etc.
  const copyWeekFrom = useCallback(
    (sourceOffset) => {
      if (isWeekBlocked(mondayISO)) {
        setSaveStatus('blocked')
        return { ok: false, reason: 'blocked' }
      }
      const sourceISO = shiftWeek(mondayISO, sourceOffset)
      const res = readJSON(weekKey(sourceISO))
      if (!(res.ok && res.value)) return { ok: false, reason: 'source-vide' }
      const cloned = cloneWeekForTarget(res.value, mondayISO)
      const ok = writeWeek(mondayISO, cloned) // backup automatique avant écrasement
      setWeek(cloned)
      setSaveStatus(ok ? 'saved' : 'retry')
      return { ok, reason: ok ? null : 'write' }
    },
    [mondayISO],
  )

  // Réessai d'enregistrement (si un write a échoué).
  const retrySave = useCallback(() => {
    if (!week) return
    if (isWeekBlocked(week.weekStart)) return
    const ok = writeWeek(week.weekStart, week)
    setSaveStatus(ok ? 'saved' : 'retry')
  }, [week])

  // ------------------------------------------------------------------
  // Navigation semaine.
  // ------------------------------------------------------------------
  const goPrev = useCallback(() => setMondayISO((m) => shiftWeek(m, -1)), [])
  const goNext = useCallback(() => setMondayISO((m) => shiftWeek(m, +1)), [])
  const goToday = useCallback(() => setMondayISO(mondayOf(todayISO())), [])
  const goToWeek = useCallback((iso) => setMondayISO(mondayOf(iso)), [])

  // ------------------------------------------------------------------
  // Postes & extras.
  // ------------------------------------------------------------------
  const setPoste = useCallback((name, def) => {
    setPostesOverride((prev) => {
      const next = { ...prev, [name]: def }
      writeRaw(POSTES_KEY, next)
      return next
    })
  }, [])

  const resetPostes = useCallback(() => {
    setPostesOverride({})
    writeRaw(POSTES_KEY, {})
  }, [])

  const addExtra = useCallback((name) => {
    const clean = name.trim()
    if (!clean) return
    setExtras((prev) => (prev.includes(clean) ? prev : [...prev, clean]))
  }, [])

  // Restaure le backup de la semaine courante.
  const restoreCurrentBackup = useCallback(() => {
    if (restoreBackup(mondayISO)) loadWeek(mondayISO)
  }, [mondayISO, loadWeek])

  const value = {
    mondayISO,
    week,
    saveStatus,
    errorBanner,
    postesMap,
    postesOverride,
    extras,
    allNames,
    updateWeek,
    replaceWeek,
    copyWeekFrom,
    weekIsEmpty: isWeekEmpty(week),
    retrySave,
    goPrev,
    goNext,
    goToday,
    goToWeek,
    setPoste,
    resetPostes,
    addExtra,
    reloadWeek: () => loadWeek(mondayISO),
    restoreCurrentBackup,
  }

  return <FloraContext.Provider value={value}>{children}</FloraContext.Provider>
}

export function useFlora() {
  const ctx = useContext(FloraContext)
  if (!ctx) throw new Error('useFlora doit être utilisé dans <FloraProvider>')
  return ctx
}
