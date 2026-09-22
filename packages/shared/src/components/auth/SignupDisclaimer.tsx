import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { privacyPolicy, termsOfService } from '../../lib/constants';

interface SignupDisclaimerProps {
  className?: string;
}

function SignupDisclaimer({ className }: SignupDisclaimerProps): ReactElement {
  return (
    <p
      className={classNames(
        'w-full text-center text-text-secondary typo-caption1',
        className,
      )}
    >
      Devam ederek,{' '}
      <a
        href={termsOfService}
        target="_blank"
        rel="noopener"
        className="underline hover:no-underline"
      >
        Kullanım Koşulları
      </a>{' '}
      ve{' '}
      <a
        href={privacyPolicy}
        target="_blank"
        rel="noopener"
        className="underline hover:no-underline"
      >
        Gizlilik Politikası
      </a>
      'nı kabul etmiş olursunuz.
    </p>
  );
}

export default SignupDisclaimer;
