import { addClass, hx, type Component } from '@fun-land/fun-web'
import * as css from './Button.css'

type ButtonVariant = 'primary' | 'secondary'
type ButtonSize = 'default' | 'small'

const variant_class = (variant: ButtonVariant, size: ButtonSize) => {
  if (variant === 'primary') return size === 'small' ? css.primary_small : css.primary
  return size === 'small' ? css.secondary_small : css.secondary
}

export const Button: Component<{
  readonly label: string
  readonly variant?: ButtonVariant
  readonly size?: ButtonSize
  readonly onclick: () => void
}> = (signal, { label, variant = 'primary', size = 'default', onclick }) =>
  addClass(css.Button, variant_class(variant, size))(
    hx('button', { signal, on: { click: onclick } }, [label]),
  )
