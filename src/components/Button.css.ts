import { style } from '@vanilla-extract/css'
import { border, gold, panel, parchment } from '../theme_tokens'

export const Button = style({
    background: panel,
    color: parchment,
    border: `1px solid ${border}`,
    borderRadius: 4,
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: 13,
    ':hover': { borderColor: gold },
})