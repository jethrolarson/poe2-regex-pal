import { style } from '@vanilla-extract/css'

const gold = '#c8a25a'
const parchment = '#c8b89a'
const panel = '#231a0f'
const border = '#4a3a22'

export const root = style({ width: '100%', minWidth: 0 })

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

export const row = style({ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' })

export const select = style({
  background: panel,
  color: parchment,
  border: `1px solid ${border}`,
  borderRadius: 4,
  padding: '6px 8px',
  fontSize: 14,
})

export const btn = style({
  background: panel,
  color: parchment,
  border: `1px solid ${border}`,
  borderRadius: 4,
  padding: '6px 10px',
  cursor: 'pointer',
  fontSize: 13,
  ':hover': { borderColor: gold },
})

export const tab_strip = style({ display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: `1px solid ${border}`, paddingBottom: 8 })

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

export const builder = style({ display: 'flex', flexDirection: 'column', gap: 12 })

export const level_input = style({
  width: 70,
  background: panel,
  color: parchment,
  border: `1px solid ${border}`,
  borderRadius: 4,
  padding: '4px 6px',
})

export const label = style({ color: parchment, fontSize: 13 })

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

export const affix_label = style({ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: parchment, cursor: 'pointer' })

export const affix_text = style({ flex: 1 })

export const req = style({ color: '#8a7a55', fontSize: 11, whiteSpace: 'nowrap' })

export const output = style({ display: 'flex', flexDirection: 'column', gap: 6, borderTop: `1px solid ${border}`, paddingTop: 12 })

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

export const counter_row = style({ display: 'flex', alignItems: 'center', gap: 10 })
export const counter = style({ fontSize: 12, color: '#8a7a55' })
export const counter_over = style({ color: '#d06b5c', fontWeight: 700 })
