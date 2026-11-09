import { useState } from "react"
import type { PublicScreen } from "../tipos"
import { money, parseMoneyValue } from "../utilitarios/formatacao"
import { Botao } from "../componentes/Botao"
import { Campo } from "../componentes/Campo"
import { Cartao } from "../componentes/Cartao"
import { CabecalhoPublico, RodapePublico } from "../componentes/CabecalhoPublico"

const num = (v: FormDataEntryValue | null) => Math.abs(parseMoneyValue(v)) || 0
const monthly = (annualPct: number) => Math.pow(1 + annualPct / 100, 1 / 12) - 1

type Tab = "juros" | "meta" | "fire"

function Juros() {
  const [result, setResult] = useState<{ total: number; invested: number } | null>(null)
  return (
    <form
      className="tool-form"
      onSubmit={(e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        const p = num(f.get("initial")), a = num(f.get("monthly")), rate = num(f.get("rate")), years = num(f.get("years"))
        const n = Math.round(years * 12), i = monthly(rate)
        const total = i ? p * Math.pow(1 + i, n) + a * ((Math.pow(1 + i, n) - 1) / i) : p + a * n
        setResult({ total, invested: p + a * n })
      }}
    >
      <div className="two-fields">
        <Campo label="Valor inicial" name="initial" inputMode="decimal" defaultValue="1000,00" />
        <Campo label="Aporte mensal" name="monthly" inputMode="decimal" defaultValue="500,00" />
      </div>
      <div className="two-fields">
        <Campo label="Taxa de juros ao ano (%)" name="rate" inputMode="decimal" defaultValue="10" />
        <Campo label="Prazo (anos)" name="years" inputMode="numeric" defaultValue="10" />
      </div>
      <Botao type="submit">Calcular</Botao>
      {result && (
        <div className="tool-result">
          <div><span>Montante final</span><strong>{money(result.total)}</strong></div>
          <div><span>Total investido</span><strong>{money(result.invested)}</strong></div>
          <div><span>Juros ganhos</span><strong>{money(result.total - result.invested)}</strong></div>
        </div>
      )}
    </form>
  )
}

function Meta() {
  const [result, setResult] = useState<{ perMonth: number; months: number } | null>(null)
  return (
    <form
      className="tool-form"
      onSubmit={(e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        const target = num(f.get("target")), have = num(f.get("have")), months = Math.max(1, Math.round(num(f.get("months")))), rate = num(f.get("rate"))
        const i = monthly(rate)
        const growth = Math.pow(1 + i, months)
        const need = Math.max(0, target - have * growth)
        const perMonth = i ? (need * i) / (growth - 1) : need / months
        setResult({ perMonth, months })
      }}
    >
      <div className="two-fields">
        <Campo label="Valor da meta" name="target" inputMode="decimal" defaultValue="15000,00" />
        <Campo label="Já acumulado" name="have" inputMode="decimal" defaultValue="0,00" />
      </div>
      <div className="two-fields">
        <Campo label="Prazo (meses)" name="months" inputMode="numeric" defaultValue="24" />
        <Campo label="Rendimento ao ano (%)" name="rate" inputMode="decimal" defaultValue="0" />
      </div>
      <Botao type="submit">Calcular</Botao>
      {result && (
        <div className="tool-result">
          <div><span>Guardar por mês</span><strong>{money(result.perMonth)}</strong></div>
          <div><span>Durante</span><strong>{result.months} meses</strong></div>
        </div>
      )}
    </form>
  )
}

function Fire() {
  const [result, setResult] = useState<{ needed: number; years: number | null } | null>(null)
  return (
    <form
      className="tool-form"
      onSubmit={(e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        const spend = num(f.get("spend")), have = num(f.get("have")), a = num(f.get("monthly")), rate = num(f.get("rate"))
        const needed = (spend * 12) / 0.04
        const i = monthly(rate)
        let bal = have, m = 0
        while (bal < needed && m < 1200) { bal = bal * (1 + i) + a; m++ }
        setResult({ needed, years: bal >= needed ? m / 12 : null })
      }}
    >
      <div className="two-fields">
        <Campo label="Gasto mensal desejado" name="spend" inputMode="decimal" defaultValue="5000,00" />
        <Campo label="Patrimônio atual" name="have" inputMode="decimal" defaultValue="20000,00" />
      </div>
      <div className="two-fields">
        <Campo label="Aporte mensal" name="monthly" inputMode="decimal" defaultValue="2000,00" />
        <Campo label="Rendimento ao ano (%)" name="rate" inputMode="decimal" defaultValue="8" />
      </div>
      <Botao type="submit">Simular</Botao>
      {result && (
        <div className="tool-result">
          <div><span>Patrimônio necessário (regra dos 4%)</span><strong>{money(result.needed)}</strong></div>
          <div>
            <span>Tempo estimado</span>
            <strong>{result.years === null ? "Mais de 100 anos" : `${result.years.toFixed(1).replace(".", ",")} anos`}</strong>
          </div>
        </div>
      )}
    </form>
  )
}

export function Ferramentas({ goTo }: { goTo: (s: PublicScreen) => void }) {
  const [tab, setTab] = useState<Tab>("juros")
  return (
    <div className="public-page">
      <CabecalhoPublico goTo={goTo} />
      <main className="public-content narrow">
        <h1>Ferramentas gratuitas</h1>
        <p className="lead">Simule na hora, sem precisar de cadastro. Os resultados são estimativas.</p>
        <div className="segmented tool-tabs">
          <button className={tab === "juros" ? "active" : ""} onClick={() => setTab("juros")}>Juros compostos</button>
          <button className={tab === "meta" ? "active" : ""} onClick={() => setTab("meta")}>Meta</button>
          <button className={tab === "fire" ? "active" : ""} onClick={() => setTab("fire")}>Independência financeira</button>
        </div>
        <Cartao className="tool-card">
          {tab === "juros" && <Juros />}
          {tab === "meta" && <Meta />}
          {tab === "fire" && <Fire />}
        </Cartao>
        <div className="cta-inline">
          <span>Quer acompanhar tudo isso no dia a dia?</span>
          <Botao onClick={() => goTo("register")}>Criar conta grátis</Botao>
        </div>
      </main>
      <RodapePublico goTo={goTo} />
    </div>
  )
}
