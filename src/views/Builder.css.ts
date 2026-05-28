import { style } from '@vanilla-extract/css'
import { border, gold, muted, panel, parchment } from '../theme_tokens'

export const builder = style({ display: 'flex', flexDirection: 'column', gap: 12 })
export const deck = style({ display: 'grid', gap: 12 })
/** Level min/max selects in concept headers — matches `ctrl.label` / small buttons */
export const level_input = style({
  width: 54,
  background: panel,
  color: parchment,
  border: `1px solid ${border}`,
  borderRadius: 4,
  fontSize: 13,
  padding: '2px 6px',
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
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
})

/** Two affix cells per row; stripe alternates by visual row, not grid child index */
export const affix_row = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '6px 12px',
  borderRadius: 4,
  selectors: {
    '&:nth-child(odd)': { backgroundColor: 'rgba(255, 255, 255, 0.06)' },
  },
})

export const affix_label = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 6,
  padding: '4px 6px',
  fontSize: 12,
  color: parchment,
  cursor: 'pointer',
  minWidth: 0,
  selectors: {
    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.12)' },
  },
})

export const affix_text = style({
  flex: 1,
  minWidth: 0,
  whiteSpace: 'pre-line',
  overflowWrap: 'anywhere',
})

export const req = style({ color: muted, fontSize: 11, whiteSpace: 'nowrap' })

export const output = style({
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
  minHeight: 67,
})

export const regex_box_copyable = style({
  cursor: 'pointer',
  ':hover': { borderColor: gold },
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
