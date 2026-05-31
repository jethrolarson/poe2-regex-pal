import { style } from '@vanilla-extract/css'
import { border, gold, muted, parchment, picker_panel } from '../theme_tokens'

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'none',
  justifyContent: 'center',
  alignItems: 'flex-start',
  paddingTop: '8vh',
  zIndex: 50,
})

export const open = style({ display: 'flex' })

export const panel = style({
  width: 'min(640px, 92vw)',
  maxHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  background: picker_panel,
  border: `1px solid ${border}`,
  borderRadius: 6,
  overflow: 'hidden',
})

export const header = style({
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  padding: 10,
  borderBottom: `1px solid ${border}`,
})

export const search = style({
  flex: 1,
  background: '#100b05',
  color: parchment,
  border: `1px solid ${border}`,
  borderRadius: 4,
  padding: '8px 10px',
  fontSize: 14,
})

export const mode = style({ display: 'flex', gap: 4 })
export const mode_btn = style({
  background: 'transparent',
  color: parchment,
  border: `1px solid ${border}`,
  borderRadius: 4,
  padding: '6px 10px',
  cursor: 'pointer',
  fontSize: 12,
})
export const mode_active = style({ background: picker_panel, color: gold, borderColor: gold })

export const results = style({ overflowY: 'auto', padding: 6 })
export const section_title = style({
  color: muted,
  fontSize: 11,
  textTransform: 'uppercase',
  padding: '8px 8px 4px',
  letterSpacing: 0.5,
})

export const row = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: 12,
  padding: '6px 8px',
  cursor: 'pointer',
  borderRadius: 4,
  ':hover': { background: 'rgba(200,162,90,0.12)' },
})
export const row_label = style({ color: parchment, fontSize: 13, flex: '0 0 190px' })
export const row_effect = style({ color: muted, fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })
export const pseudo_tag = style({ color: muted, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', flex: '0 0 46px' })

export const empty = style({ color: muted, fontSize: 13, padding: 12 })

export const browse_toggle = style({
  color: gold,
  fontSize: 12,
  padding: '8px',
  cursor: 'pointer',
  userSelect: 'none',
  ':hover': { textDecoration: 'underline' },
})
