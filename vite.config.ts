import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Aceita ligações de outros dispositivos na mesma rede (ex: testar o
    // site a partir do telemóvel ou de outro computador via Wi-Fi), não só
    // do próprio Mac. Continua acessível em http://localhost:5173 também.
    host: true,
  },
})
