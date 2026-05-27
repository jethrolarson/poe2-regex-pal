import { style } from '@vanilla-extract/css'
import { background_color, border, gold, interactive_color, muted, panel, parchment, text_color } from '../theme_tokens'
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


/** Clickable title row: input reads as heading; pencil hints edit without form chrome */
export const sheet_name = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  maxWidth: '100%',
  cursor: 'text',
  ':hover': { opacity: 0.95 },
})

export const sheet_name_input = style({
  fontSize: 20,
  fontWeight: 700,
  lineHeight: 1.2,
  color: text_color,
  background: 'transparent',
  border: 'none',
  borderRadius: 0,
  padding: 0,
  margin: 0,
  minWidth: '6ch',
  maxWidth: '100%',
  fieldSizing: 'content',
  cursor: 'text',
  ':focus': {
    outline: 'none',
    borderBottom: `1px solid ${border}`,
    marginBottom: -1,
  },
  '::placeholder': { color: muted, fontWeight: 400, opacity: 0.7 },
})

export const sheet_name_edit = style({
  flexShrink: 0,
  fontSize: 15,
  lineHeight: 1,
  color: muted,
  opacity: 0.55,
  userSelect: 'none',
  selectors: {
    [`${sheet_name}:hover &, ${sheet_name}:focus-within &`]: {
      opacity: 1,
      color: gold,
    },
  },
})