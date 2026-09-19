import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import Link from '../../../utilities/Link';
import { FeedSettingsEditContext } from '../FeedSettingsEditContext';
import { Button } from '../../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../buttons/common';
import { LockIcon, StarIcon, TrashIcon, VIcon } from '../../../icons';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../typography/Typography';
import { webappUrl } from '../../../../lib/constants';
import { TextField } from '../../../fields/TextField';
import { EmojiPicker } from '../../../fields/EmojiPicker';
import { Divider } from '../../../utilities';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { ColorName } from '../../../../styles/colors';
import useProfileForm from '../../../../hooks/useProfileForm';
import { FeedType } from '../../../../graphql/feed';
import { usePlusSubscription, useToastNotification } from '../../../../hooks';
import { Tooltip } from '../../../tooltip/Tooltip';
import { Dropdown } from '../../../fields/Dropdown';
import { useSettingsContext } from '../../../../contexts/SettingsContext';
import {
  HighlightsPlacement,
  SidebarSettingsFlags,
} from '../../../../graphql/settings';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent, Origin } from '../../../../lib/log';
import { labels } from '../../../../lib';

const highlightsPlacementOptions = [
  { value: HighlightsPlacement.Default, label: 'Varsayılan' },
  { value: HighlightsPlacement.Pinned, label: 'En üste sabitle' },
  { value: HighlightsPlacement.Disabled, label: 'Devre dışı' },
];

export const FeedSettingsGeneralSection = (): ReactElement => {
  const { setData, data, feed, onDelete, editFeedSettings } = useContext(
    FeedSettingsEditContext,
  );
  const { user } = useAuthContext();
  const { updateUserProfile } = useProfileForm();
  const isMainFeed = feed?.type === FeedType.Main;
  const isCustomFeed = feed?.type === FeedType.Custom;
  const { isPlus } = usePlusSubscription();
  const { flags, updateFlag } = useSettingsContext();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();

  const isDefaultFeed = isMainFeed
    ? user.defaultFeedId === null
    : user.defaultFeedId === feed.id;

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Typography bold type={TypographyType.Body}>
            Feed adı
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            {isMainFeed && isPlus ? (
              <span>
                Özel bir feed adı mı istiyorsunuz? İstediğiniz zaman yeni bir feed{' '}
                <Link href={`${webappUrl}feeds/new`}>
                  <a className="underline">oluşturabilirsiniz</a>
                </Link>
                !
              </span>
            ) : (
              'Feed\'inizin odağını yansıtan bir ad seçin.'
            )}
          </Typography>
        </div>
        {isMainFeed && (
          <TextField
            className={{
              container:
                'pointer-events-none w-full text-text-quaternary tablet:max-w-70',
            }}
            defaultValue={feed.flags?.name}
            name="name"
            type="text"
            inputId="feedName"
            label="Senin İçin (For You)"
            rightIcon={<LockIcon />}
            disabled
            readOnly
          />
        )}
        {isCustomFeed && (
          <TextField
            className={{
              container: 'w-full tablet:max-w-70',
            }}
            defaultValue={feed.flags?.name}
            name="name"
            type="text"
            inputId="feedName"
            label="Feed adını girin"
            required
            maxLength={50}
            valueChanged={(value) => setData({ name: value })}
          />
        )}
      </div>
      {isCustomFeed && (
        <EmojiPicker
          value={data.icon || ''}
          onChange={(emoji) => setData({ icon: emoji })}
          label="Bir simge seçin"
        />
      )}
      {(isPlus || isMainFeed) && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Typography bold type={TypographyType.Body}>
              Varsayılan feed olarak ayarla
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              daily.dev'i her açtığınızda ilk gördüğünüz feed bu olsun.
            </Typography>
          </div>
          {isCustomFeed && (
            <Button
              className={classNames(isDefaultFeed ? 'w-44' : 'w-40')}
              type="button"
              pressed
              size={ButtonSize.Small}
              color={isDefaultFeed ? ColorName.Avocado : undefined}
              variant={
                isDefaultFeed ? ButtonVariant.Tertiary : ButtonVariant.Secondary
              }
              icon={isDefaultFeed ? <VIcon /> : <StarIcon />}
              onClick={async () =>
                editFeedSettings(() =>
                  updateUserProfile({
                    defaultFeedId: isDefaultFeed ? null : feed.id,
                  }),
                )
              }
            >
              {isDefaultFeed ? 'Varsayılan feed yapıldı' : 'Varsayılan yap'}
            </Button>
          )}
          {isMainFeed && (
            <Tooltip
              visible={isDefaultFeed}
              content="Ana feed'iniz zaten varsayılan feed'iniz"
              side="bottom"
            >
              <div className={classNames(isDefaultFeed ? 'w-44' : 'w-40')}>
                <Button
                  type="button"
                  pressed
                  size={ButtonSize.Small}
                  color={isDefaultFeed ? ColorName.Avocado : undefined}
                  variant={
                    user.defaultFeedId === null
                      ? ButtonVariant.Tertiary
                      : ButtonVariant.Secondary
                  }
                  icon={isDefaultFeed ? <VIcon /> : <StarIcon />}
                  disabled={user.defaultFeedId === null}
                  onClick={async () => {
                    editFeedSettings(() =>
                      updateUserProfile({
                        defaultFeedId: null,
                      }),
                    );
                  }}
                >
                  {isDefaultFeed ? 'Varsayılan feed yapıldı' : 'Varsayılan yap'}
                </Button>
              </div>
            </Tooltip>
          )}
        </div>
      )}
      <Divider className="my-1 bg-border-subtlest-tertiary" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Typography bold type={TypographyType.Body}>
            Gündemdekiler (Happening Now) konumu
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Gündemdekiler kartının feed'inizde nerede görüneceğini seçin veya tamamen
            gizleyin.
          </Typography>
        </div>
        <Dropdown
          className={{ container: 'w-full tablet:max-w-70' }}
          selectedIndex={Math.max(
            highlightsPlacementOptions.findIndex(
              (option) =>
                option.value ===
                (flags?.highlightsPlacement ?? HighlightsPlacement.Default),
            ),
            0,
          )}
          options={highlightsPlacementOptions.map((option) => option.label)}
          onChange={async (_, index) => {
            const next = highlightsPlacementOptions[index].value;
            await updateFlag(SidebarSettingsFlags.Highlights, next);

            displayToast(
              labels.feed.settings.globalPreferenceNotice.highlightsPlacement,
            );

            logEvent({
              event_name: LogEvent.SetHighlightsPlacement,
              target_id: next,
              extra: JSON.stringify({
                origin: Origin.Settings,
              }),
            });
          }}
        />
      </div>
      {isCustomFeed && (
        <>
          <Divider className="my-1 bg-border-subtlest-tertiary" />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Typography bold type={TypographyType.Body}>
                Feed'i sil
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Bu feed'i ve tüm ayarlarını kalıcı olarak silin. Bu işlem geri
                alınamaz.
              </Typography>
            </div>
            <Button
              className="w-40"
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Float}
              icon={<TrashIcon />}
              onClick={onDelete}
            >
              Feed'i sil
            </Button>
          </div>
        </>
      )}
    </>
  );
};
