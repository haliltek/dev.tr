import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ToggleWeekStart } from '@dailydotdev/shared/src/components/widgets/ToggleWeekStart';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TimezoneDropdown } from '@dailydotdev/shared/src/components/widgets/TimezoneDropdown';
import { getUserInitialTimezone } from '@dailydotdev/shared/src/lib/timezones';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useStreakFreeze } from '@dailydotdev/shared/src/hooks/streaks/useStreakFreeze';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { featureStreakFreeze } from '@dailydotdev/shared/src/lib/featureManagement';
import { useHasAccessToCores } from '@dailydotdev/shared/src/hooks/useCoresFeature';
import { AccountPageContainer } from '../../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../../components/layouts/SettingsLayout';
import { defaultSeo, noindexSeoProps } from '../../../next-seo';
import { getTemplatedTitle } from '../../../components/layouts/utils';
import { SettingsSwitch } from '../../../components/layouts/SettingsLayout/common';

// Combined Streaks & gamification settings. The reading-streak visibility
// toggle used to live on both this page and the separate Streaks page; they're
// now one page (the Streaks route re-exports this), so the toggle appears once
// alongside the streak time/weekend preferences.
const GamificationSettingsPage = (): ReactElement => {
  const { user } = useAuthContext();
  const {
    optOutReadingStreak,
    optOutStreakFreeze,
    isGamificationEnabled,
    isQuestExperienceEnabled,
    toggleOptOutReadingStreak,
    toggleOptOutStreakFreeze,
    toggleQuestExperience,
    toggleAllGamification,
  } = useSettingsContext();
  const { openModal } = useLazyModal();
  const hasAccessToCores = useHasAccessToCores();
  const { value: isStreakFreezeEnabled } = useConditionalFeature({
    feature: featureStreakFreeze,
    shouldEvaluate: hasAccessToCores,
  });
  const showStreakFreezeSection = hasAccessToCores && isStreakFreezeEnabled;
  const { freezesAvailable } = useStreakFreeze({
    enabled: showStreakFreezeSection,
  });

  const [userTimeZone, setUserTimeZone] = useState<string>(
    getUserInitialTimezone({ userTimezone: user?.timezone, update: true }),
  );

  return (
    <AccountPageContainer title="Seriler & oyunlaştırma">
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-2 border-b border-border-subtlest-tertiary pb-6">
          <Typography bold type={TypographyType.Subhead}>
            Oyunlaştırma özelliklerini göster
          </Typography>

          <SettingsSwitch
            name="all-gamification"
            checked={isGamificationEnabled}
            onToggle={toggleAllGamification}
          >
            Tüm oyunlaştırma özellikleri için ana anahtar. Bunu kapatmak; serileri, seviyeleri, quest'leri ve başarımları daily.dev genelinde gizler.
          </SettingsSwitch>
        </section>

        <section className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Subhead}>
            Okuma serilerini göster
          </Typography>

          <SettingsSwitch
            name="reading-streak"
            checked={!optOutReadingStreak}
            onToggle={toggleOptOutReadingStreak}
          >
            Günlük okuma serilerinizi görüntülemek veya gizlemek için değiştirin. Serileri kapatmak etkinliğinizi veya ilerlemenizi etkilemez.
          </SettingsSwitch>
        </section>

        {/* Streak freezes (merged from the former Streaks page): buy packs
            with Cores + the auto-apply toggle. Gated on Cores access and the
            streak_freeze feature. */}
        {showStreakFreezeSection && (
          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Typography bold type={TypographyType.Subhead}>
                Seri dondurucuları
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Dondurucular, kaçırılan bir okuma gününü otomatik olarak telafi eder, böylece seriniz bozulmaz. Aşağıdan Core ile paket satın alabilirsiniz.
              </Typography>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-12 border border-border-subtlest-tertiary p-4">
              <Typography bold type={TypographyType.Body}>
                {freezesAvailable} dondurucu kullanılabilir
              </Typography>
              <Button
                type="button"
                variant={ButtonVariant.Secondary}
                onClick={() =>
                  openModal({ type: LazyModal.StreakFreezePurchase })
                }
              >
                Dondurucu satın al
              </Button>
            </div>

            <SettingsSwitch
              name="auto-streak-freeze"
              checked={!optOutStreakFreeze}
              onToggle={toggleOptOutStreakFreeze}
            >
              Kaçırılan okuma günlerini telafi etmek için seri dondurucuları otomatik kullan. Bunu kapatmak, kaçırılan bir günde serinizin sıfırlanması anlamına gelir (daha sonra Core ile geri yükleyebilirsiniz).
            </SettingsSwitch>
          </section>
        )}

        {/* One switch for the whole quest experience — quests, level/XP
            progress, and achievements move together (reading streaks stay
            separate above). */}
        <section className="flex flex-col gap-2 border-b border-border-subtlest-tertiary pb-6">
          <Typography bold type={TypographyType.Subhead}>
            Quest'leri göster
          </Typography>

          <SettingsSwitch
            name="quest-experience"
            checked={isQuestExperienceEnabled}
            onToggle={toggleQuestExperience}
          >
            daily.dev genelinde quest'leri, seviye/XP ilerlemesini ve başarımları göstermek veya gizlemek için değiştirin. Bunu kapatmak ilerlemenizi etkilemez — her şeyi arka planda kazanmaya devam edersiniz.
          </SettingsSwitch>
        </section>

        {/* Streak time preferences (merged from the former Streaks page). */}
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <Typography bold type={TypographyType.Subhead}>
              Saat tercihi
            </Typography>

            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Bildirimleri doğru zamanda gönderebilmemiz için saat diliminizi ve bölgenizdeki hafta sonu başlangıcını seçin. Bu ayrıca{' '}
              <ReadingStreakIcon
                secondary
                size={IconSize.Size16}
                className="inline"
              />{' '}
              okuma serisi dondurma günlerini de etkileyecektir.
            </Typography>
          </div>

          <TimezoneDropdown
            userTimeZone={userTimeZone}
            setUserTimeZone={setUserTimeZone}
            className={{ container: '!mt-0' }}
          />
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <Typography bold type={TypographyType.Subhead}>
              Hafta sonu günleri
            </Typography>

            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Bu ayar; kişiselleştirilmiş bülteni, okuma hatırlatıcılarını ve okuma serisi dondurma günlerini etkileyecektir.
            </Typography>
          </div>

          <ToggleWeekStart />
        </section>
      </div>
    </AccountPageContainer>
  );
};

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Seriler & oyunlaştırma'),
  ...noindexSeoProps,
};

GamificationSettingsPage.getLayout = getSettingsLayout;
GamificationSettingsPage.layoutProps = { seo };

export default GamificationSettingsPage;
