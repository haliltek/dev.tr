import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonVariant } from '../buttons/Button';
import { RefreshIcon, TerminalIcon } from '../icons';
import { statusPage } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';

function ConnectionError({ onRetry }: { onRetry?: () => void }): ReactElement {
  return (
    <div className="flex max-h-full w-full flex-col items-center justify-center gap-4 self-center text-center laptop:w-[21.25rem] laptop:max-w-[21.25rem]">
      <Typography type={TypographyType.LargeTitle} bold>
        Bağlantı Kesildi
      </Typography>
      <Typography
        type={TypographyType.Body}
        bold
        color={TypographyColor.Tertiary}
      >
        İnternet bağlantınızda bir problem olabilir veya sunucuya erişilemiyor. Lütfen bağlantınızı kontrol edip tekrar deneyin.
      </Typography>
      {onRetry && (
        <Button
          variant={ButtonVariant.Primary}
          className="w-full"
          icon={<RefreshIcon />}
          onClick={onRetry}
        >
          Tekrar Dene
        </Button>
      )}
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
export default ConnectionError;
