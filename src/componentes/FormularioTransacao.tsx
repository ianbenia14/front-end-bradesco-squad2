import { useState } from "react"
import type { Transaction } from "../tipos"
import {
  categoryIcons,
  expenseCategories,
  incomeCategory,
  suggestCategory,
} from "../dados/categorias"
import { DEFAULT_DATE, monthNames, toInputDate } from "../utilitarios/datas"
import { parseMoneyValue, toInputValue } from "../utilitarios/formatacao"
import { Botao } from "./Botao"
import { Campo } from "./Campo"
import { Selecao } from "./Selecao"

export function FormularioTransacao({
  editing,
  onSave,
  onCancel,
}: {
  editing: Transaction | null
  onSave: (t: Transaction) => void
  onCancel: () => void
}) {
  const [type, setType] = useState<"income" | "expense">(editing?.type ?? "expense")
  const [category, setCategory] = useState(editing?.category ?? "")
  const [establishment, setEstablishment] = useState(editing?.establishment ?? "")
  const [touched, setTouched] = useState(Boolean(editing?.category))
  const [suggested, setSuggested] = useState<string | null>(null)
  const [error, setError] = useState("")

  const onEstablishment = (value: string) => {
    setEstablishment(value)
    const hint = suggestCategory(value)
    setSuggested(hint)
    if (hint && !touched && type === "expense") setCategory(hint)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        const value = Math.abs(parseMoneyValue(form.get("value")))
        if (!value || value <= 0) {
          setError("O valor da transação deve ser maior que zero.")
          return
        }
        const finalCategory =
          type === "income" ? incomeCategory : category || "Outros"
        const dateValue = String(form.get("date") ?? DEFAULT_DATE)
        const [year, month, day] = dateValue.split("-")
        onSave({
          id: editing ? editing.id : Date.now(),
          title: String(form.get("description")).trim(),
          category: finalCategory,
          date: `${day} ${monthNames[month] ?? "Out"} ${year}`,
          amount: type === "expense" ? -value : value,
          type,
          icon: categoryIcons[finalCategory] ?? "wallet",
          establishment: establishment.trim() || undefined,
          recurring: form.get("recurring") === "on",
        })
      }}
    >
      <Campo
        label="Descrição *"
        name="description"
        placeholder="Ex.: Compra no mercado"
        defaultValue={editing?.title ?? ""}
        required
      />
      <div className="two-fields">
        <Selecao
          label="Tipo *"
          name="type"
          value={type}
          onChange={(e) => {
            const next = e.target.value as "income" | "expense"
            setType(next)
            if (next === "income") setCategory("")
          }}
          required
        >
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </Selecao>
        <Campo
          label="Valor *"
          name="value"
          inputMode="decimal"
          placeholder="R$ 0,00"
          defaultValue={editing ? toInputValue(editing.amount) : ""}
          required
        />
      </div>
      <div className="two-fields">
        <Campo
          label="Estabelecimento"
          name="establishment"
          placeholder="Ex.: Netflix, Posto Shell"
          value={establishment}
          onChange={(e) => onEstablishment(e.target.value)}
        />
        <Campo
          label="Data *"
          name="date"
          type="date"
          defaultValue={editing ? toInputDate(editing.date) : DEFAULT_DATE}
          required
        />
      </div>
      {type === "expense" ? (
        <Selecao
          label="Categoria"
          name="category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            setTouched(true)
          }}
        >
          <option value="">Automática / Outros</option>
          {expenseCategories.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </Selecao>
      ) : (
        <Campo label="Categoria" value={incomeCategory} readOnly />
      )}
      {type === "expense" && suggested && !touched && (
        <small className="form-hint">Categoria sugerida pelo estabelecimento: {suggested}</small>
      )}
      <label className="check-label">
        <input type="checkbox" name="recurring" defaultChecked={editing?.recurring} />
        Transação recorrente
      </label>
      {error && <small className="form-error">{error}</small>}
      <div className="modal-actions">
        <Botao type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Botao>
        <Botao type="submit">{editing ? "Salvar alterações" : "Salvar transação"}</Botao>
      </div>
    </form>
  )
}
