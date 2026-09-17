import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonVariant } from '../buttons/Button';
import { TerminalIcon, TwitterIcon } from '../icons';
import { statusPage, twitter } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';
import { cloudinaryCharmSomethingWentWrong } from '../../lib/image';
import { Image } from '../image/Image';

function ServerError(): ReactElement {
  return (
    <div className="flex max-h-full w-full flex-col items-center justify-center gap-4 self-center text-center laptop:w-[21.25rem] laptop:max-w-[21.25rem]">
      <Image
        className="h-40 w-40 object-contain"
        src={cloudinaryCharmSomethingWentWrong}
        alt="daily.dev charm — something went wrong"
        loading="lazy"
      />
      <Typography type={TypographyType.LargeTitle} bold>
        Geçici Bir Kesinti Yaşanıyor
      </Typography>
      <Typography
        type={TypographyType.Body}
        bold
        color={TypographyColor.Tertiary}
      >
        Mühendislerimiz durumu inceliyor. Sayfayı yenilemeyi deneyebilir veya canlı sistem durumu sayfamızdan servisleri takip edebilirsiniz.
      </Typography>
      <Button
        variant={ButtonVariant.Primary}
        className="w-full"
        onClick={() => {
          if (typeof window !== 'undefined') window.location.reload();
        }}
      >
        Sayfayı Yenile
      </Button>
      <Button
        variant={ButtonVariant.Subtle}
        className="w-full"
        icon={<TerminalIcon />}
        href={statusPage}
        tag="a"
      >
        Sistem Durumunu Kontrol Et
      </Button>
    </div>
  );
}
export default ServerError;
