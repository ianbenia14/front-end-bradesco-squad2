// ===== ENTRADA DO APP =====
// ENTRADA DO APP: aqui o React é ligado ao <div id="root"> do index.html
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// Importa o CSS global (todas as cores e tamanhos estão nele)
import './estilos.css'

// Desenha o <App /> na página
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
