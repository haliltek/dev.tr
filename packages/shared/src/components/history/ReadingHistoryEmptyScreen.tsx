import type { ReactElement } from 'react';
import React from 'react';
import Link from '../utilities/Link';
import {
  EmptyScreenDescription,
  EmptyScreenIcon,
  EmptyScreenTitle,
} from '../EmptyScreen';
import { EyeIcon } from '../icons';
import { Button, ButtonSize } from '../buttons/Button';

function ReadingHistoryEmptyScreen(): ReactElement {
  return (
    <div className="mt-20 flex flex-1 flex-col items-center justify-center px-6">
      <EyeIcon
        className={EmptyScreenIcon.className}
        style={EmptyScreenIcon.style}
      />
      <EmptyScreenTitle>Okuma geçmişiniz boş.</EmptyScreenTitle>
      <EmptyScreenDescription>
        Feed'inize dönün ve ilginizi çeken postları okuyun. Okuduğunuz her post
        burada listelenecektir.
      </EmptyScreenDescription>
      <Link href={process.env.NEXT_PUBLIC_WEBAPP_URL ?? '/'} passHref>
        <Button tag="a" className="mt-10" size={ButtonSize.Large}>
          Feed'e geri dön
        </Button>
      </Link>
    </div>
  );
}

export default ReadingHistoryEmptyScreen;
