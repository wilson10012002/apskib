import { useCallback, useEffect, useState } from 'react'
import { getApiErrorMessage } from '../lib/api'

interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
}

// Hook simples para chamadas GET: trata loading/erro e evita atualizar
// estado depois de o componente ser desmontado.
export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  useEffect(() => {
    let cancelled = false

    // Reinicia o estado de loading/erro no início de cada pedido (incluindo
    // quando `deps` muda ou `reload()` é chamado). Este é o padrão oficial
    // de fetching em efeitos documentado em react.dev/learn/synchronizing-with-effects;
    // a regra `set-state-in-effect` fica desativada aqui de forma consciente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Não foi possível carregar os dados.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken])

  return { data, loading, error, reload }
}
