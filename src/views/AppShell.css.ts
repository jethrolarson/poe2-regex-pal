import { style } from '@vanilla-extract/css'
import { background_color, border, gold, interactive_color, panel, parchment, text_color } from '../theme_tokens'
import * as controls from './Controls.css'

export const app = style({
  width: '100%',
  maxWidth: 820,
  margin: '0 auto',
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
})

export const BuildBar = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  gap: 8,
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
  alignItems: 'baseline',
  gap: 4,
  flexWrap: 'wrap',
  borderBottom: `1px solid ${gold}`,
  paddingBottom: 0,
})

export const tab = style({
  background: 'transparent',
  color: interactive_color,
  border: `1px solid ${border}`,
  borderBottomColor: gold,
  borderRadius: '4px 4px 0 0',
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: 13,
  marginBottom: -1,
  ':hover': { borderColor: gold },
})

export const tab_active = style({
  background: background_color, color: text_color, pointerEvents: 'none', borderColor: gold, borderBottomColor: 'transparent'
})


export const build_name = style([controls.name_input, {
  fontSize: 20,
}])