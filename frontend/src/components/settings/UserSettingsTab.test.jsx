import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserSettingsTab from './UserSettingsTab'
import { UISettingsProvider } from '../../context/UISettingsContext'

// Each section is covered by its own test file; stub them so this one asserts
// the tab's composition and ordering rather than re-testing their internals.
// The factories are inlined because vi.mock is hoisted above any local helper.
vi.mock('./UserAccountSections', () => ({
  DisplayNameSection: () => <div>display-name</div>,
  EmailSection: () => <div>email</div>,
  ExplicitContentSection: () => <div>explicit</div>,
  ChangePasswordSection: () => <div>password</div>,
  DeleteAccountSection: ({ user }) => <div>delete:{user?.username}</div>,
  OPDSSection: () => <div>opds</div>,
}))

vi.mock('./UserPreferenceSections', () => ({
  ReaderSection: () => <div>reader</div>,
  LibrarySection: () => <div>library</div>,
  LanguageSection: () => <div>language</div>,
}))

vi.mock('./AppearanceSection', () => ({ default: () => <div>appearance</div> }))

vi.mock('./SectionDivider', () => ({ default: () => <hr /> }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k }),
}))

describe('UserSettingsTab', () => {
  // The groups remember their open/closed state per browser, so clear it
  // between tests or a collapse in one leaks into the next.
  beforeEach(() => localStorage.clear())

  it('renders every account and preference section', () => {
    render(<UserSettingsTab user={{ username: 'ada' }} onLogout={() => {}} />)

    for (const label of [
      'display-name',
      'email',
      'language',
      'appearance',
      'reader',
      'library',
      'explicit',
      'opds',
      'password',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  // Appearance belongs with the other presentation preferences, immediately
  // after Language, rather than in a settings tab of its own. Compare the
  // stubbed section nodes directly — the group headings contain the word
  // "appearance" too, so a substring scan over the whole tree is ambiguous.
  it('places Appearance directly after Language', () => {
    render(<UserSettingsTab user={{}} onLogout={() => {}} />)

    const order = ['language', 'appearance', 'reader'].map((label) => {
      const node = screen.getByText(label)
      // Node.compareDocumentPosition-based sort key: index within a flat list
      // of all rendered section stubs, in document order.
      return Array.from(document.querySelectorAll('div')).indexOf(node)
    })

    expect(order[0]).toBeLessThan(order[1])
    expect(order[1]).toBeLessThan(order[2])
  })

  it('passes the user through to the delete-account section', () => {
    render(<UserSettingsTab user={{ username: 'ada' }} onLogout={() => {}} />)
    expect(screen.getByText('delete:ada')).toBeInTheDocument()
  })

  it('groups the sections under collapsible category headers', () => {
    render(<UserSettingsTab user={{}} onLogout={() => {}} />)

    for (const group of [
      'userSettings.groups.profile',
      'userSettings.groups.appearance',
      'userSettings.groups.reading',
      'userSettings.groups.security',
    ]) {
      expect(screen.getByText(group)).toBeInTheDocument()
    }
  })

  // Collapsing a group hides only its own settings — the categories sit
  // side by side rather than nesting inside one another.
  it('collapses a group without affecting the others', async () => {
    const user = userEvent.setup()
    render(<UserSettingsTab user={{}} onLogout={() => {}} />)

    await user.click(screen.getByText('userSettings.groups.profile'))

    expect(screen.queryByText('display-name')).not.toBeInTheDocument()
    expect(screen.queryByText('email')).not.toBeInTheDocument()
    expect(screen.getByText('reader')).toBeInTheDocument()
    expect(screen.getByText('password')).toBeInTheDocument()
  })
})

// Demo mode: a public demo instance freezes non-admin account settings behind a
// disabled fieldset so visitors can look around without editing the account.
describe('UserSettingsTab — demo mode lockdown', () => {
  beforeEach(() => localStorage.clear())

  function renderTab(uiSettings, user) {
    return render(
      <UISettingsProvider value={uiSettings}>
        <UserSettingsTab user={user} onLogout={() => {}} />
      </UISettingsProvider>
    )
  }

  it('disables all account actions for a non-admin when demo mode is on', () => {
    const { container } = renderTab({ demo_mode: true }, { role: 'player', username: 'p' })
    expect(container.querySelector('fieldset')).toBeDisabled()
    expect(screen.getByText('userSettings.demoMode.notice')).toBeInTheDocument()
  })

  it('locks gm accounts too', () => {
    const { container } = renderTab({ demo_mode: true }, { role: 'gm', username: 'g' })
    expect(container.querySelector('fieldset')).toBeDisabled()
  })

  it('does not lock admin accounts in demo mode', () => {
    const { container } = renderTab({ demo_mode: true }, { role: 'admin', username: 'a' })
    expect(container.querySelector('fieldset')).not.toBeDisabled()
    expect(screen.queryByText('userSettings.demoMode.notice')).not.toBeInTheDocument()
  })

  it('does not lock non-admins when demo mode is off', () => {
    const { container } = renderTab({ demo_mode: false }, { role: 'player', username: 'p' })
    expect(container.querySelector('fieldset')).not.toBeDisabled()
    expect(screen.queryByText('userSettings.demoMode.notice')).not.toBeInTheDocument()
  })
})
