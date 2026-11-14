import { type ReactNode, useEffect, useState } from "react"
import type { PublicScreen } from "../tipos"
import { Botao } from "../componentes/Botao"
import { CabecalhoPublico, RodapePublico } from "../componentes/CabecalhoPublico"
import { Icone } from "../componentes/Icone"

const slides: { title: string; text: string; visual: ReactNode }[] = [
  {
    title: "Controle de receitas e despesas",
    text: "Registre cada entrada e saída, com categoria, estabelecimento e recorrência, em poucos toques.",
    visual: (
      <div className="mock-list">
        <div><span>Salário mensal</span><b className="positive">+ R$ 8.200,00</b></div>
        <div><span>Supermercado</span><b className="negative">- R$ 486,20</b></div>
        <div><span>Netflix</span><b className="negative">- R$ 55,90</b></div>
      </div>
    ),
  },
  {
    title: "Gráficos e relatórios",
    text: "Veja para onde vai o seu dinheiro por categoria, período e estabelecimento, mês a mês.",
    visual: (
      <div className="mock-bars">
        {[40, 62, 48, 78, 58, 90].map((h, i) => (
          <i key={i} style={{ height: `${h}%` }} />
        ))}
      </div>
    ),
  },
  {
    title: "Metas e alertas",
    text: "Defina limites por categoria e metas de economia. Receba avisos antes de estourar o orçamento.",
    visual: (
      <div className="mock-goal">
        <span>Orçamento de Alimentação</span>
        <div className="progress"><i className="orange" style={{ width: "92%" }} /></div>
        <small>Você já utilizou 92% do orçamento este mês.</small>
      </div>
    ),
  },
  {
    title: "Planejamento e saúde financeira",
    text: "Receba uma divisão 50/30/20 da sua renda e acompanhe seu score de 0 a 100.",
    visual: (
      <div className="mock-score">
        <strong>82</strong>
        <span>Excelente</span>
        <small>50% · 30% · 20%</small>
      </div>
    ),
  },
]

const benefits = [
  "Seus dados criptografados e protegidos",
  "Não vendemos suas informações",
  "Em conformidade com a LGPD",
]

export function BoasVindas({
  goTo,
  onGuest,
}: {
  goTo: (s: PublicScreen) => void
  onGuest: () => void
}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000)
    return () => clearInterval(id)
  }, [paused])
  const slide = slides[index]
  return (
    <div className="public-page">
      <CabecalhoPublico goTo={goTo} />
      <main>
        <section className="hero-split">
          <span className="deco deco-1" aria-hidden="true" />
          <span className="deco deco-2" aria-hidden="true" />
          <div className="hero-copy">
            <span className="hero-tag">Gestão financeira pessoal</span>
            <h1>
              Assuma o controle do seu dinheiro <span className="hl">sem planilhas chatas.</span>
            </h1>
            <p>
              Registre receitas e despesas, acompanhe orçamentos, receba alertas
              antes de estourar o limite e planeje seu futuro financeiro em um só lugar.
            </p>
            <div className="hero-cta">
              <Botao onClick={() => goTo("register")}>Criar conta grátis</Botao>
              <Botao variant="secondary" onClick={() => goTo("login")}>Entrar</Botao>
            </div>
            <button className="link-button" onClick={onGuest}>
              Experimentar sem cadastro (modo convidado) →
            </button>
            <div className="hero-stats">
              <div><strong>12</strong><span>categorias</span></div>
              <div><strong>50/30/20</strong><span>planejamento</span></div>
              <div><strong>0–100</strong><span>score financeiro</span></div>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-card">
              <div className="hc-top">
                <div>
                  <small>Saldo disponível</small>
                  <strong>R$ 12.480,50</strong>
                </div>
                <em>+12,8%</em>
              </div>
              <div className="hc-bars">
                {[38, 55, 44, 70, 52, 86].map((h, i) => (
                  <i key={i} className={i === 5 ? "gold" : ""} style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="hc-row">
                <div className="hc-score"><strong>82</strong><span>Excelente</span></div>
                <div className="hc-budget">
                  <span>Alimentação · Atenção</span>
                  <div className="progress"><i className="orange" style={{ width: "78%" }} /></div>
                </div>
              </div>
            </div>
            <div className="hero-pills">
              {["Receitas e despesas", "Orçamento e alertas", "Metas e planejamento", "Relatórios"].map((t) => (
                <div className="pill-outer" key={t}><span>{t}</span></div>
              ))}
            </div>
          </div>
        </section>

        <section className="trust">
          {benefits.map((b) => (
            <span key={b}><Icone name="check" size={16} /> {b}</span>
          ))}
        </section>

        <section className="band">
          <h2>Por que escolher o Saldo+?</h2>
          <div className="band-grid">
            <div><b>01</b><h3>Tudo em um só lugar</h3><p>Receitas, despesas, orçamentos, metas e relatórios sem precisar de planilhas.</p></div>
            <div><b>02</b><h3>Alertas antes do problema</h3><p>Avisos quando um orçamento chega perto do limite ou quando seus gastos sobem.</p></div>
            <div><b>03</b><h3>Plano para o seu dinheiro</h3><p>Divisão 50/30/20, reserva de emergência e score de saúde financeira.</p></div>
          </div>
        </section>

        <section className="how-title">
          <h2>Veja como funciona</h2>
        </section>
        <section
          className="carousel"
          aria-roledescription="carrossel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <button className="carousel-arrow" aria-label="Slide anterior" onClick={() => setIndex((index + slides.length - 1) % slides.length)}>
            <span style={{ transform: "rotate(180deg)", display: "grid" }}><Icone name="chevron" size={18} /></span>
          </button>
          <div className="carousel-slide" key={index}>
            <div className="carousel-visual">{slide.visual}</div>
            <div className="carousel-copy">
              <small>{index + 1} de {slides.length}</small>
              <h2>{slide.title}</h2>
              <p>{slide.text}</p>
            </div>
          </div>
          <button className="carousel-arrow" aria-label="Próximo slide" onClick={() => setIndex((index + 1) % slides.length)}>
            <Icone name="chevron" size={18} />
          </button>
          <div className="carousel-dots">
            {slides.map((s, i) => (
              <button key={s.title} aria-label={`Ir para o slide ${i + 1}`} className={i === index ? "active" : ""} onClick={() => setIndex(i)} />
            ))}
          </div>
        </section>

        <section className="tools-teaser">
          <div>
            <h2>Teste agora, sem cadastro</h2>
            <p>Calculadora de juros compostos, de metas e de independência financeira.</p>
          </div>
          <Botao variant="secondary" onClick={() => goTo("tools")}>Abrir ferramentas</Botao>
        </section>

        <section className="tools-teaser">
          <div>
            <h2>Ficou com dúvida?</h2>
            <p>Veja as perguntas frequentes ou fale com o nosso suporte.</p>
          </div>
          <Botao variant="secondary" onClick={() => goTo("faq")}>Central de ajuda</Botao>
        </section>
      </main>
      <RodapePublico goTo={goTo} />
    </div>
  )
}
