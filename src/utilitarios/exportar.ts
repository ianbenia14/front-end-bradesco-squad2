export const baixarArquivo = (name: string, content: string, mime = "text/csv;charset=utf-8") => {
  const blob = new Blob(["\ufeff" + content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const csvLinha = (cols: (string | number)[]) =>
  cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")
