import type { AppState } from './app_state'

const KEY = 'poe2-regex-pal:v1'

const is_record = (d: unknown): d is Record<string, unknown> =>
  typeof d === 'object' && d !== null

// Shallow guard — enough to reject gross corruption / old shapes. The data is
// our own, so we trust the nested structure rather than deep-validating it.
const is_app_state = (d: unknown): d is AppState =>
  is_record(d) &&
  Array.isArray(d['builds']) &&
  typeof d['active_build_id'] === 'string' &&
  typeof d['active_tab_id'] === 'string'

export const load_state = (fallback: AppState): AppState => {
  const raw = localStorage.getItem(KEY)
  if (raw === null) return fallback
  try {
    const data: unknown = JSON.parse(raw)
    return is_app_state(data) ? data : fallback
  } catch {
    return fallback
  }
}

export const save_state = (state: AppState): void => {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export const export_build = (state: AppState): string => {
  const build = state.builds.find((b) => b.id === state.active_build_id)
  return JSON.stringify(build ?? null, null, 2)
}
