// ============================================================================
// Café Flora — Configuration métier (saison juillet–août)
// ============================================================================

// --- Créneaux d'une journée ---
export const CRENEAUX = ['matin', 'midi', 'soir']

export const CRENEAU_LABEL = {
  matin: 'Matin',
  midi: 'Midi',
  soir: 'Soir',
}

// --- Équipes & postes ---
export const EQUIPES = {
  cuisine: {
    label: 'Cuisine',
    postes: ['Chef', 'Chef de partie', 'Pizzaiolo', 'Plonge', 'Crêperie'],
  },
  salle: {
    label: 'Salle',
    postes: ['Barman', 'Caisse', 'Chef de rang', 'Runner boisson', 'Runner food', 'Joker'],
  },
}

export const EQUIPE_KEYS = ['cuisine', 'salle']

// Liste plate de tous les postes avec leur équipe (pratique pour les sélecteurs)
export const TOUS_POSTES = EQUIPE_KEYS.flatMap((eq) =>
  EQUIPES[eq].postes.map((poste) => ({ equipe: eq, poste })),
)

// Poste → équipe (les postes sont uniques à une équipe).
export const POSTE_EQUIPE = Object.fromEntries(
  EQUIPE_KEYS.flatMap((eq) => EQUIPES[eq].postes.map((p) => [p, eq])),
)

// --- Besoins constants : slots à remplir chaque jour ---
// Chaque entrée = { equipe, poste, count }
export const BESOINS = {
  matin: [
    { equipe: 'cuisine', poste: 'Chef de partie', count: 1 },
    { equipe: 'cuisine', poste: 'Plonge', count: 1 },
    { equipe: 'salle', poste: 'Barman', count: 1 },
    { equipe: 'salle', poste: 'Chef de rang', count: 2 },
  ],
  midi: [
    { equipe: 'cuisine', poste: 'Chef', count: 1 },
    { equipe: 'cuisine', poste: 'Chef de partie', count: 1 },
    { equipe: 'salle', poste: 'Barman', count: 1 },
    { equipe: 'salle', poste: 'Chef de rang', count: 2 },
  ],
  soir: [
    { equipe: 'cuisine', poste: 'Chef', count: 1 },
    { equipe: 'cuisine', poste: 'Chef de partie', count: 3 },
    { equipe: 'cuisine', poste: 'Pizzaiolo', count: 2 },
    { equipe: 'cuisine', poste: 'Plonge', count: 1 },
    { equipe: 'cuisine', poste: 'Crêperie', count: 1 },
    { equipe: 'salle', poste: 'Barman', count: 1 },
    { equipe: 'salle', poste: 'Caisse', count: 1 },
    { equipe: 'salle', poste: 'Chef de rang', count: 3 },
    { equipe: 'salle', poste: 'Runner boisson', count: 1 },
    { equipe: 'salle', poste: 'Runner food', count: 1 },
    { equipe: 'salle', poste: 'Joker', count: 2 },
  ],
}

// --- Équipe fixe (21 personnes, dans l'ordre) ---
export const EQUIPE_FIXE = [
  'Claudia', 'Candice', 'Lou', 'Anouk', 'Ludo', 'Mathis', 'Axel',
  'Thomas', 'Nico', 'Santi', 'Daniel', 'Alexis', 'Chaher', 'Fabien',
  'Ildiko', 'Romane', 'Adrien', 'Paola', 'Coco', 'Cloe', 'Antoine',
]

// ============================================================================
// DEFAULT_POSTE — poste par défaut de chaque personne (équipe + poste).
// ----------------------------------------------------------------------------
// ⚠️ ANTOINE : cette répartition est une PROPOSITION déduite des shifts de la
// semaine et des besoins. Corrige-la ici, OU directement dans l'app via le
// panneau « Postes » (⚙︎). Tout est éditable et sauvegardé.
//
// Sert uniquement à ORDONNER les noms dans le sélecteur d'un slot (poste exact
// d'abord, puis même équipe, puis le reste) et à pré-affecter la semaine. Jamais
// de blocage : n'importe qui peut aller sur n'importe quel slot.
// ============================================================================
// Vidé volontairement : à définir par le manager dans l'app
// (Données ▸ Postes par défaut). Sert uniquement à ordonner les noms dans le
// sélecteur d'un slot ; n'affecte jamais le planning pré-chargé (défini
// explicitement plus bas dans PRELOAD_PLAN).
export const DEFAULT_POSTE = {}

// --- Extras hors équipe connus au départ (mémorisés, réutilisables) ---
export const EXTRAS_INITIAUX = ['Franco']

// ============================================================================
// Codes de shift (dérivés des créneaux travaillés)
// ============================================================================
// M  = matin | MM = matin/midi | Mi = midi | MS = midi/soir
// S  = soir  | M+S = coupure matin+soir | J = journée complète | R = repos
export const SHIFT_CODES = {
  M: { label: 'Matin', creneaux: ['matin'] },
  MM: { label: 'Matin/midi', creneaux: ['matin', 'midi'] },
  Mi: { label: 'Midi', creneaux: ['midi'] },
  MS: { label: 'Midi/soir', creneaux: ['midi', 'soir'] },
  S: { label: 'Soir', creneaux: ['soir'] },
  'M+S': { label: 'Matin + soir (coupure)', creneaux: ['matin', 'soir'] },
  J: { label: 'Journée complète', creneaux: ['matin', 'midi', 'soir'] },
  R: { label: 'Repos', creneaux: [] },
}

// Couleur d'affichage des badges de shift (vue Semaine & Partage)
export const SHIFT_COLOR = {
  M: '#C1801F', // or (matin)
  MM: '#B08A3E',
  Mi: '#2F6F87', // bleu (midi)
  MS: '#3A5775',
  S: '#4A3B63', // prune (soir)
  'M+S': '#8A5A2B',
  J: '#2E5940', // vert profond (journée)
  R: '#9AA69B', // gris/vert pâle (repos)
}

// ============================================================================
// Pré-chargement — semaine du lundi 27/07/2026 au dimanche 02/08/2026
// Ordre des colonnes : Lun, Mar, Mer, Jeu, Ven, Sam, Dim
// '' (vide) = ne travaille pas ce jour
// ============================================================================
export const PRELOAD_WEEK_START = '2026-07-27'

// Version de la graine de pré-chargement. À incrémenter pour forcer le
// rechargement du planning pré-chargé (écrase la semaine 27/07 sauvegardée
// localement, avec backup automatique). Les éditions ultérieures restent
// conservées tant que ce numéro ne change pas.
export const PRELOAD_SEED_VERSION = 2

// Helpers de saisie : F = affectation fixe, X = affectation extra.
const F = (poste, person) => ({ poste, person, extra: false })
const X = (poste, person) => ({ poste, person, extra: true })

// ----------------------------------------------------------------------------
// Planning explicite, jour par jour (Lun → Dim), tel que fourni.
// Chaque personne est placée sur un slot précis ; les slots des besoins non
// listés restent « à pourvoir ».
// ----------------------------------------------------------------------------
export const PRELOAD_PLAN = [
  // 0 — LUNDI 27 juil.
  {
    matin: [
      F('Chef de partie', 'Santi'),
      F('Plonge', 'Ildiko'),
      F('Barman', 'Claudia'),
      F('Chef de rang', 'Lou'),
      F('Chef de rang', 'Candice'),
    ],
    midi: [
      F('Chef', 'Nico'),
      F('Chef de partie', 'Santi'),
      F('Barman', 'Claudia'),
      F('Chef de rang', 'Lou'),
      F('Chef de rang', 'Candice'),
    ],
    soir: [
      F('Chef', 'Nico'),
      F('Chef de partie', 'Daniel'),
      F('Chef de partie', 'Alexis'),
      F('Pizzaiolo', 'Fabien'),
      F('Pizzaiolo', 'Chaher'),
      F('Plonge', 'Ildiko'),
      F('Barman', 'Ludo'),
      F('Caisse', 'Coco'),
      F('Chef de rang', 'Mathis'),
      X('Chef de rang', 'Claudia'),
      X('Chef de rang', 'Candice'),
      X('Runner boisson', 'Adrien'),
      X('Runner food', 'Paola'),
      F('Joker', 'Thomas'),
      F('Joker', 'Cloe'),
    ],
    repos: ['Anouk', 'Axel'],
  },
  // 1 — MARDI 28 juil.
  {
    matin: [
      F('Chef de partie', 'Nico'),
      F('Plonge', 'Ildiko'),
      F('Barman', 'Candice'),
      F('Chef de rang', 'Lou'),
      F('Chef de rang', 'Anouk'),
    ],
    midi: [
      F('Chef', 'Nico'),
      F('Chef de partie', 'Alexis'),
      F('Barman', 'Candice'),
      F('Chef de rang', 'Lou'),
      F('Chef de rang', 'Anouk'),
    ],
    soir: [
      F('Chef', 'Nico'),
      F('Chef de partie', 'Daniel'),
      F('Chef de partie', 'Alexis'),
      F('Pizzaiolo', 'Fabien'),
      F('Pizzaiolo', 'Chaher'),
      F('Plonge', 'Ildiko'),
      F('Barman', 'Ludo'),
      F('Caisse', 'Coco'),
      F('Chef de rang', 'Axel'),
      X('Chef de rang', 'Romane'),
      X('Chef de rang', 'Candice'),
      X('Runner boisson', 'Adrien'),
      X('Runner food', 'Paola'),
      F('Joker', 'Thomas'),
      F('Joker', 'Cloe'),
    ],
    repos: ['Santi', 'Claudia', 'Mathis'],
  },
  // 2 — MERCREDI 29 juil.
  {
    matin: [
      F('Chef de partie', 'Santi'),
      F('Plonge', 'Ildiko'),
      F('Barman', 'Claudia'),
      F('Chef de rang', 'Candice'),
      F('Chef de rang', 'Anouk'),
    ],
    midi: [
      X('Chef', 'Alexis'),
      F('Chef de partie', 'Santi'),
      F('Barman', 'Claudia'),
      F('Chef de rang', 'Candice'),
      F('Chef de rang', 'Anouk'),
    ],
    soir: [
      F('Chef', 'Nico'),
      F('Chef de partie', 'Daniel'),
      F('Chef de partie', 'Alexis'),
      X('Chef de partie', 'Santi'),
      F('Pizzaiolo', 'Fabien'),
      F('Pizzaiolo', 'Chaher'),
      F('Plonge', 'Ildiko'),
      X('Barman', 'Paola'),
      F('Caisse', 'Coco'),
      F('Chef de rang', 'Mathis'),
      F('Chef de rang', 'Axel'),
      X('Chef de rang', 'Anouk'),
      F('Runner boisson', 'Claudia'),
      F('Runner food', 'Antoine'),
      F('Joker', 'Thomas'),
      F('Joker', 'Cloe'),
    ],
    repos: ['Lou', 'Ludo'],
  },
  // 3 — JEUDI 30 juil.
  {
    matin: [
      F('Chef de partie', 'Santi'),
      F('Plonge', 'Ildiko'),
      F('Barman', 'Claudia'),
      F('Chef de rang', 'Lou'),
      F('Chef de rang', 'Candice'),
    ],
    midi: [
      F('Chef', 'Nico'),
      F('Chef de partie', 'Santi'),
      F('Barman', 'Claudia'),
      F('Chef de rang', 'Lou'),
      F('Chef de rang', 'Candice'),
    ],
    soir: [
      F('Chef', 'Nico'),
      F('Chef de partie', 'Daniel'),
      F('Chef de partie', 'Alexis'),
      X('Chef de partie', 'Santi'),
      F('Pizzaiolo', 'Fabien'),
      F('Pizzaiolo', 'Chaher'),
      F('Plonge', 'Ildiko'),
      F('Barman', 'Ludo'),
      F('Caisse', 'Coco'),
      F('Chef de rang', 'Mathis'),
      F('Chef de rang', 'Axel'),
      F('Chef de rang', 'Anouk'),
      F('Runner boisson', 'Claudia'),
      X('Runner food', 'Romane'),
      F('Joker', 'Thomas'),
      F('Joker', 'Cloe'),
    ],
    repos: [],
  },
  // 4 — VENDREDI 31 juil.
  {
    matin: [
      F('Chef de partie', 'Santi'),
      F('Plonge', 'Ildiko'),
      F('Barman', 'Claudia'),
      F('Chef de rang', 'Lou'),
      F('Chef de rang', 'Candice'),
    ],
    midi: [
      F('Chef', 'Nico'),
      F('Chef de partie', 'Santi'),
      F('Barman', 'Claudia'),
      F('Chef de rang', 'Lou'),
      F('Chef de rang', 'Candice'),
    ],
    soir: [
      F('Chef', 'Nico'),
      F('Chef de partie', 'Daniel'),
      F('Chef de partie', 'Alexis'),
      X('Chef de partie', 'Santi'),
      F('Pizzaiolo', 'Fabien'),
      F('Pizzaiolo', 'Chaher'),
      F('Plonge', 'Ildiko'),
      F('Barman', 'Ludo'),
      F('Caisse', 'Coco'),
      F('Chef de rang', 'Mathis'),
      F('Chef de rang', 'Axel'),
      F('Chef de rang', 'Anouk'),
      X('Runner boisson', 'Candice'),
      X('Runner food', 'Adrien'),
      F('Joker', 'Thomas'),
      F('Joker', 'Cloe'),
    ],
    repos: [],
  },
  // 5 — SAMEDI 1 août
  {
    matin: [
      F('Chef de partie', 'Santi'),
      F('Plonge', 'Ildiko'),
      F('Barman', 'Claudia'),
      F('Chef de rang', 'Lou'),
      F('Chef de rang', 'Anouk'),
    ],
    midi: [
      F('Chef', 'Nico'),
      F('Chef de partie', 'Santi'),
      F('Barman', 'Claudia'),
      F('Chef de rang', 'Lou'),
      F('Chef de rang', 'Anouk'),
    ],
    soir: [
      F('Chef', 'Nico'),
      F('Chef de partie', 'Daniel'),
      F('Chef de partie', 'Alexis'),
      X('Chef de partie', 'Santi'),
      F('Pizzaiolo', 'Fabien'),
      F('Pizzaiolo', 'Chaher'),
      F('Plonge', 'Ildiko'),
      F('Barman', 'Ludo'),
      F('Caisse', 'Coco'),
      F('Chef de rang', 'Mathis'),
      F('Chef de rang', 'Axel'),
      X('Chef de rang', 'Romane'),
      F('Runner boisson', 'Claudia'),
      F('Runner food', 'Antoine'),
      F('Joker', 'Thomas'),
      F('Joker', 'Cloe'),
    ],
    repos: ['Candice'],
  },
  // 6 — DIMANCHE 2 août
  {
    matin: [
      F('Chef de partie', 'Santi'),
      F('Plonge', 'Mathis'),
      F('Barman', 'Claudia'),
      F('Chef de rang', 'Candice'),
      F('Chef de rang', 'Anouk'),
    ],
    midi: [
      F('Chef', 'Nico'),
      F('Chef de partie', 'Santi'),
      F('Barman', 'Claudia'),
      F('Chef de rang', 'Candice'),
      F('Chef de rang', 'Anouk'),
    ],
    soir: [
      F('Chef', 'Nico'),
      F('Chef de partie', 'Daniel'),
      F('Chef de partie', 'Alexis'),
      X('Chef de partie', 'Santi'),
      F('Pizzaiolo', 'Fabien'),
      F('Pizzaiolo', 'Chaher'),
      X('Plonge', 'Franco'),
      F('Barman', 'Ludo'),
      F('Caisse', 'Coco'),
      F('Chef de rang', 'Mathis'),
      F('Chef de rang', 'Axel'),
      X('Chef de rang', 'Anouk'),
      F('Runner boisson', 'Claudia'),
      F('Runner food', 'Antoine'),
      F('Joker', 'Thomas'),
      F('Joker', 'Cloe'),
    ],
    repos: ['Ildiko'],
  },
]

// Extras hors équipe présents dans le pré-chargement
export const PRELOAD_EXTRAS = ['Franco']
