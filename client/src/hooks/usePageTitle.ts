import { useEffect } from 'react'

export function usePageTitle(subtitle: string) {
  useEffect(() => {
    document.title = `Honey Nest — ${subtitle}`
    return () => { document.title = 'Honey Nest' }
  }, [subtitle])
}
