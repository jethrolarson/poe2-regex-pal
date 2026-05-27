import { hx, type Component } from '@fun-land/fun-web'

export const AppButton: Component<{
  readonly className: string
  readonly label: string
  readonly onclick: () => void
}> = (signal, { className, label, onclick }) =>
  hx('button', { signal, props: { className }, on: { click: onclick } }, [label])
