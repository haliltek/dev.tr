import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import Link from './utilities/Link';
import { PageContainer } from './utilities';
import { Button, ButtonVariant } from './buttons/Button';
import { cloudinaryCharm404 } from '../lib/image';
import { Image } from './image/Image';
import { squadCategoriesPaths, webappUrl } from '../lib/constants';

interface Custom404Props {
  children?: ReactNode;
  /**
   * Opt in to the secondary recovery nav. Off by default: this component
   * also renders inside the post modal, the agent side pane and the
   * extension new tab, where a full-site nav is the wrong furniture and
   * navigating away is not what the surface wants.
   */
  showRecoveryLinks?: boolean;
}

// Absolute, because this component reaches the browser extension through
// BasePostContent, where a root-relative href resolves against
// chrome-extension://<id>/ and dies.
const recoveryLinks = [
  { label: 'Keşfet', href: `${webappUrl}posts` },
  { label: 'Etiketler', href: `${webappUrl}tags` },
  { label: 'Kaynaklar', href: `${webappUrl}sources` },
  {
    label: "Squad'lar",
    href: `${webappUrl}${squadCategoriesPaths.discover.substring(1)}`,
  },
];

export default function Custom404({
  children,
  showRecoveryLinks = false,
}: Custom404Props): ReactElement {
  return (
    <PageContainer
      className="min-h-page !items-center justify-center"
      data-testid="notFound"
    >
      {children}
      <div className="flex w-full max-w-[26.25rem] flex-col items-center gap-6 text-center">
        <Image
          className="h-40 w-40 object-contain"
          src={cloudinaryCharm404}
          alt="404 - Sayfa bulunamadı"
          loading="lazy"
        />
        <h1 className="font-bold typo-large-title">Burada ne arıyorsun?</h1>
        <p className="text-text-tertiary typo-callout">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Link href="/" passHref>
          <Button tag="a" variant={ButtonVariant.Primary}>
            Ana sayfaya dön
          </Button>
        </Link>

        {showRecoveryLinks && (
          <nav aria-label="Gidebileceğiniz diğer yerler">
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {recoveryLinks.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-text-tertiary underline typo-footnote hover:text-text-primary"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </PageContainer>
  );
}
