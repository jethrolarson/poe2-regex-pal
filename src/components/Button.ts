import { hx, type Component } from '@fun-land/fun-web'
import * as css from './Button.css'

export const Button: Component<{
  readonly label: string
  readonly onclick: () => void
}> = (signal, { label, onclick }) =>
    hx('button', { signal, props: { className: css.Button }, on: { click: onclick } }, [label])
