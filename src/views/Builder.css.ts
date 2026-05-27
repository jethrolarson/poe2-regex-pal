import { style } from '@vanilla-extract/css'
import { border, gold, muted, panel, parchment } from '../theme_tokens'

export const builder = style({ display: 'flex', flexDirection: 'column', gap: 12 })

export const level_input = style({
  width: 70,
  background: panel,
  color: parchment,
  border: `1px solid ${border}`,
  borderRadius: 4,
  padding: '4px 6px',
})

export const selection = style({
  border: `1px solid ${border}`,
  borderRadius: 4,
  padding: 10,
  background: 'rgba(0,0,0,0.2)',
})

export const selection_head = style({ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 })

export const sign_include = style({ color: '#7fb069', fontWeight: 700, fontSize: 12 })
export const sign_exclude = style({ color: '#d06b5c', fontWeight: 700, fontSize: 12 })
export const concept_label = style({ color: gold, fontSize: 14, flex: 1 })

export const affix_grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '2px 10px',
})

export const affix_label = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 12,
  color: parchment,
  cursor: 'pointer',
})

export const affix_text = style({ flex: 1 })

export const req = style({ color: muted, fontSize: 11, whiteSpace: 'nowrap' })

export const output = style({
  borderTop: `1px solid ${border}`,
  paddingTop: 12,
})

export const regex_box = style({
  background: '#100b05',
  border: `1px solid ${border}`,
  borderRadius: 4,
  padding: 10,
  fontFamily: 'monospace',
  fontSize: 13,
  color: parchment,
  wordBreak: 'break-all',
  overflowWrap: 'anywhere',
  minHeight: 40,
})

export const counter_row = style({
  display: 'flex',
  flexDirection: 'column-reverse',
  alignItems: 'flex-end',
  gap: 4,
  float: 'right',
  paddingInlineStart: 8,
})
export const counter = style({ fontSize: 12, color: muted, paddingInline: 4 })
export const counter_over = style({ color: '#d06b5c', fontWeight: 700 })
