export function Campo({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="field-label">
      <span>{label}</span>
      <input className="field" {...props} />
    </label>
  )
}
