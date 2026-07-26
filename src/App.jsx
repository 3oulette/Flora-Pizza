import { useState } from 'react'
import { useFlora } from './state'
import { todayISO, weekDays } from './lib/dates'
import Header from './components/Header'
import DayView from './components/DayView'
import WeekView from './components/WeekView'
import ShareView from './components/ShareView'
import DataPanel from './components/DataPanel'

const TABS = [
  { key: 'jour', label: 'Jour', ico: '📅' },
  { key: 'semaine', label: 'Semaine', ico: '🗓' },
  { key: 'partage', label: 'Partage', ico: '📤' },
  { key: 'donnees', label: 'Données', ico: '🗂' },
]

export default function App() {
  const { week, mondayISO, errorBanner } = useFlora()
  const [tab, setTab] = useState('jour')

  // Jour sélectionné (partagé entre vue Jour et ouverture depuis vue Semaine).
  const [selectedDay, setSelectedDay] = useState(() => {
    const t = todayISO()
    const days = weekDays(mondayISO)
    return days.includes(t) ? t : days[0]
  })

  const openDay = (dayKey) => {
    setSelectedDay(dayKey)
    setTab('jour')
  }

  return (
    <div className="app">
      <Header />

      <main className="content">
        {errorBanner && (
          <div className="error-banner">
            <span>⚠</span>
            <span>{errorBanner}</span>
          </div>
        )}

        {!week ? (
          <div className="empty-state">Chargement…</div>
        ) : (
          <>
            {tab === 'jour' && (
              <DayView selected={selectedDay} setSelected={setSelectedDay} />
            )}
            {tab === 'semaine' && <WeekView onOpenDay={openDay} />}
            {tab === 'partage' && <ShareView />}
            {tab === 'donnees' && <DataPanel />}
          </>
        )}
      </main>

      <nav className="tabbar">
        <div className="tabbar-inner">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              <span className="ico">{t.ico}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
