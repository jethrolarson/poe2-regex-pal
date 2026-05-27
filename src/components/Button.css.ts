import { style } from '@vanilla-extract/css'
import { border, gold, panel, text_color, interactive_color } from '../theme_tokens'

export const Button = style({
    cursor: 'pointer',
    fontSize: 13,
})

export const primary = style({
    background: panel,
    color: text_color,
    border: `1px solid ${border}`,
    borderRadius: 4,
    padding: '6px 10px',
    ':hover': { borderColor: gold },
})

export const secondary = style({
    background: 'transparent',
    border: 'none',
    color: interactive_color,
    textDecoration: 'underline',
    padding: '0',
    ':hover': { background: panel },
})