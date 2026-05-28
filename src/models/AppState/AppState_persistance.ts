import type { AppState, Build } from "./AppState_types"

const KEY = 'poe2-regex-pal:v4'

type Persisted = Pick<AppState, 'builds' | 'active_build_id' | 'active_tab_id'>

const is_record = (d: unknown): d is Record<string, unknown> =>
    typeof d === 'object' && d !== null

const is_saved_state = (d: unknown): d is Persisted =>
    is_record(d) &&
    Array.isArray(d['builds']) &&
    typeof d['active_build_id'] === 'string' &&
    typeof d['active_tab_id'] === 'string'

export const load_state = (fallback: AppState): AppState => {
    const raw = localStorage.getItem(KEY)
    if (raw === null) return fallback
    try {
        const data: unknown = JSON.parse(raw)
        if (!is_saved_state(data)) return fallback
        return {
            builds: data.builds,
            active_build_id: data.active_build_id,
            active_tab_id: data.active_tab_id,
            picker_open: false,
        }
    } catch {
        return fallback
    }
}

export const save_state = (state: AppState): void => {
    const payload: Persisted = {
        builds: state.builds,
        active_build_id: state.active_build_id,
        active_tab_id: state.active_tab_id,
    }
    localStorage.setItem(KEY, JSON.stringify(payload))
}

export const export_build = (state: AppState): string => {
    const build = state.builds.find((b) => b.id === state.active_build_id)
    return JSON.stringify(build ?? null, null, 2)
}

// Shallow validation of a pasted build. Trusts nested config shape (our own format).
const is_build = (d: unknown): d is Build =>
    is_record(d) && typeof d['name'] === 'string' && Array.isArray(d['tabs'])

export const parse_build = (json: string): Build | null => {
    try {
        const data: unknown = JSON.parse(json)
        return is_build(data) ? data : null
    } catch {
        return null
    }
}