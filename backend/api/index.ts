import { createApp } from '../src/app'

// Ponto de entrada usado pelo Vercel (Serverless Function). Ao contrário de
// src/index.ts (usado em desenvolvimento local com `npm run dev`), aqui não
// chamamos app.listen() — o Vercel invoca este handler diretamente a cada
// pedido. Todos os pedidos chegam aqui graças ao rewrite em vercel.json.
const app = createApp()

export default app
