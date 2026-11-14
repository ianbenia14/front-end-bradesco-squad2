import { type KeyboardEvent, type ReactNode, useEffect, useRef } from "react"
import { Cartao } from "./Cartao"

const focusable = 'input, select, textarea, button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'

export function Modal({
  onClose,
  label,
  children,
}: {
  onClose: () => void
  label: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    ref.current?.querySelector<HTMLElement>("input, select, textarea")?.focus()
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      previous?.focus?.()
    }
  }, [])
  const trap = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !ref.current) return
    const items = Array.from(ref.current.querySelectorAll<HTMLElement>(focusable)) as HTMLElement[]
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <Cartao className="modal">
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onKeyDown={trap}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </Cartao>
    </div>
  )
}
