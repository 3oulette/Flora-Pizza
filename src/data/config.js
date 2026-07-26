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
    postes: ['Chef', 'Chef de partie', 'Pizzaiolo', 'Plonge'],
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
export const DEFAULT_POSTE = {
  Claudia: { equipe: 'salle', poste: 'Chef de rang' },
  Candice: { equipe: 'salle', poste: 'Caisse' },
  Lou: { equipe: 'salle', poste: 'Barman' },
  Anouk: { equipe: 'salle', poste: 'Chef de rang' },
  Ludo: { equipe: 'cuisine', poste: 'Pizzaiolo' },
  Mathis: { equipe: 'salle', poste: 'Chef de rang' },
  Axel: { equipe: 'salle', poste: 'Runner food' },
  Thomas: { equipe: 'cuisine', poste: 'Pizzaiolo' },
  Nico: { equipe: 'cuisine', poste: 'Chef' },
  Santi: { equipe: 'cuisine', poste: 'Chef de partie' },
  Daniel: { equipe: 'cuisine', poste: 'Chef de partie' },
  Alexis: { equipe: 'salle', poste: 'Runner boisson' },
  Chaher: { equipe: 'cuisine', poste: 'Chef de partie' },
  Fabien: { equipe: 'cuisine', poste: 'Chef de partie' },
  Ildiko: { equipe: 'cuisine', poste: 'Plonge' },
  Romane: { equipe: 'salle', poste: 'Joker' },
  Adrien: { equipe: 'salle', poste: 'Joker' },
  Paola: { equipe: 'salle', poste: 'Caisse' },
  Coco: { equipe: 'cuisine', poste: 'Plonge' },
  Cloe: { equipe: 'salle', poste: 'Chef de rang' },
  Antoine: { equipe: 'salle', poste: 'Barman' },
}

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

export const PRELOAD_SHIFTS = {
  Claudia: ['J', 'R', 'J', 'J', 'MM', 'J', 'J'],
  Candice: ['J', 'J', 'MM', 'MM', 'J', 'R', 'MM'],
  Lou: ['MM', 'MM', 'R', 'MM', 'MM', 'MM', ''],
  Anouk: ['R', 'MM', 'J', 'S', 'S', 'MM', 'J'],
  Ludo: ['S', 'S', 'R', 'S', 'S', 'S', 'S'],
  Mathis: ['S', 'R', 'S', 'S', 'S', 'S', 'M+S'],
  Axel: ['R', 'S', 'S', 'S', 'S', 'S', 'S'],
  Thomas: ['S', 'S', 'S', 'S', 'S', 'S', 'S'],
  Nico: ['MS', 'J', 'MS', 'MS', 'MS', 'MS', 'MS'],
  Santi: ['MM', 'R', 'J', 'J', 'J', 'J', 'J'],
  Daniel: ['S', 'S', 'S', 'S', 'S', 'S', 'S'],
  Alexis: ['S', 'MS', 'S', 'S', 'S', 'S', 'S'],
  Chaher: ['S', 'S', 'S', 'S', 'S', 'S', 'S'],
  Fabien: ['S', 'S', 'S', 'S', 'S', 'S', 'S'],
  Ildiko: ['M+S', 'M+S', 'M+S', 'M+S', 'M+S', 'M+S', 'R'],
  Romane: ['', 'S', '', 'S', '', 'S', ''],
  Adrien: ['S', 'S', '', '', 'S', '', ''],
  Paola: ['S', 'S', 'S', '', '', '', ''],
  Coco: ['S', 'S', 'S', 'S', 'S', 'S', 'S'],
  Cloe: ['S', 'S', 'S', 'S', 'S', 'S', 'S'],
  Antoine: ['', '', 'S', '', '', 'S', 'S'],
  // Extra hors équipe
  Franco: ['', '', '', '', '', '', 'S'],
}

// Extras hors équipe présents dans le pré-chargement
export const PRELOAD_EXTRAS = ['Franco']
