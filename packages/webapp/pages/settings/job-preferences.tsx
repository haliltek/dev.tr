import React, { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import type { GetStaticProps } from 'next';
import type { NextSeoProps } from 'next-seo';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Divider,
  FlexCol,
  FlexRow,
} from '@dailydotdev/shared/src/components/utilities';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { PreferenceOptionsForm } from '@dailydotdev/shared/src/components/opportunity/PreferenceOptionsForm';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { FeelingLazy } from '@dailydotdev/shared/src/features/profile/components/FeelingLazy';
import classNames from 'classnames';
import {
  ActivelyLookingIcon,
  DocsIcon,
  SemiActiveIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { RadioItem } from '@dailydotdev/shared/src/components/fields/RadioItem';
import type { DehydratedState } from '@tanstack/react-query';
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import {
  getCandidatePreferencesOptions,
  getKeywordAutocompleteOptions,
} from '@dailydotdev/shared/src/features/opportunity/queries';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { CandidateStatus } from '@dailydotdev/shared/src/features/opportunity/protobuf/user-candidate-preference';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { useUpdateQuery } from '@dailydotdev/shared/src/hooks/useUpdateQuery';
import { updateCandidatePreferencesMutationOptions } from '@dailydotdev/shared/src/features/opportunity/mutations';
import {
  useActions,
  useToastNotification,
} from '@dailydotdev/shared/src/hooks';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { UploadCVButton } from '@dailydotdev/shared/src/features/opportunity/components/UploadCVButton';
import { ClearResumeButton } from '@dailydotdev/shared/src/features/opportunity/components/ClearResumeButton';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { UploadEmploymentAgreementButton } from '@dailydotdev/shared/src/features/opportunity/components/UploadEmploymentAgreementButton';
import { ClearEmploymentAgreementButton } from '@dailydotdev/shared/src/features/opportunity/components/ClearEmploymentAgreementButton';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { defaultSeo, noindexSeoProps } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';

const seo: NextSeoProps = {
  ...defaultSeo,
  ...getPageSeoTitles('İş tercihleri'),
  ...noindexSeoProps,
};

const options = [
  {
    key: CandidateStatus.ACTIVELY_LOOKING,
    icon: <ActivelyLookingIcon size={IconSize.XLarge} />,
    title: 'Aktif olarak iş arıyorum',
    description: <>Yeni fırsatları keşfetmeye ve adım atmaya hazırım.</>,
  },
  {
    key: CandidateStatus.OPEN_TO_OFFERS,
    icon: <SemiActiveIcon size={IconSize.XLarge} />,
    title: <>Tekliflere açığım</>,
    description: <>Mevcut durumumdan memnunum, ancak olağanüstü fırsatlara açığım.</>,
  },
];

const JobPreferencesPage = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { completeAction } = useActions();
  const [option, setOption] = useState<CandidateStatus | null>(null);

  const opts = getCandidatePreferencesOptions(user?.id ?? '');
  const updateQuery = useUpdateQuery(opts);

  const { data: preferences, isPending } = useQuery(opts);
  const { mutate: updatePreferences } = useMutation({
    ...updateCandidatePreferencesMutationOptions(updateQuery, () => {
      completeAction(ActionType.UserCandidatePreferencesSaved);
      logEvent({
        event_name: LogEvent.SelectCandidateAvailability,
        target_id: preferences?.status?.toString(),
      });
    }),
    onError: () => {
      displayToast('Tercihler güncellenemedi. Lütfen tekrar deneyin.');
    },
  });

  const modeDisabled = preferences?.status === CandidateStatus.DISABLED;

  useEffect(() => {
    if (!preferences) {
      return;
    }

    setOption(preferences?.status ?? null);
  }, [preferences]);

  if (!preferences || isPending) {
    return (
      <AccountPageContainer title="İş tercihleri">
        <Loader />
      </AccountPageContainer>
    );
  }

  return (
    <AccountPageContainer title="İş tercihleri">
      <div className="flex flex-col gap-6">
        <FlexRow className="gap-4">
          <FlexCol className="flex-1 gap-1">
            <Typography type={TypographyType.Body}>
              <strong>Kariyer modu</strong> (beta)
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Bu özellik açık olduğunda daily.dev sizin yetenek temsilciniz gibi çalışır ve gerçek ekiplerin gerçek pozisyonlarını onayınıza sunar. İzniniz olmadan hiçbir şey paylaşılmaz. Yalnızca vaktinize değecek roller için size ulaşırız. Spam yok, baskı yok. Sizin kariyeriniz, sizin kurallarınız.
            </Typography>
          </FlexCol>
          <Switch
            inputId="career_mode"
            name="career_mode"
            compact={false}
            checked={!modeDisabled}
            onToggle={() => {
              updatePreferences({
                status: modeDisabled
                  ? CandidateStatus.OPEN_TO_OFFERS
                  : CandidateStatus.DISABLED,
              });
            }}
          />
        </FlexRow>

        {!modeDisabled && (
          <FlexCol className="gap-3">
            {options.map(({ key, icon, title, description }) => (
              <Button
                key={key}
                variant={ButtonVariant.Option}
                className={classNames(
                  '!h-auto w-auto flex-row-reverse gap-3 border border-border-subtlest-tertiary !p-3 laptop:flex-row',
                  {
                    'bg-brand-float border-brand-default': option === key,
                  },
                )}
                onClick={() => updatePreferences({ status: key })}
              >
                <RadioItem
                  className={{ content: '!pr-0' }}
                  checked={option === key}
                  readOnly
                />
                <div className="flex flex-1">
                  <div className="relative top-0.5 flex size-12 items-center justify-center rounded-10">
                    {icon}
                  </div>
                  <FlexCol className="flex-1 text-left">
                    <Typography
                      color={TypographyColor.Primary}
                      type={TypographyType.Body}
                      bold
                    >
                      {title}
                    </Typography>
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                    >
                      {description}
                    </Typography>
                  </FlexCol>
                </div>
              </Button>
            ))}
          </FlexCol>
        )}
        <Divider className="bg-border-subtlest-tertiary" />
        <FlexCol className="gap-6">
          <FlexCol>
            <Typography type={TypographyType.Body} bold>
              Eşleşme kalitesini artırın
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Geçmişinizi ve mevcut şartlarınızı ne kadar iyi anlarsak, gereksiz ilanları filtreleyip yalnızca gerçekten dikkatinize değer olanları o kadar iyi öne çıkarabiliriz.{' '}
            </Typography>
          </FlexCol>
          <div className="flex flex-1 flex-col gap-6 tablet:flex-row">
            <FlexCol className="flex-1 gap-2">
              <Typography type={TypographyType.Body} bold>
                CV Yükle
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                CV'niz yeteneklerinizi, deneyimlerinizi ve kariyer yolunuzu anlamamıza yardımcı olur, böylece size gerçekten anlamlı gelen işlerle eşleştirebiliriz. Bir pozisyona açıkça onay vermediğiniz sürece asla paylaşılmaz.
              </Typography>

              {preferences?.cv?.fileName && (
                <Typography
                  className="flex items-center gap-1"
                  type={TypographyType.Footnote}
                >
                  <DocsIcon secondary /> {preferences.cv.fileName}
                  <ClearResumeButton />
                </Typography>
              )}

              <UploadCVButton />
              <FeelingLazy />
            </FlexCol>

            <FlexCol className="flex-1 gap-2">
              <Typography type={TypographyType.Body} bold>
                İş Sözleşmesi Yükle
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                Mevcut sözleşmenizi paylaşmanız, sunacağımız pozisyonların mevcut şartlarınızı aşacağını garanti etmemizi sağlar. Bu bilgiler %100 gizli kalır ve yalnızca zamanınızı ve pazarlık gücünüzü korumak için kullanılır.
              </Typography>
              {preferences?.employmentAgreement?.fileName && (
                <Typography
                  className="flex items-center gap-1"
                  type={TypographyType.Footnote}
                >
                  <DocsIcon secondary />{' '}
                  {preferences.employmentAgreement.fileName}
                  <ClearEmploymentAgreementButton />
                </Typography>
              )}
              <UploadEmploymentAgreementButton />
            </FlexCol>
          </div>
        </FlexCol>
        <Divider className="bg-border-subtlest-tertiary" />
        <FlexCol className="gap-6">
          <Typography bold type={TypographyType.Body}>
            Olmazsa olmazlarınız
          </Typography>

          <PreferenceOptionsForm />
        </FlexCol>
      </div>
    </AccountPageContainer>
  );
};

export const getStaticProps: GetStaticProps<{
  dehydratedState: DehydratedState | null;
}> = async () => {
  const queryClient = new QueryClient();
  try {
    await queryClient.prefetchQuery(getKeywordAutocompleteOptions(''));
    const dehydratedState = dehydrate(queryClient);

    return {
      props: {
        dehydratedState,
      },
      revalidate: 300,
    };
  } catch (_e) {
    return { props: { dehydratedState: null }, revalidate: 60 };
  }
};

JobPreferencesPage.getLayout = getSettingsLayout;
JobPreferencesPage.layoutProps = { seo };

export default JobPreferencesPage;
