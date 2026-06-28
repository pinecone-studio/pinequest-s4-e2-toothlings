import { useState, useEffect } from 'react'
import { getVolunteerDentists, type VolunteerDentist } from './api'

type State = { data: VolunteerDentist[]; loading: boolean; error: string | null }

export const useVolunteerDentists = () => {
  const [state, setState] = useState<State>({ data: [], loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    getVolunteerDentists()
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }) })
      .catch((err: unknown) => { if (!cancelled) setState({ data: [], loading: false, error: String(err) }) })
    return () => { cancelled = true }
  }, [])

  return state
}
