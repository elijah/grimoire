import { useTranslation } from 'react-i18next'
import {
  DisplayNameSection,
  EmailSection,
  ExplicitContentSection,
  ChangePasswordSection,
  DeleteAccountSection,
  OPDSSection,
} from './UserAccountSections'
import { ReaderSection, LibrarySection, LanguageSection } from './UserPreferenceSections'
import AppearanceSection from './AppearanceSection'
import ActiveSessionsSection from './ActiveSessionsSection'
import CollapsibleSection from './CollapsibleSection'
import SectionDivider from './SectionDivider'
import DemoModeBanner from './DemoModeBanner'
import { useUISettings } from '../../context/UISettingsContext'

/**
 * The account settings tab, grouped into a handful of collapsible categories.
 *
 * Everything still lives on one page — the groups only give the page structure
 * so a specific setting is findable without reading the whole thing. Grouping
 * is deliberately one level deep: a category holds settings directly, never
 * further sub-categories.
 */
export default function UserSettingsTab({ user, onLogout }) {
  const { t } = useTranslation()
  const { demo_mode } = useUISettings()
  // In demo mode, non-admin accounts can view but not change anything here.
  const locked = demo_mode && user?.role !== 'admin'

  return (
    <div>
      {locked && <DemoModeBanner />}
      {/* A disabled fieldset natively disables every nested input and button. */}
      <fieldset disabled={locked} style={{ border: 'none', margin: 0, padding: 0, minWidth: 0 }}>
        <CollapsibleSection
          title={t('userSettings.groups.profile')}
          description={t('userSettings.groups.profileDesc')}
          storageKey="grimoire:settings:account:profile"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <DisplayNameSection />
            <SectionDivider />
            <EmailSection />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title={t('userSettings.groups.appearance')}
          description={t('userSettings.groups.appearanceDesc')}
          storageKey="grimoire:settings:account:appearance"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <LanguageSection />
            <SectionDivider />
            <AppearanceSection />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title={t('userSettings.groups.reading')}
          description={t('userSettings.groups.readingDesc')}
          storageKey="grimoire:settings:account:reading"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <ReaderSection />
            <SectionDivider />
            <LibrarySection />
            <SectionDivider />
            <ExplicitContentSection />
            <OPDSSection />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title={t('userSettings.groups.security')}
          description={t('userSettings.groups.securityDesc')}
          storageKey="grimoire:settings:account:security"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <ChangePasswordSection />
            <SectionDivider />
            <ActiveSessionsSection />
            <SectionDivider />
            <DeleteAccountSection user={user} onLogout={onLogout} />
          </div>
        </CollapsibleSection>
      </fieldset>
    </div>
  )
}
