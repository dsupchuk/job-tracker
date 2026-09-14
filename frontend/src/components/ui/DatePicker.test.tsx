import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { DatePicker } from './DatePicker'

function Harness({
  initial = '',
  onChange,
  ...rest
}: {
  initial?: string
  onChange?: (value: string) => void
  min?: string
  max?: string
}) {
  const [value, setValue] = useState(initial)
  return (
    <>
      <DatePicker
        value={value}
        onChange={(next) => {
          setValue(next)
          onChange?.(next)
        }}
        inputId="applied-on"
        {...rest}
      />
      <button type="button">After</button>
    </>
  )
}

const trigger = () => screen.getByRole('button', { name: /choose a date|\d/i })
const cell = (label: string | RegExp) => screen.getByRole('gridcell', { name: label })

describe('DatePicker trigger', () => {
  it('describes its popup to assistive technology', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const button = trigger()
    expect(button).toHaveAttribute('aria-haspopup', 'dialog')
    expect(button).toHaveAttribute('aria-expanded', 'false')

    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('DatePicker keyboard model', () => {
  it('moves by day, week, month and to the week bounds', async () => {
    const user = userEvent.setup()
    render(<Harness initial="2026-09-14" />)
    await user.click(trigger())

    // 14 September 2026 is a Monday.
    expect(cell(/14 September 2026/)).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(cell(/15 September 2026/)).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    expect(cell(/22 September 2026/)).toHaveFocus()

    await user.keyboard('{Home}')
    expect(cell(/21 September 2026/)).toHaveFocus()

    await user.keyboard('{End}')
    expect(cell(/27 September 2026/)).toHaveFocus()

    await user.keyboard('{PageUp}')
    expect(cell(/27 August 2026/)).toHaveFocus()

    await user.keyboard('{PageDown}{PageDown}')
    expect(cell(/27 October 2026/)).toHaveFocus()
  })

  it('selects with Enter and reports the ISO date', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Harness initial="2026-09-14" onChange={onChange} />)

    await user.click(trigger())
    await user.keyboard('{ArrowRight}{Enter}')

    expect(onChange).toHaveBeenCalledWith('2026-09-15')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('closes on Escape without selecting, and gives focus back to the trigger', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Harness initial="2026-09-14" onChange={onChange} />)

    const button = trigger()
    await user.click(button)
    await user.keyboard('{ArrowRight}{Escape}')

    expect(onChange).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(button).toHaveFocus()
  })

  it('keeps Tab inside the popup while it is open', async () => {
    const user = userEvent.setup()
    render(<Harness initial="2026-09-14" />)
    await user.click(trigger())

    const dialog = screen.getByRole('dialog')
    await user.tab()
    expect(dialog).toContainElement(document.activeElement as HTMLElement)

    // Several more tabs must not escape to the button after the picker.
    await user.tab()
    await user.tab()
    expect(screen.getByRole('button', { name: 'After' })).not.toHaveFocus()
  })
})

describe('DatePicker range constraints', () => {
  it('will not move past the maximum or select beyond it', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Harness initial="2026-09-14" max="2026-09-15" onChange={onChange} />)
    await user.click(trigger())

    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}')
    expect(cell(/15 September 2026/)).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('2026-09-15')
  })

  it('marks out-of-range days as disabled', async () => {
    const user = userEvent.setup()
    render(<Harness initial="2026-09-14" max="2026-09-15" />)
    await user.click(trigger())

    expect(cell(/16 September 2026/)).toHaveAttribute('aria-disabled', 'true')
    expect(cell(/15 September 2026/)).not.toHaveAttribute('aria-disabled')
  })
})

describe('DatePicker grid semantics', () => {
  it('exposes a labelled grid with one tabbable day', async () => {
    const user = userEvent.setup()
    render(<Harness initial="2026-09-14" />)
    await user.click(trigger())

    const grid = screen.getByRole('grid')
    expect(grid).toHaveAccessibleName('September 2026')

    const tabbable = within(grid)
      .getAllByRole('gridcell')
      .filter((element) => element.getAttribute('tabindex') === '0')
    expect(tabbable).toHaveLength(1)
  })

  it('marks the selected day', async () => {
    const user = userEvent.setup()
    render(<Harness initial="2026-09-14" />)
    await user.click(trigger())

    expect(cell(/14 September 2026/)).toHaveAttribute('aria-selected', 'true')
    expect(cell(/15 September 2026/)).toHaveAttribute('aria-selected', 'false')
  })
})
