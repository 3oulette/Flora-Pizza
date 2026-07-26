import { useEffect } from 'react'

// Bottom sheet générique : overlay + panneau qui monte du bas.
export default function BottomSheet({ title, subtitle, onClose, children }) {
  // Empêche le scroll de la page derrière la sheet.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <div
      className="sheet-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        <div className="sheet-head">
          <div className="st-titre">{title}</div>
          {subtitle && <div className="st-sub">{subtitle}</div>}
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}
