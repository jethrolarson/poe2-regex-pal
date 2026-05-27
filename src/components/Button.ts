import { addClass, hx, type Component } from '@fun-land/fun-web'
import * as css from './Button.css'

export const Button: Component<{
  readonly label: string
  readonly variant?: 'primary' | 'secondary'
  readonly onclick: () => void
}> = (signal, { label, variant = 'primary', onclick }) =>
    addClass(css.Button, variant === 'primary' ? css.primary : css.secondary)(
      hx('button', { signal, on: { click: onclick } }, [label]))
