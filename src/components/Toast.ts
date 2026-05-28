import { bindView, h, type Component } from '@fun-land/fun-web'
import { funState, type FunState } from '@fun-land/fun-state'
import * as css from './Toast.css'

export type Toast = {
  readonly message: string
  readonly id: number
  readonly phase: 'enter' | 'leave'
}

export type ToastState = Toast | null

const TOAST_VISIBLE_MS = 2500
const TOAST_FADE_MS = 200

let toast_seq = 0
let visible_timer: ReturnType<typeof setTimeout> | undefined
let fade_timer: ReturnType<typeof setTimeout> | undefined

const clear_toast_timers = (): void => {
  if (visible_timer !== undefined) clearTimeout(visible_timer)
  if (fade_timer !== undefined) clearTimeout(fade_timer)
  visible_timer = undefined
  fade_timer = undefined
}

export const show_toast = (toast$: FunState<ToastState>, message: string): void => {
  clear_toast_timers()
  const id = ++toast_seq
  toast$.set({ message, id, phase: 'enter' })
  visible_timer = setTimeout(() => {
    const cur = toast$.get()
    if (cur === null || cur.id !== id) return
    toast$.set({ ...cur, phase: 'leave' })
    fade_timer = setTimeout(() => {
      if (toast$.get()?.id === id) toast$.set(null)
      fade_timer = undefined
    }, TOAST_FADE_MS)
    visible_timer = undefined
  }, TOAST_VISIBLE_MS)
}

export const ToastHost: Component<{ readonly toast$: FunState<ToastState> }> = (signal, { toast$ }) =>
  bindView(signal, toast$, (_region, toast) =>
    toast === null
      ? h('div', { className: css.host, hidden: true })
      : h('div', { className: css.host, attrs: { 'aria-live': 'polite', role: 'status' } }, [
          h('div', {
            className: `${css.toast} ${toast.phase === 'leave' ? css.toast_leave : css.toast_enter}`,
          }, [toast.message]),
        ]),
  )

export const create_toast = (): FunState<ToastState> => funState<ToastState>(null)
