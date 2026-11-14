# Saldo+ — Front-end (React + TypeScript + Vite)

Sistema de Gestão Financeira Pessoal (Squad 2 — Bradesco). Interface em React com telas de boas-vindas, login, cadastro, painel, transações, orçamentos, metas, relatórios, planejamento e educação financeira. Este front ainda não está integrado ao back-end (Java/Spring).

## Sobre o projeto

O Saldo+ é um assistente financeiro digital que ajuda o usuário a controlar, acompanhar e planejar suas finanças. Ele centraliza receitas e despesas, classifica os gastos por categoria, monitora orçamentos e gera alertas e recomendações para decisões mais conscientes.

**Objetivos principais**
- Dar controle financeiro simplificado e mais transparência sobre os gastos.
- Estimular hábitos financeiros saudáveis e apoiar o planejamento mensal.
- Reduzir o risco de endividamento.

**Objetivos secundários**
- Incentivar a criação de reserva financeira e apoiar metas de investimento.
- Promover educação financeira de acordo com o perfil do usuário.
- Identificar gastos recorrentes desnecessários e gerar relatórios para acompanhamento.

**O que o sistema faz**
- Registra receitas e despesas (manualmente ou por importação de extrato CSV), com categoria, estabelecimento e recorrência.
- Classifica os gastos em 12 categorias, com sugestão automática pelo estabelecimento.
- Mostra painel e relatórios com filtros, indicadores e gráficos.
- Acompanha orçamentos por categoria com faixas de alerta (Normal, Atenção, Risco e Estourado).
- Gera alertas e insights, como orçamento no limite, aumento de gastos e queda de renda.
- Mapeia a renda, sugere a divisão 50/30/20 e recomenda reserva de emergência e investimentos.
- Acompanha metas financeiras e calcula um score de saúde financeira de 0 a 100.
- Guarda o histórico dos relatórios mensais e permite exportar em CSV e PDF.

## Como rodar

1. Instale o Node.js 20.19 ou superior (LTS): https://nodejs.org
2. Abra a pasta que contém o `package.json` no VS Code.
3. No terminal: `npm install`
4. Rodar: `npm run dev` e abrir o endereço mostrado (normalmente http://localhost:5173)
5. Build de produção: `npm run build`
6. Verificar o código: `npm run lint`

## Tecnologias

React 19, TypeScript, Vite, CSS (`index.css`) e ESLint.

## Estrutura

```
src/
  componentes/   peças reutilizáveis (menu, cartões, gráficos, filtros, modal, formulários)
  contexto/      usuário logado e alertas
  dados/         categorias, orçamentos, metas e transações de exemplo
  paginas/       telas do sistema
  servicos/      autenticação e armazenamento (localStorage)
  tipos/         tipos TypeScript
  utilitarios/   cálculos, datas, filtros, recorrência, relatórios, exportação e rotas
  App.tsx        controla sessão, tela atual e dados do usuário
```

## Telas

| Tela | O que faz |
|---|---|
| Boas-vindas | apresentação, carrossel, criar conta, entrar e modo convidado |
| Ferramentas | calculadoras de juros compostos, meta e independência financeira (sem cadastro) |
| Cadastro / Login | só entra quem tem conta cadastrada |
| Painel | receita, despesa, saldo, economia acumulada, % da renda comprometida, gráficos, alertas, score e filtros |
| Transações | cadastrar, editar e excluir; estabelecimento, recorrência com periodicidade, 12 categorias com sugestão automática; filtros, busca, paginação e importação de extrato CSV |
| Orçamentos | limite por categoria com consumo e faixas Normal / Atenção / Risco / Estourado |
| Metas | valor necessário por mês, tempo estimado e percentual atingido; registrar progresso; marcar a reserva de emergência |
| Relatórios | mensal e anual, ranking de categorias, evolução, comparativo mês a mês, score, histórico de relatórios salvos e exportação em CSV e PDF |
| Planejamento | salário, regra 50/30/20, reserva de emergência, investimento mínimo e evolução do patrimônio |
| Educação | dicas financeiras recomendadas de acordo com os dados do usuário |
| Configurações / Ajuda | dados da conta, apagar dados, excluir conta, notificações, FAQ, Privacidade e Termos |

## Regras implementadas no front

- Faixas de orçamento: até 70% Normal, 71–89% Atenção, acima de 90% Risco, acima de 100% Estourado.
- Score de saúde financeira de 0 a 100 (Crítico, Atenção, Bom, Excelente), recalculado a cada nova transação.
- Valor da transação maior que zero; comparações de insights só com dados suficientes.
- Transações recorrentes geram as próximas ocorrências automaticamente.
- Relatórios de meses encerrados são guardados automaticamente.
- O botão voltar do navegador navega entre as telas do site.

## Integração com o back-end

Ainda não existe. A API (Java + Spring Boot) está em outro projeto. A autenticação e o armazenamento ficam isolados em `src/servicos/autenticacao.ts`, que deve ser trocado por chamadas à API.

## O que ainda NÃO existe

- Back-end / API conectada: os dados ficam no `localStorage` do navegador.
- Autenticação real: a conta e a senha ficam só no navegador (senha com hash e salt).
- Login com Google, Apple e biometria, e redefinição de senha por e-mail (dependem do back).
- - Importação automática de transações via integração bancária (hoje só por arquivo CSV).
- Histórico dos relatórios mensais no servidor (hoje fica no navegador).
- Saldo anterior ao histórico: só existe como valor de demonstração no modo convidado.
- A fórmula do score e o tempo estimado das metas são interpretação do grupo, pois a descrição não define.
- Testes automatizados.
