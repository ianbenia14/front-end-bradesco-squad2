# Saldo+ — Front-end (React + TypeScript + Vite)

Sistema de Gestão Financeira Pessoal (Squad 2 — TakeOff). Protótipo de interface em React com telas de login, painel e transações, usando dados de exemplo.

## Como rodar no VS Code

1. **Pré-requisito:** Node.js 20 ou superior (LTS) instalado — https://nodejs.org
2. **Abrir o projeto:** `File > Open Folder` e escolha a pasta que contém o `package.json` (a pasta interna `front_saldo+`).
3. **Instalar dependências:** abra o terminal (`Terminal > New Terminal`) e rode `npm install`.
4. **Rodar:** `npm run dev`. O app sobe em http://localhost:5173. Se a porta estiver ocupada, o Vite usa a próxima (5174, por exemplo) e mostra o endereço no terminal.
5. **Gerar versão final:** `npm run build` (confere o TypeScript e gera a pasta `dist`).
6. **Verificar o código:** `npm run lint`.

Para clonar do GitHub:

```
git clone https://github.com/ianbenia14/front-end.git
cd front-end
npm install
npm run dev
```

## Tecnologias

React 19, TypeScript, Vite, CSS (`estilos.css`) e ESLint.

## Estrutura

```
src/
  componentes/   Botao, CamposFormulario, Cartoes, Icones, LogoMenuCabecalho (menu lateral)
  dados/         transacoesExemplo (dados fictícios)
  paginas/
    Login/       TelaLogin (entrar / criar conta)
    Painel/      TelaPainel (dashboard)
    Transacoes/  TelaTransacoes e ListaTransacoes
  tipos/         tipos TypeScript (Screen, Transaction)
  utilitarios/   funções auxiliares (formatacao)
  App.tsx        controla qual tela aparece e guarda as transações
  main.tsx       ponto de entrada
  estilos.css    estilos globais
public/          favicon e ícones
```

## Telas

| Tela | O que faz |
|------|-----------|
| Login | entrar ou criar conta, mostrar/ocultar senha, "Lembrar de mim" e "Esqueci minha senha" (só no login) |
| Painel | visão geral das finanças |
| Transações | lista as transações do usuário |

## Como funciona a navegação

Não há rotas nem URLs por tela. O `App.tsx` guarda a tela atual em um estado (`login`, `dashboard` ou `transactions`) e mostra o menu lateral junto com a tela escolhida, exceto no login.

## Integração com o back-end

Ainda não está integrado. A API do Finanças Lite (Java + Spring Boot, em `http://localhost:8080`) está em outro projeto e será consumida por este front em uma próxima etapa.

## O que ainda NÃO existe

- Backend / API conectada — as transações vêm de `dados/transacoesExemplo`.
- Autenticação real — o login só troca de tela, sem validar usuário e senha.
- Persistência — os dados voltam ao padrão ao recarregar a página.
- Finalziar as demais páginas.