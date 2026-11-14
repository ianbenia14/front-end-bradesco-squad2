import { type ChangeEvent, useState } from "react"
import type { Transaction } from "../tipos"
import { categoryIcons, expenseCategories, incomeCategory, suggestCategory } from "../dados/categorias"
import { baixarArquivo } from "../utilitarios/exportar"
import { fromInputDate, toInputDate } from "../utilitarios/datas"
import { money, round2 } from "../utilitarios/formatacao"
import { Botao } from "./Botao"
import { Modal } from "./Modal"
import { Selecao } from "./Selecao"
import { TituloSecao } from "./TituloSecao"

type Linha = {
  key: number
  iso: string
  title: string
  value: number
  establishment: string
  category: string
  duplicate: boolean
  selected: boolean
}

const parseValor = (raw: string) => {
  const t = raw.replace(/[R$\s]/g, "")
  if (!t) return NaN
  const normalized = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t
  return Number(normalized)
}

const parseData = (raw: string) => {
  const t = raw.trim()
  const br = t.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (br) return `${br[3]}-${br[2].padStart(2, "0")}-${br[1].padStart(2, "0")}`
  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : ""
}

const modelo = "data;descricao;valor;estabelecimento\n05/11/2026;Supermercado;-186,40;Pão de Açúcar\n05/11/2026;Salário;5200,00;Empresa\n"

export function ImportarExtrato({
  existing,
  onImport,
  onClose,
}: {
  existing: Transaction[]
  onImport: (list: Transaction[]) => void
  onClose: () => void
}) {
  const [rows, setRows] = useState<Linha[]>([])
  const [error, setError] = useState("")

  const read = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    const text = await file.text()
    const lines = text.split(/\r?\n/).filter((l) => l.trim())
    if (!lines.length) return setError("O arquivo está vazio.")
    const sep = lines[0].includes(";") ? ";" : ","
    const parsed: Linha[] = []
    lines.forEach((line, index) => {
      const cols = line.split(sep).map((c) => c.replace(/^"|"$/g, "").trim())
      const iso = parseData(cols[0] ?? "")
      const value = parseValor(cols[2] ?? "")
      if (!iso || Number.isNaN(value) || value === 0) return // cabeçalho ou linha inválida
      const title = cols[1] || "Transação importada"
      const establishment = cols[3] ?? ""
      const category = value < 0 ? suggestCategory(establishment || title) ?? "Outros" : incomeCategory
      const duplicate = existing.some(
        (t) => toInputDate(t.date) === iso && t.title === title && round2(t.amount) === round2(value),
      )
      parsed.push({ key: index, iso, title, value, establishment, category, duplicate, selected: !duplicate })
    })
    if (!parsed.length)
      return setError("Nenhuma linha válida. Use as colunas: data;descricao;valor;estabelecimento.")
    setRows(parsed)
  }

  const update = (key: number, patch: Partial<Linha>) =>
    setRows((cur) => cur.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  const chosen = rows.filter((r) => r.selected)
  const confirm = () => {
    const base = existing.reduce((max, t) => Math.max(max, t.id), 0)
    onImport(
      chosen.map((r, i) => ({
        id: base + i + 1,
        title: r.title,
        category: r.category,
        date: fromInputDate(r.iso),
        amount: r.value,
        type: r.value < 0 ? "expense" : "income",
        icon: categoryIcons[r.category] ?? "wallet",
        establishment: r.establishment || undefined,
        recurring: false,
      })),
    )
  }

  return (
    <Modal onClose={onClose} label="Importar extrato">
      <div className="import-modal">
        <TituloSecao
          title="Importar extrato (CSV)"
          action={
            <button className="icon-button" aria-label="Fechar" onClick={onClose}>
              ×
            </button>
          }
        />
        <p className="import-help">
          Colunas: <b>data;descricao;valor;estabelecimento</b>. Valores negativos são despesas.{" "}
          <button className="link-button" onClick={() => baixarArquivo("modelo-extrato.csv", modelo)}>
            Baixar modelo
          </button>
        </p>
        <input type="file" accept=".csv,text/csv" onChange={read} aria-label="Selecionar arquivo CSV" />
        {error && <small className="form-error">{error}</small>}
        {rows.length > 0 && (
          <>
            <div className="import-table">
              {rows.map((r) => (
                <div key={r.key} className={`import-row ${r.duplicate ? "dup" : ""}`}>
                  <input
                    type="checkbox"
                    checked={r.selected}
                    aria-label={`Importar ${r.title}`}
                    onChange={(e) => update(r.key, { selected: e.target.checked })}
                  />
                  <span>{fromInputDate(r.iso)}</span>
                  <span className="import-title">
                    {r.title}
                    {r.duplicate && <em> · já existe</em>}
                  </span>
                  {r.value < 0 ? (
                    <Selecao value={r.category} onChange={(e) => update(r.key, { category: e.target.value })}>
                      {expenseCategories.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </Selecao>
                  ) : (
                    <span className="category-label">{incomeCategory}</span>
                  )}
                  <strong className={r.value > 0 ? "positive" : "negative"}>
                    {r.value > 0 ? "+" : "-"} {money(r.value)}
                  </strong>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <Botao type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Botao>
              <Botao type="button" disabled={!chosen.length} onClick={confirm}>
                Importar {chosen.length} transações
              </Botao>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
