import React from 'react';
import type { ReactElement } from 'react';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks';
import dynamic from 'next/dynamic';
import type { NextSeoProps } from 'next-seo';

import { SubscriptionProvider } from '@dailydotdev/shared/src/lib/plus';

import { PlusUser } from '@dailydotdev/shared/src/components/PlusUser';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { GiftIcon } from '@dailydotdev/shared/src/components/icons';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { isIOSNative } from '@dailydotdev/shared/src/lib/func';
import {
  postWebKitMessage,
  WebKitMessageHandlers,
} from '@dailydotdev/shared/src/lib/ios';
import { LogEvent, TargetId } from '@dailydotdev/shared/src/lib/log';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import {
  defaultPlusInfoCopyControl,
  PlusType,
} from '@dailydotdev/shared/src/components/plus/PlusInfo';
import AccountContentSection from '../../components/layouts/SettingsLayout/AccountContentSection';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { defaultSeo, noindexSeoProps } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const UpgradeToPlus = dynamic(() =>
  import(
    /* webpackChunkName: "upgradeToPlus" */ '@dailydotdev/shared/src/components/UpgradeToPlus'
  ).then((mod) => mod.UpgradeToPlus),
);

const PlusList = dynamic(() =>
  import(
    /* webpackChunkName: "plusList" */ '@dailydotdev/shared/src/components/plus/PlusList'
  ).then((mod) => mod.PlusList),
);

const seo: NextSeoProps = {
  ...defaultSeo,
  ...getPageSeoTitles('Abonelikler'),
  ...noindexSeoProps,
};

const PlusInfo = (): ReactElement => {
  const { isPlus, plusProvider, logSubscriptionEvent, plusHref } =
    usePlusSubscription();

  return (
    <>
      <div className="flex flex-col gap-1">
        <Typography bold type={TypographyType.Body}>
          Zaten bir Plus üyesisiniz!
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {`daily.dev'i desteklediğiniz ve sunduğumuz en iyi deneyimin kilidini
          açtığınız için teşekkür ederiz. Planınızı, ödeme bilgilerinizi veya
          tercihlerinizi güncellemek için aboneliğinizi dilediğiniz zaman yönetebilirsiniz.`}
        </Typography>

        {!isIOSNative() &&
          plusProvider === SubscriptionProvider.AppleStoreKit && (
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
              className="mt-2"
            >
              Plus aboneliğiniz App Store üzerinden yönetilmektedir, yönetmek için
              lütfen App Store'u ziyaret edin
            </Typography>
          )}
      </div>

      <div className="flex gap-3">
        <Button
          tag="a"
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
          href={plusHref}
          target={
            isPlus && plusProvider === SubscriptionProvider.Paddle
              ? '_blank'
              : undefined
          }
          disabled={
            !isIOSNative() &&
            plusProvider === SubscriptionProvider.AppleStoreKit
          }
          onClick={() => {
            if (
              isIOSNative() &&
              plusProvider === SubscriptionProvider.AppleStoreKit
            ) {
              postWebKitMessage(
                WebKitMessageHandlers.IAPSubscriptionManage,
                null,
              );
            }

            logSubscriptionEvent({
              event_name: LogEvent.ManageSubscription,
              target_id: TargetId.Account,
            });
          }}
        >
          Aboneliği yönet
        </Button>
      </div>
    </>
  );
};

const GiftPlusSection = (): ReactElement => {
  const { openModal } = useLazyModal();
  const { logSubscriptionEvent } = usePlusSubscription();

  return (
    <AccountContentSection
      title="daily.dev Plus hediye et"
      description={defaultPlusInfoCopyControl[PlusType.Gift].description}
    >
      <Button
        className="mt-4 max-w-fit border-action-plus-default text-action-plus-default"
        icon={<GiftIcon size={IconSize.Small} secondary />}
        variant={ButtonVariant.Secondary}
        color={ButtonColor.Bacon}
        onClick={() => {
          logSubscriptionEvent({
            event_name: LogEvent.GiftSubscription,
            target_id: TargetId.Account,
          });
          openModal({
            type: LazyModal.GiftPlus,
          });
        }}
      >
        Hediye olarak satın al
      </Button>
    </AccountContentSection>
  );
};

const UpgradeToPlusInfo = (): ReactElement => {
  const plusCopy = defaultPlusInfoCopyControl;

  return (
    <>
      <div className="flex flex-col gap-1">
        <Typography bold type={TypographyType.Body}>
          {plusCopy[PlusType.Self].title}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {plusCopy[PlusType.Self].description}
        </Typography>
      </div>
      <UpgradeToPlus
        target={TargetId.Account}
        size={ButtonSize.Large}
        className="flex-initial self-start"
      />
      <PlusList className="!py-0" />
    </>
  );
};

const AccountManageSubscriptionPage = (): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const { isValidRegion: isPlusAvailable } = useAuthContext();

  return (
    <AccountPageContainer title="Ödeme & Abonelik">
      <div className="flex flex-col gap-6">
        <PlusUser
          iconSize={IconSize.XSmall}
          typographyType={TypographyType.Callout}
        />

        {isPlus ? <PlusInfo /> : <UpgradeToPlusInfo />}
      </div>
      {isPlusAvailable && <GiftPlusSection />}
    </AccountPageContainer>
  );
};

AccountManageSubscriptionPage.getLayout = getSettingsLayout;
AccountManageSubscriptionPage.layoutProps = { seo };

export default AccountManageSubscriptionPage;
