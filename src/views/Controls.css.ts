import { style } from '@vanilla-extract/css'
import { border, gold, panel, parchment } from '../theme_tokens'

/** Shared toolbar / form row chrome */
export const row = style({ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' })

export const label = style({ color: parchment, fontSize: 13 })

export const name_input = style({
  background: panel,
  color: parchment,
  border: `1px solid ${border}`,
  borderRadius: 4,
  padding: '6px 8px',
  fontSize: 14,
  ':focus': { borderColor: gold, outline: 'none' },
})
