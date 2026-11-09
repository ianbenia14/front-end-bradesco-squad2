const privacidade: [string, string][] = [
  ["1. Dados que coletamos", "Coletamos nome, e-mail e as informações financeiras que você registra (transações, orçamentos, metas e renda). Não coletamos dados além do necessário para o funcionamento do serviço."],
  ["2. Como usamos seus dados", "Usamos os dados para organizar suas finanças, calcular indicadores, gerar alertas e recomendações. Não vendemos nem compartilhamos suas informações com terceiros para publicidade."],
  ["3. Segurança", "As senhas são protegidas por hash com salt e nunca guardadas em texto puro. Em produção, a comunicação com o servidor deve usar conexão criptografada (HTTPS)."],
  ["4. Seus direitos (LGPD)", "Você pode acessar, corrigir, exportar e excluir seus dados a qualquer momento, além de revogar o consentimento. Em Configurações é possível apagar seus dados e excluir a conta."],
  ["5. Retenção", "Mantemos seu histórico financeiro enquanto a conta estiver ativa. Ao excluir a conta, os dados são removidos."],
  ["6. Contato", "Dúvidas sobre privacidade: suporte@saldomais.com.br."],
]

const termos: [string, string][] = [
  ["1. Aceitação", "Ao criar uma conta você declara ter lido e aceitado estes Termos de Uso e a Política de Privacidade."],
  ["2. O serviço", "O Saldo+ é uma ferramenta de organização financeira pessoal. As recomendações e o score são informativos e não constituem consultoria financeira, de investimento ou jurídica."],
  ["3. Responsabilidades do usuário", "Você é responsável pela veracidade dos dados inseridos e pela guarda de sua senha, e não deve compartilhar o acesso à conta."],
  ["4. Uso adequado", "É proibido usar o serviço para fins ilícitos, tentar acessar contas de terceiros ou comprometer a segurança da plataforma."],
  ["5. Alterações", "Estes termos podem ser atualizados. Mudanças relevantes serão comunicadas no aplicativo."],
  ["6. Contato", "suporte@saldomais.com.br."],
]

export function ConteudoLegal({ kind }: { kind: "privacy" | "terms" }) {
  const sections = kind === "privacy" ? privacidade : termos
  return (
    <div className="legal">
      {sections.map(([title, text]) => (
        <section key={title}>
          <h3>{title}</h3>
          <p>{text}</p>
        </section>
      ))}
      <small>Texto de referência para o projeto; revise com a área jurídica antes de publicar.</small>
    </div>
  )
}
