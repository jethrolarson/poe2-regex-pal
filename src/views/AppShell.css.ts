import { style } from '@vanilla-extract/css'
import { border, gold, panel, parchment } from './theme_tokens'

export const app = style({
  width: '100%',
  maxWidth: 820,
  margin: '0 auto',
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
})

export const heading = style({ color: gold, fontSize: 22, fontWeight: 700 })

export const select = style({
  background: panel,
  color: parchment,
  border: `1px solid ${border}`,
  borderRadius: 4,
  padding: '6px 8px',
  fontSize: 14,
})

export const tab_strip = style({
  display: 'flex',
  gap: 4,
  flexWrap: 'wrap',
  borderBottom: `1px solid ${border}`,
  paddingBottom: 8,
})

export const tab = style({
  background: 'transparent',
  color: parchment,
  border: `1px solid ${border}`,
  borderRadius: '4px 4px 0 0',
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: 13,
  ':hover': { borderColor: gold },
})

export const tab_active = style({ background: panel, color: gold, borderColor: gold })
