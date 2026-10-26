import { Icone } from "./Icone"

export function Aviso({
  toast,
  onClose,
}: {
  toast: { title: string; text: string } | null
  onClose: () => void
}) {
  if (!toast) return null
  return (
    <div className="toast">
      <span className="toast-check">
        <Icone name="check" size={16} />
      </span>
      <div>
        <strong>{toast.title}</strong>
        <p>{toast.text}</p>
      </div>
      <button onClick={onClose}>
        <Icone name="x" size={17} />
      </button>
    </div>
  )
}
