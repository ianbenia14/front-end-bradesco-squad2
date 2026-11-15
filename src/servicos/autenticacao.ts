import type { Budget, Goal, IncomeProfile, ReportSnapshot, Transaction } from "../tipos"
import { ErroApi } from "./api"
import { usuariosApi } from "./apiFinancas"
import type { Usuario as UsuarioApi } from "./apiFinancas"

// Conta e login passam pela API (back-end Spring Boot).
// O back-end ainda não devolve token: os dados do usuário (sem senha) ficam no navegador
// para manter a sessão. Os dados financeiros continuam locais até as demais telas serem integradas.

export type Usuario = {
  id: string
  name: string
  email: string
  createdAt: string
}

export type DadosUsuario = {
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
  profile: IncomeProfile
  reports: ReportSnapshot[]
}

const USERS = "saldomais:usuarios"
const SESSION = "saldomais:sessao"
const ATTEMPTS = "saldomais:tentativas"
const MAX_ATTEMPTS = 5
const LOCK_MS = 60_000

const read = <T>(storage: Storage, key: string, fallback: T): T => {
  try {
    const raw = storage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const write = (storage: Storage, key: string, value: unknown) => {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    /* armazenamento indisponível */
  }
}

export const normalizarEmail = (email: string) => email.trim().toLowerCase()
export const emailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)

export const validarSenha = (senha: string) => {
  if (senha.length < 8) return "A senha deve ter pelo menos 8 caracteres."
  if (senha.length > 72) return "A senha deve ter no máximo 72 caracteres."
  if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha))
    return "A senha deve conter letras e números."
  return ""
}

// Usuários já autenticados neste navegador (sem senha): servem para restaurar a sessão
const usuarios = () => read<Usuario[]>(localStorage, USERS, [])

const deApi = (u: UsuarioApi): Usuario => ({
  id: String(u.id),
  name: u.nome,
  email: u.email,
  createdAt: u.criadoEm,
})

const guardar = (usuario: Usuario) =>
  write(localStorage, USERS, [...usuarios().filter((u) => u.id !== usuario.id), usuario])

/** Mensagem do primeiro campo inválido, ou a mensagem geral do erro. */
const textoDoErro = (e: unknown): string => {
  if (e instanceof ErroApi) {
    const campo = e.campos ? Object.values(e.campos)[0] : undefined
    return campo ?? e.message
  }
  return e instanceof Error ? e.message : "Ocorreu um erro inesperado."
}

export const registrar = async (name: string, email: string, senha: string) => {
  const mail = normalizarEmail(email)
  if (name.trim().length < 3) throw new Error("Informe seu nome completo.")
  if (!emailValido(mail)) throw new Error("Informe um e-mail válido.")
  const erro = validarSenha(senha)
  if (erro) throw new Error(erro)
  try {
    // A renda mensal começa em 0: o cadastro do front não pede esse dado
    const criado = await usuariosApi.criar({ nome: name.trim(), email: mail, senha, rendaMensal: 0 })
    const usuario = deApi(criado)
    guardar(usuario)
    return usuario
  } catch (e) {
    if (e instanceof ErroApi && e.status === 409)
      throw new Error("Já existe uma conta com este e-mail. Faça login.", { cause: e })
    throw new Error(textoDoErro(e), { cause: e })
  }
}

export const entrar = async (email: string, senha: string) => {
  const tentativas = read<{ count: number; until: number }>(localStorage, ATTEMPTS, { count: 0, until: 0 })
  if (tentativas.until > Date.now()) {
    const s = Math.ceil((tentativas.until - Date.now()) / 1000)
    throw new Error(`Muitas tentativas. Tente novamente em ${s}s.`)
  }
  try {
    const usuario = deApi(await usuariosApi.login(normalizarEmail(email), senha))
    localStorage.removeItem(ATTEMPTS)
    guardar(usuario)
    return usuario
  } catch (e) {
    if (e instanceof ErroApi && e.status === 401) {
      const count = tentativas.count + 1
      write(localStorage, ATTEMPTS, {
        count: count >= MAX_ATTEMPTS ? 0 : count,
        until: count >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0,
      })
      throw new Error("E-mail ou senha incorretos, ou conta não cadastrada.", { cause: e })
    }
    throw new Error(textoDoErro(e), { cause: e })
  }
}

export const salvarSessao = (id: string, lembrar: boolean) => {
  sessionStorage.removeItem(SESSION)
  localStorage.removeItem(SESSION)
  write(lembrar ? localStorage : sessionStorage, SESSION, { id })
}

export const encerrarSessao = () => {
  sessionStorage.removeItem(SESSION)
  localStorage.removeItem(SESSION)
}

// Só devolve usuário se ele já tiver feito login neste navegador
export const sessaoAtual = (): Usuario | null => {
  const s =
    read<{ id: string } | null>(sessionStorage, SESSION, null) ??
    read<{ id: string } | null>(localStorage, SESSION, null)
  if (!s) return null
  return usuarios().find((u) => u.id === s.id) ?? null
}

export const dadosVazios = (): DadosUsuario => ({
  transactions: [],
  budgets: [],
  goals: [],
  profile: { salary: 0, recurring: 0, variable: 0 },
  reports: [],
})

const dadosKey = (id: string) => `saldomais:dados:${id}`

export const carregarDados = (id: string): DadosUsuario => ({
  ...dadosVazios(),
  ...read<Partial<DadosUsuario>>(localStorage, dadosKey(id), {}),
})

export const salvarDados = (id: string, dados: DadosUsuario) => write(localStorage, dadosKey(id), dados)

export const excluirDados = (id: string) => localStorage.removeItem(dadosKey(id))

// ATENÇÃO: o back-end ainda não tem rota para excluir usuário.
// Por enquanto isto só apaga os dados e a sessão deste navegador; a conta continua no banco.
export const excluirConta = (id: string) => {
  excluirDados(id)
  write(localStorage, USERS, usuarios().filter((u) => u.id !== id))
  encerrarSessao()
}