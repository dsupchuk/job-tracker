import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * WCAG 2.1 AA wants 4.5:1 for body text. The palette is written in oklch, so
 * this converts to linear sRGB and checks every pair the interface actually
 * puts together — in both themes, because a token that passes on paper can
 * fail once the ground flips.
 */
const AA_NORMAL_TEXT = 4.5

// Read as a file rather than imported: the point is to audit the tokens as
// they are authored, before any build step touches them.
const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')

function tokensIn(selector: string): Record<string, string> {
  const block = new RegExp(`${selector}\\s*\\{([^}]*)\\}`).exec(css)
  if (!block?.[1]) throw new Error(`No ${selector} block in index.css`)

  return Object.fromEntries(
    [...block[1].matchAll(/--([\w-]+):\s*([^;]+);/g)].map((match) => [
      match[1] as string,
      match[2] as string,
    ]),
  )
}

function oklchToLinearRgb(token: string): [number, number, number] {
  const parsed = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/.exec(token.trim())
  if (!parsed) throw new Error(`Not an oklch colour: ${token}`)

  const lightness = parsed[2] === '%' ? Number(parsed[1]) / 100 : Number(parsed[1])
  const chroma = Number(parsed[3])
  const hue = (Number(parsed[4]) * Math.PI) / 180

  const a = chroma * Math.cos(hue)
  const b = chroma * Math.sin(hue)

  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3

  const clamp = (value: number) => Math.min(Math.max(value, 0), 1)
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}

function luminance(token: string): number {
  const [r, g, b] = oklchToLinearRgb(token)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(foreground: string, background: string): number {
  const [high, low] = [luminance(foreground), luminance(background)].sort((a, b) => b - a) as [
    number,
    number,
  ]
  return (high + 0.05) / (low + 0.05)
}

/** Every foreground/background combination the interface actually renders. */
const PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['content', 'surface'],
  ['content', 'ground'],
  ['content', 'surface-muted'],
  ['content-muted', 'surface'],
  ['content-muted', 'ground'],
  ['content-muted', 'surface-muted'],
  // Brass: the Offer label, links, and the primary button's own text.
  ['brand', 'surface'],
  ['brand', 'ground'],
  ['brand-contrast', 'brand'],
  ['danger', 'surface'],
  ['danger', 'ground'],
  // Inverted chips: the active stage filter and the selected nav item.
  ['surface', 'content'],
]

describe.each([
  ['light', ':root'],
  ['dark', '\\.dark'],
])('%s theme contrast', (_name, selector) => {
  const tokens = tokensIn(selector)

  it.each(PAIRS)('%s on %s clears AA for body text', (foreground, background) => {
    const fg = tokens[foreground]
    const bg = tokens[background]
    expect(fg, `missing --${foreground}`).toBeDefined()
    expect(bg, `missing --${background}`).toBeDefined()

    expect(contrast(fg as string, bg as string)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT)
  })
})
