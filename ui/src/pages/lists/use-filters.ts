import { useState } from "react"

const FIRST_PAGE = 1

export function useListFilters<T extends Record<string, string>>(defaults: T) {
  const [state, setState] = useState({ filters: defaults, page: FIRST_PAGE })
  const change = (key: keyof T, value: string) => setState((previous) => ({
    filters: { ...previous.filters, [key]: value }, page: FIRST_PAGE,
  }))
  const reset = () => setState({ filters: defaults, page: FIRST_PAGE })
  const setPage = (page: number) => setState((previous) => ({ ...previous, page: Math.max(FIRST_PAGE, page) }))
  const active = Object.keys(defaults).some((key) => state.filters[key].trim() !== defaults[key])
  return { ...state, change, reset, setPage, active }
}
