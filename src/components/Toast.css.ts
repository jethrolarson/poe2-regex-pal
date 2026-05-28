import { keyframes, style } from '@vanilla-extract/css'
import { gold, panel, parchment } from '../theme_tokens'

const FADE_MS = 200

const toast_fade_in = keyframes({
  from: { opacity: 0, transform: 'translateY(-6px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
})

const toast_fade_out = keyframes({
  from: { opacity: 1, transform: 'translateY(0)' },
  to: { opacity: 0, transform: 'translateY(-6px)' },
})

export const host = style({
  position: 'fixed',
  top: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000,
  pointerEvents: 'none',
})

export const toast = style({
  background: panel,
  color: parchment,
  border: `1px solid ${gold}`,
  borderRadius: 4,
  padding: '10px 16px',
  fontSize: 14,
  boxShadow: `0 4px 16px rgba(0, 0, 0, 0.45)`,
})

export const toast_enter = style({
  animation: `${toast_fade_in} ${FADE_MS}ms ease forwards`,
})

export const toast_leave = style({
  animation: `${toast_fade_out} ${FADE_MS}ms ease forwards`,
})
