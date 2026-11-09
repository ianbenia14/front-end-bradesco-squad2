import { expenseCategories, incomeCategory } from "../dados/categorias"
import { type Filtros, filtrosVazios } from "../utilitarios/filtros"
import { Cartao } from "./Cartao"
import { Selecao } from "./Selecao"

export function FiltrosFinanceiros({
  filtros,
  setFiltros,
}: {
  filtros: Filtros
  setFiltros: (f: Filtros) => void
}) {
  const set = (patch: Partial<Filtros>) => setFiltros({ ...filtros, ...patch })
  return (
    <Cartao className="filters-card wrap">
      <span className="filter-title">Filtrar por</span>
      <label className="filter-date">
        <span>De</span>
        <input className="field" type="date" value={filtros.from} onChange={(e) => set({ from: e.target.value })} />
      </label>
      <label className="filter-date">
        <span>Até</span>
        <input className="field" type="date" value={filtros.to} onChange={(e) => set({ to: e.target.value })} />
      </label>
      <Selecao value={filtros.type} onChange={(e) => set({ type: e.target.value })}>
        <option value="all">Todos os tipos</option>
        <option value="income">Receitas</option>
        <option value="expense">Despesas</option>
      </Selecao>
      <Selecao value={filtros.category} onChange={(e) => set({ category: e.target.value })}>
        <option value="all">Todas as categorias</option>
        {expenseCategories.map((name) => (
          <option key={name}>{name}</option>
        ))}
        <option>{incomeCategory}</option>
      </Selecao>
      <input
        className="field filter-text"
        placeholder="Estabelecimento"
        value={filtros.establishment}
        onChange={(e) => set({ establishment: e.target.value })}
      />
      <Selecao value={filtros.recurring} onChange={(e) => set({ recurring: e.target.value })}>
        <option value="all">Recorrentes e avulsas</option>
        <option value="yes">Somente recorrentes</option>
        <option value="no">Somente avulsas</option>
      </Selecao>
      <button className="clear-filter" onClick={() => setFiltros(filtrosVazios)}>
        Limpar filtros
      </button>
    </Cartao>
  )
}
