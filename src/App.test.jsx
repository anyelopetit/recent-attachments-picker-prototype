import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'

beforeEach(() => {
  window.localStorage.clear()
})

async function openRecentPicker(user) {
  await user.click(screen.getByRole('button', { name: /attach file/i }))
  await user.click(screen.getByRole('menuitem', { name: /choose recent/i }))
  await screen.findByRole('dialog', { name: /pick files already uploaded/i })
  await waitFor(() => expect(screen.queryByLabelText(/loading recent attachments/i)).not.toBeInTheDocument())
}

describe('Recent attachments picker prototype', () => {
  it('filters recent attachments by filename', async () => {
    const user = userEvent.setup()
    render(<App />)

    await openRecentPicker(user)
    await user.type(screen.getByLabelText(/search by filename/i), 'pricing')

    expect(screen.getByText('wholesale-pricing-sheet.pdf')).toBeInTheDocument()
    expect(screen.queryByText('spring-sizing-chart.png')).not.toBeInTheDocument()
  })

  it('adds selected recent attachments to the draft', async () => {
    const user = userEvent.setup()
    render(<App />)

    await openRecentPicker(user)
    await user.click(screen.getByRole('button', { name: /spring-sizing-chart.png/i }))
    await user.click(screen.getByRole('button', { name: /add selected/i }))

    const tray = screen.getByLabelText(/draft attachments/i)
    expect(within(tray).getByText('spring-sizing-chart.png')).toBeInTheDocument()
  })

  it('removes an attachment from the draft', async () => {
    const user = userEvent.setup()
    render(<App />)

    await openRecentPicker(user)
    await user.click(screen.getByRole('button', { name: /spring-sizing-chart.png/i }))
    await user.click(screen.getByRole('button', { name: /add selected/i }))
    await user.click(screen.getByRole('button', { name: /remove spring-sizing-chart.png/i }))

    expect(screen.queryByLabelText(/draft attachments/i)).not.toBeInTheDocument()
  })

  it('marks duplicate recent attachments as already attached', async () => {
    const user = userEvent.setup()
    render(<App />)

    await openRecentPicker(user)
    await user.click(screen.getByRole('button', { name: /spring-sizing-chart.png/i }))
    await user.click(screen.getByRole('button', { name: /add selected/i }))
    await openRecentPicker(user)

    const results = screen.getByLabelText(/recent upload results/i)
    const duplicateCard = within(results).getByRole('button', { name: /spring-sizing-chart.png/i })
    expect(within(duplicateCard).getByText('Attached')).toBeInTheDocument()
  })

  it('shows unsupported local file type feedback', async () => {
    const user = userEvent.setup({ applyAccept: false })
    render(<App />)
    const unsupportedFile = new File(['demo'], 'clip.mov', { type: 'video/quicktime' })

    await user.click(screen.getByRole('button', { name: /attach file/i }))
    await user.upload(document.querySelector('input[type="file"]'), unsupportedFile)

    expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument()
  })

  it('shows too-large local file feedback', async () => {
    const user = userEvent.setup()
    render(<App />)
    const largeFile = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'huge.pdf', { type: 'application/pdf' })

    await user.click(screen.getByRole('button', { name: /attach file/i }))
    await user.upload(document.querySelector('input[type="file"]'), largeFile)

    expect(screen.getByText(/too large/i)).toBeInTheDocument()
  })

  it('persists a valid local upload in the client-side recent list', async () => {
    vi.setSystemTime(new Date('2026-06-17T12:00:00Z'))
    const user = userEvent.setup()
    render(<App />)
    const file = new File(['hello'], 'local-reference.txt', { type: 'text/plain', lastModified: 123 })

    await user.click(screen.getByRole('button', { name: /attach file/i }))
    await user.upload(document.querySelector('input[type="file"]'), file)
    await openRecentPicker(user)

    const results = screen.getByLabelText(/recent upload results/i)
    expect(within(results).getByText('local-reference.txt')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('sends the message into the chat with its attachments and clears the draft', async () => {
    const user = userEvent.setup()
    render(<App />)

    await openRecentPicker(user)
    await user.click(screen.getByRole('button', { name: /spring-sizing-chart.png/i }))
    await user.click(screen.getByRole('button', { name: /add selected/i }))
    await user.clear(screen.getByLabelText(/^message$/i))
    await user.type(screen.getByLabelText(/^message$/i), 'Here is the chart you asked for.')
    await user.click(screen.getByRole('button', { name: /send demo/i }))

    const conversation = screen.getByLabelText(/conversation preview/i)
    expect(within(conversation).getByText('Here is the chart you asked for.')).toBeInTheDocument()
    expect(within(conversation).getByText('spring-sizing-chart.png')).toBeInTheDocument()
    expect(screen.queryByLabelText(/draft attachments/i)).not.toBeInTheDocument()
  })
})
